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
package de.tudarmstadt.ukp.inception.curation.merge;

import static de.tudarmstadt.ukp.clarin.webanno.model.AnchoringMode.TOKENS;
import static de.tudarmstadt.ukp.clarin.webanno.model.OverlapMode.ANY_OVERLAP;
import static de.tudarmstadt.ukp.clarin.webanno.support.uima.AnnotationBuilder.buildAnnotation;
import static de.tudarmstadt.ukp.inception.curation.merge.CurationTestUtils.HOST_TYPE;
import static de.tudarmstadt.ukp.inception.curation.merge.CurationTestUtils.createMultiLinkWithRoleTestTypeSystem;
import static de.tudarmstadt.ukp.inception.curation.merge.CurationTestUtils.makeLinkFS;
import static de.tudarmstadt.ukp.inception.curation.merge.CurationTestUtils.makeLinkHostFS;
import static java.util.Arrays.asList;
import static org.apache.uima.fit.factory.CasFactory.createCas;
import static org.apache.uima.fit.factory.JCasFactory.createJCas;
import static org.apache.uima.fit.util.FSUtil.getFeature;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.tuple;

import org.apache.uima.cas.CAS;
import org.apache.uima.cas.text.AnnotationFS;
import org.apache.uima.jcas.tcas.Annotation;
import org.junit.jupiter.api.Test;

import de.tudarmstadt.ukp.clarin.webanno.model.OverlapMode;
import de.tudarmstadt.ukp.dkpro.core.api.lexmorph.type.pos.POS;
import de.tudarmstadt.ukp.dkpro.core.api.ner.type.NamedEntity;
import de.tudarmstadt.ukp.dkpro.core.api.segmentation.type.Token;
import de.tudarmstadt.ukp.inception.schema.api.adapter.AnnotationException;
import de.tudarmstadt.ukp.inception.schema.api.feature.LinkWithRoleModel;

