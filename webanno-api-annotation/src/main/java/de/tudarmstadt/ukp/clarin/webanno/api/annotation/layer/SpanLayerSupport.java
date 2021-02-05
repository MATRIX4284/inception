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
package de.tudarmstadt.ukp.clarin.webanno.api.annotation.layer;

import static java.util.Arrays.asList;
import static java.util.stream.Collectors.toList;

import java.util.Collection;
import java.util.List;
import java.util.function.Supplier;

import org.apache.uima.cas.CAS;
import org.apache.uima.resource.metadata.TypeDescription;
import org.apache.uima.resource.metadata.TypeSystemDescription;
import org.apache.wicket.markup.html.panel.Panel;
import org.apache.wicket.model.IModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import de.tudarmstadt.ukp.clarin.webanno.api.WebAnnoConst;
import de.tudarmstadt.ukp.clarin.webanno.api.annotation.adapter.SpanAdapter;
import de.tudarmstadt.ukp.clarin.webanno.api.annotation.adapter.SpanLayerBehavior;
import de.tudarmstadt.ukp.clarin.webanno.api.annotation.feature.FeatureSupportRegistry;
import de.tudarmstadt.ukp.clarin.webanno.api.annotation.rendering.SpanRenderer;
import de.tudarmstadt.ukp.clarin.webanno.model.AnnotationFeature;
import de.tudarmstadt.ukp.clarin.webanno.model.AnnotationLayer;

@Component
public class SpanLayerSupport
    extends LayerSupport_ImplBase<SpanAdapter, SpanLayerTraits>
    implements InitializingBean
{
    private final Logger log = LoggerFactory.getLogger(getClass());

    private final ApplicationEventPublisher eventPublisher;
    private final LayerBehaviorRegistry layerBehaviorsRegistry;

    private String layerSupportId;
    private List<LayerType> types;

    @Autowired
    public SpanLayerSupport(FeatureSupportRegistry aFeatureSupportRegistry,
            ApplicationEventPublisher aEventPublisher,
            LayerBehaviorRegistry aLayerBehaviorsRegistry)
    {
        super(aFeatureSupportRegistry);
        eventPublisher = aEventPublisher;
        layerBehaviorsRegistry = aLayerBehaviorsRegistry;
    }

    @Override
    public String getId()
    {
        return layerSupportId;
    }

    @Override
    public void setBeanName(String aBeanName)
    {
        layerSupportId = aBeanName;
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        types = asList(new LayerType(WebAnnoConst.SPAN_TYPE, "Span", layerSupportId));
    }

    @Override
    public List<LayerType> getSupportedLayerTypes()
    {
        return types;
    }

    @Override
    public boolean accepts(AnnotationLayer aLayer)
    {
        return WebAnnoConst.SPAN_TYPE.equals(aLayer.getType());
    }

    @Override
    public SpanAdapter createAdapter(AnnotationLayer aLayer,
            Supplier<Collection<AnnotationFeature>> aFeatures)
    {
        SpanAdapter adapter = new SpanAdapter(getLayerSupportRegistry(), featureSupportRegistry,
                eventPublisher, aLayer, aFeatures,
                layerBehaviorsRegistry.getLayerBehaviors(this, SpanLayerBehavior.class));

        return adapter;
    }

    @Override
    public void generateTypes(TypeSystemDescription aTsd, AnnotationLayer aLayer,
            List<AnnotationFeature> aAllFeaturesInProject)
    {
        TypeDescription td = aTsd.addType(aLayer.getName(), aLayer.getDescription(),
                CAS.TYPE_NAME_ANNOTATION);

        List<AnnotationFeature> featureForLayer = aAllFeaturesInProject.stream()
                .filter(feature -> aLayer.equals(feature.getLayer())).collect(toList());
        generateFeatures(aTsd, td, featureForLayer);
    }

    @Override
    public SpanRenderer createRenderer(AnnotationLayer aLayer,
            Supplier<Collection<AnnotationFeature>> aFeatures)
    {
        return new SpanRenderer(createAdapter(aLayer, aFeatures), getLayerSupportRegistry(),
                featureSupportRegistry,
                layerBehaviorsRegistry.getLayerBehaviors(this, SpanLayerBehavior.class));
    }

    @Override
    public Panel createTraitsEditor(String aId, IModel<AnnotationLayer> aLayerModel)
    {
        AnnotationLayer layer = aLayerModel.getObject();

        if (!accepts(layer)) {
            throw unsupportedLayerTypeException(layer);
        }

        return new SpanLayerTraitsEditor(aId, this, aLayerModel);
    }

    @Override
    public SpanLayerTraits createTraits()
    {
        return new SpanLayerTraits();
    }
}
