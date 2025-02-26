/*
 * Licensed to the Technische Universität Darmstadt under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The Technische Universität Darmstadt 
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.
 *  
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package de.tudarmstadt.ukp.clarin.webanno.brat.schema;

import static de.tudarmstadt.ukp.clarin.webanno.support.WebAnnoConst.CHAIN_TYPE;
import static java.util.Collections.emptyList;
import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.groupingBy;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.NoResultException;

import de.tudarmstadt.ukp.clarin.webanno.brat.config.BratAnnotationEditorAutoConfiguration;
import de.tudarmstadt.ukp.clarin.webanno.brat.schema.model.EntityType;
import de.tudarmstadt.ukp.clarin.webanno.brat.schema.model.RelationType;
import de.tudarmstadt.ukp.clarin.webanno.model.AnnotationFeature;
import de.tudarmstadt.ukp.clarin.webanno.model.AnnotationLayer;
import de.tudarmstadt.ukp.clarin.webanno.model.LinkMode;
import de.tudarmstadt.ukp.clarin.webanno.model.Project;
import de.tudarmstadt.ukp.dkpro.core.api.lexmorph.type.pos.POS;
import de.tudarmstadt.ukp.dkpro.core.api.syntax.type.dependency.Dependency;
import de.tudarmstadt.ukp.inception.schema.api.AnnotationSchemaService;

/**
 * <p>
 * This class is exposed as a Spring Component via
 * {@link BratAnnotationEditorAutoConfiguration#bratSchemaGenerator}.
 * </p>
 */
public class BratSchemaGeneratorImpl
    implements BratSchemaGenerator
{
    private final AnnotationSchemaService annotationService;

    public BratSchemaGeneratorImpl(AnnotationSchemaService aAnnotationService)
    {
        annotationService = aAnnotationService;
    }

    /**
     * Generates brat type definitions from the WebAnno layer definitions.
     *
     * @param aProject
     *            the project to which the layers belong
     * @param aAnnotationLayers
     *            the layers
     * @return the brat type definitions
     */
    @Override
    public Set<EntityType> buildEntityTypes(Project aProject,
            List<AnnotationLayer> aAnnotationLayers)
    {
        // Sort layers
        List<AnnotationLayer> layers = new ArrayList<>(aAnnotationLayers);
        layers.sort(comparing(AnnotationLayer::getName));

        // Look up all the features once to avoid hammering the database in the loop below
        Map<AnnotationLayer, List<AnnotationFeature>> layerToFeatures = annotationService
                .listSupportedFeatures(aProject).stream()
                .collect(groupingBy(AnnotationFeature::getLayer));

        // Now build the actual configuration
        Set<EntityType> entityTypes = new LinkedHashSet<>();
        for (AnnotationLayer layer : layers) {
            EntityType entityType = configureEntityType(layer);

            List<RelationType> arcs = new ArrayList<>();

            // For link features, we also need to configure the arcs, even though there is no arc
            // layer here.
            boolean hasLinkFeatures = false;
            for (AnnotationFeature f : layerToFeatures.computeIfAbsent(layer, k -> emptyList())) {
                if (!LinkMode.NONE.equals(f.getLinkMode())) {
                    hasLinkFeatures = true;
                    break;
                }
            }

            if (hasLinkFeatures) {
                arcs.add(new RelationType(layer.getName(), layer.getUiName(),
                        getBratTypeName(layer), getBratTypeName(layer), null, "triangle,5", "3,3"));
            }

            // Styles for the remaining relation and chain layers
            for (AnnotationLayer attachingLayer : getAttachingLayers(layer, layers)) {
                arcs.add(configureRelationType(layer, attachingLayer));
            }

            entityType.setArcs(arcs);
            entityTypes.add(entityType);
        }

        return entityTypes;
    }

    /**
     * Scan through the layers once to remember which layers attach to which layers.
     */
    private List<AnnotationLayer> getAttachingLayers(AnnotationLayer aTarget,
            List<AnnotationLayer> aLayers)
    {
        List<AnnotationLayer> attachingLayers = new ArrayList<>();

        // Chains always attach to themselves
        if (CHAIN_TYPE.equals(aTarget.getType())) {
            attachingLayers.add(aTarget);
        }

        // FIXME This is a hack! Actually we should check the type of the attachFeature when
        // determine which layers attach to with other layers. Currently we only use attachType,
        // but do not follow attachFeature if it is set.
        if (aTarget.isBuiltIn() && aTarget.getName().equals(POS.class.getName())) {
            try {
                attachingLayers.add(annotationService.findLayer(aTarget.getProject(),
                        Dependency.class.getName()));
            }
            catch (NoResultException e) {
                // If the Dependency layer does not exist in the project, we do not care.
            }
        }

        // Custom layers
        for (AnnotationLayer l : aLayers) {
            if (aTarget.equals(l.getAttachType())) {
                attachingLayers.add(l);
            }
        }

        return attachingLayers;
    }

    private EntityType configureEntityType(AnnotationLayer aLayer)
    {
        String bratTypeName = getBratTypeName(aLayer);
        return new EntityType(aLayer.getName(), aLayer.getUiName(), bratTypeName);
    }

    private RelationType configureRelationType(AnnotationLayer aLayer,
            AnnotationLayer aAttachingLayer)
    {
        String attachingLayerBratTypeName = getBratTypeName(aAttachingLayer);

        // // FIXME this is a hack because the chain layer consists of two UIMA types, a "Chain"
        // // and a "Link" type. ChainAdapter always seems to use "Chain" but some places also
        // // still use "Link" - this should be cleaned up so that knowledge about "Chain" and
        // // "Link" types is local to the ChainAdapter and not known outside it!
        // if (aLayer.getType().equals(CHAIN_TYPE)) {
        // attachingLayerBratTypeName += ChainAdapter.LINK;
        // }

        // Handle arrow-head styles depending on linkedListBehavior
        String arrowHead;
        if (aLayer.getType().equals(CHAIN_TYPE) && !aLayer.isLinkedListBehavior()) {
            arrowHead = "none";
        }
        else {
            arrowHead = "triangle,5";
        }

        String dashArray;
        switch (aLayer.getType()) {
        case CHAIN_TYPE:
            dashArray = "5,1";
            break;
        default:
            dashArray = "";
            break;
        }

        String bratTypeName = getBratTypeName(aLayer);
        return new RelationType(aAttachingLayer.getName(), aAttachingLayer.getUiName(),
                attachingLayerBratTypeName, bratTypeName, null, arrowHead, dashArray);
    }

    public static String getBratTypeName(AnnotationLayer aLayer)
    {
        return aLayer.getId().toString();
    }
}