public class CasMergeSpanTest
    extends CasMergeTestBase
{
    private static final String DUMMY_USER = "dummyTargetUser";

    @Test
    public void simpleCopyToEmptyTest() throws Exception
    {
        CAS sourceCas = createCas();
        AnnotationFS clickedFs = createNEAnno(sourceCas, "NN", 0, 0);

        CAS targetCas = createCas();
        createToken(targetCas, 0, 0);

        sut.mergeSpanAnnotation(document, DUMMY_USER, neLayer, targetCas, clickedFs, false);

        assertThat(targetCas.select(NamedEntity.class).coveredBy(0, 0).asList()) //
                .hasSize(1);
    }

    @Test
    public void simpleCopyToSameExistingAnnoTest() throws Exception
    {
        var sourceCas = createCas();
        var sourceType = sourceCas.getTypeSystem().getType(POS.class.getTypeName());
        var sourceFs = createPOSAnno(sourceCas, "NN", 0, 0);

        var targetCas = createCas();
        buildAnnotation(targetCas, sourceType) //
                .at(sourceFs) //
                .withFeature(POS._FeatName_PosValue,
                        getFeature(sourceFs, POS._FeatName_PosValue, String.class)) //
                .buildAndAddToIndexes();

        assertThatExceptionOfType(AnnotationException.class) //
                .isThrownBy(() -> sut.mergeSpanAnnotation(document, DUMMY_USER, posLayer, targetCas,
                        sourceFs, false))
                .withMessageContaining("annotation already exists");
    }

    @Test
    public void simpleCopyToDiffExistingAnnoWithNoStackingTest() throws Exception
    {
        var sourceCas = createJCas().getCas();
        var sourceType = sourceCas.getTypeSystem().getType(POS.class.getTypeName());
        var sourceFs = createPOSAnno(sourceCas, "NN", 0, 0);

        var targetCas = createJCas().getCas();
        buildAnnotation(targetCas, sourceType) //
                .at(sourceFs) //
                .withFeature(POS._FeatName_PosValue, "NE") //
                .buildAndAddToIndexes();

        sut.mergeSpanAnnotation(document, DUMMY_USER, posLayer, targetCas, sourceFs, false);

        assertThat(targetCas.<Annotation> select(sourceType).coveredBy(0, 0).asList()) //
                .as("Target feature value should be overwritten by source feature value")
                .extracting( //
                        AnnotationFS::getBegin, //
                        AnnotationFS::getEnd, //
                        a -> getFeature(a, POS._FeatName_PosValue, String.class))
                .containsExactly(
                        tuple(0, 0, getFeature(sourceFs, POS._FeatName_PosValue, String.class)));
    }

    @Test
    public void simpleCopyToDiffExistingAnnoWithStackingTest() throws Exception
    {
        neLayer.setOverlapMode(ANY_OVERLAP);

        var sourceFeature = NamedEntity._FeatName_value;
        var sourceCas = createCas();
        var sourceType = sourceCas.getTypeSystem().getType(NamedEntity.class.getTypeName());
        var sourceFs = createNEAnno(sourceCas, "NN", 0, 0);

        CAS targetCas = createCas();
        createToken(targetCas, 0, 0);
        var existingFs = buildAnnotation(targetCas, sourceType) //
                .at(sourceFs.getBegin(), sourceFs.getEnd()) //
                .withFeature(sourceFeature, "NE") //
                .buildAndAddToIndexes();

        sut.mergeSpanAnnotation(document, DUMMY_USER, neLayer, targetCas, sourceFs, true);

        assertThat(targetCas.<Annotation> select(sourceType).coveredBy(0, 0).asList()) //
                .as("Source FS should be added alongside existing FS in target") //
                .extracting( //
                        AnnotationFS::getBegin, //
                        AnnotationFS::getEnd, //
                        a -> getFeature(a, sourceFeature, String.class))
                .containsExactlyInAnyOrder( //
                        tuple(0, 0, getFeature(existingFs, sourceFeature, String.class)),
                        tuple(0, 0, getFeature(sourceFs, sourceFeature, String.class)));
    }

    @Test
    public void copySpanWithSlotNoStackingTest() throws Exception
    {
        slotLayer.setOverlapMode(OverlapMode.NO_OVERLAP);

        var sourceCas = createJCas(createMultiLinkWithRoleTestTypeSystem("f1"));
        var sourceType = sourceCas.getTypeSystem().getType(HOST_TYPE);
        var sourceFeature = sourceType.getFeatureByBaseName("f1");
        var role = "slot1";
        var sourceFs = makeLinkHostFS(sourceCas, 0, 0, sourceFeature, "A",
                makeLinkFS(sourceCas, role, 0, 0));

        var targetCas = createJCas(createMultiLinkWithRoleTestTypeSystem("f1"));
        makeLinkHostFS(targetCas, 0, 0, sourceFeature, "C", makeLinkFS(targetCas, role, 0, 0));

        sut.mergeSpanAnnotation(document, DUMMY_USER, slotLayer, targetCas.getCas(), sourceFs,
                false);

        assertThat(targetCas.select(sourceType).coveredBy(0, 0).asList()).hasSize(1);
    }

    @Test
    public void copySpanWithSlotWithStackingTest() throws Exception
    {
        slotLayer.setAnchoringMode(TOKENS);
        slotLayer.setOverlapMode(ANY_OVERLAP);

        var sourceCas = createJCas(createMultiLinkWithRoleTestTypeSystem("f1"));
        var sourceType = sourceCas.getTypeSystem().getType(HOST_TYPE);
        var sourceFeature = sourceType.getFeatureByBaseName("f1");
        var role = "slot1";
        var sourceFs = makeLinkHostFS(sourceCas, 0, 0, sourceFeature, "NEW",
                makeLinkFS(sourceCas, role, 0, 0));

        var targetCas = createJCas(createMultiLinkWithRoleTestTypeSystem("f1"));
        var targetLinkFs = makeLinkFS(targetCas, role, 0, 0);
        makeLinkHostFS(targetCas, 0, 0, sourceFeature, "EXISTING", targetLinkFs);
        var targetSlotFiller = getFeature(targetLinkFs, "target", Annotation.class);

        sut.mergeSpanAnnotation(document, DUMMY_USER, slotLayer, targetCas.getCas(), sourceFs,
                true);

        assertThat(targetCas.select(sourceType).coveredBy(0, 0).asList()).hasSize(2);

        var adapter = schemaService.getAdapter(slotLayer);
        assertThat(targetCas.<Annotation> select(sourceType).coveredBy(0, 0).asList()) //
                .as("Source span added to target CAS with primitive features but without links") //
                .extracting( //
                        AnnotationFS::getBegin, //
                        AnnotationFS::getEnd, //
                        a -> getFeature(a, sourceFeature, String.class),
                        a -> adapter.getFeatureValue(slotFeature, a))
                .containsExactlyInAnyOrder( //
                        tuple(0, 0, "EXISTING",
                                asList(new LinkWithRoleModel(role, null,
                                        targetSlotFiller.getAddress()))), //
                        tuple(0, 0, "NEW", asList()));

    }

    private AnnotationFS createToken(CAS aCas, int aBegin, int aEnd)
    {
        return buildAnnotation(aCas, Token.class) //
                .at(aBegin, aEnd) //
                .buildAndAddToIndexes();
    }

    private AnnotationFS createNEAnno(CAS aCas, String aValue, int aBegin, int aEnd)
    {
        return buildAnnotation(aCas, NamedEntity.class) //
                .at(aBegin, aEnd) //
                .withFeature(NamedEntity._FeatName_value, aValue) //
                .buildAndAddToIndexes();
    }

    private AnnotationFS createPOSAnno(CAS aCas, String aValue, int aBegin, int aEnd)
    {
        return buildAnnotation(aCas, POS.class) //
                .at(aBegin, aEnd) //
                .withFeature(POS._FeatName_PosValue, aValue) //
                .buildAndAddToIndexes();
    }
}
