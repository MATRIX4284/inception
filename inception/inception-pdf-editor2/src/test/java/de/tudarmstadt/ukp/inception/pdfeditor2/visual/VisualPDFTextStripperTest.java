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
package de.tudarmstadt.ukp.inception.pdfeditor2.visual;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.StringWriter;
import java.util.Collection;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.uima.fit.factory.JCasFactory;
import org.apache.uima.jcas.JCas;
import org.dkpro.core.api.pdf.type.PdfPage;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import de.tudarmstadt.ukp.inception.pdfeditor2.format.VisualPdfReader;
import de.tudarmstadt.ukp.inception.pdfeditor2.visual.model.VChunk;
import de.tudarmstadt.ukp.inception.pdfeditor2.visual.model.VGlyph;
import de.tudarmstadt.ukp.inception.pdfeditor2.visual.model.VModel;
import de.tudarmstadt.ukp.inception.pdfeditor2.visual.model.VPage;

class VisualPDFTextStripperTest
{
    public static Iterable<File> pdfFiles()
    {
        return asList(new File("src/test/resources/pdfbox-testfiles/").listFiles()).stream()
                .filter(file -> file.getName().endsWith(".pdf")) //
                // We have trouble with RTL text in PDF atm
                .filter(file -> !asList("FC60_Times.pdf", "hello3.pdf").contains(file.getName())) //
                .collect(Collectors.toList());
    }

    @ParameterizedTest(name = "{index}: reading PDF file {0}")
    @MethodSource("pdfFiles")
    void thatPdfCanBeParsed(File aFile) throws Exception
    {
        VModel vModel;
        var target = new StringWriter();
        try (PDDocument doc = PDDocument.load(aFile)) {
            var extractor = new VisualPDFTextStripper();
            extractor.writeText(doc, target);
            for (int i = 0; i < doc.getNumberOfPages(); i++) {
                var page = doc.getPage(i);
                System.out.printf("Processing page %d (%d) of %d %n", i + 1,
                        doc.getPages().indexOf(page) + 1, doc.getNumberOfPages());
                extractor.processPage(page);
            }
            vModel = extractor.getVisualModel();
        }

        // System.out.println(target.toString().length());
        // System.out.println(target.toString());

        assertValidGlyphCoordindates(vModel);
        assertValidGlyphOffsets(vModel.getPages());
    }

    @ParameterizedTest(name = "{index}: reading PDF file {0}")
    @MethodSource("pdfFiles")
    void thatVModelEncodedInCasCanBeRecovered(File aFile) throws Exception
    {
        VModel expected;
        var textBuffer = new StringWriter();
        try (PDDocument doc = PDDocument.load(aFile)) {
            var extractor = new VisualPDFTextStripper();
            extractor.writeText(doc, textBuffer);
            expected = extractor.getVisualModel();
        }

        JCas jCas = JCasFactory.createJCas();
        jCas.setDocumentText(textBuffer.toString());
        VisualPdfReader.visualModelToCas(expected, jCas);
        VModel actual = VisualPdfReader.visualModelFromCas(jCas.getCas(),
                jCas.select(PdfPage.class).asList());

        assertThat(actual.getPages()).hasSameSizeAs(expected.getPages());
        for (int p = 0; p < expected.getPages().size(); p++) {
            var expectedPage = expected.getPages().get(p);
            var actualPage = actual.getPages().get(p);

            assertThat(actualPage.getChunks()).hasSameSizeAs(expectedPage.getChunks());

            for (int l = 0; l < expectedPage.getChunks().size(); l++) {
                var expectedLine = expectedPage.getChunks().get(l);
                var actualLine = actualPage.getChunks().get(l);

                assertThat(actualLine.getGlyphs()) //
                        .hasSameSizeAs(expectedLine.getGlyphs());
                assertThat(actualLine) //
                        .usingRecursiveComparison() //
                        .ignoringFields("glyphs") //
                        .isEqualTo(expectedLine);

                for (int g = 0; g < expectedLine.getGlyphs().size(); g++) {
                    var expectedGlyph = expectedLine.getGlyphs().get(g);
                    var actualGlyph = actualLine.getGlyphs().get(g);

                    assertThat(actualGlyph) //
                            .as("Page %d line %d glyph %d", p, l, g) //
                            .usingRecursiveComparison() //
                            .comparingOnlyFields("page", "begin", "unicode", "base") //
                            .isEqualTo(expectedGlyph);
                }
            }
        }
    }

    private void assertValidGlyphCoordindates(VModel vModel)
    {
        for (VPage vPage : vModel.getPages()) {
            for (VChunk vLine : vPage.getChunks()) {
                for (VGlyph vGlyph : vLine.getGlyphs()) {
                    float d = vLine.getDir();
                    float x = (d == 0 || d == 180) ? vGlyph.getBase() : vLine.getX();
                    float y = (d == 0 || d == 180) ? vLine.getY() : vGlyph.getBase();
                    float w = (d == 0 || d == 180) ? vGlyph.getExtent() : vLine.getW();
                    float h = (d == 0 || d == 180) ? vLine.getH() : vGlyph.getExtent();

                    System.out.printf("%.0f %f %f %f %f -- (%f %f %f %f) -- %s%n", vLine.getDir(),
                            vLine.getX(), vLine.getY(), vLine.getW(), vLine.getH(), x, y, w, h,
                            vGlyph);

                    // Font (screen) coordinates should be within the line boundaries
                    assertThat(vGlyph.getFontX()).isBetween(x, x + w);
                    assertThat(vGlyph.getFontWidth()).isLessThanOrEqualTo(w * 1.0001f);
                    assertThat(vGlyph.getFontY()).isBetween(y, y + h);
                    assertThat(vGlyph.getFontHeight()).isLessThanOrEqualTo(h * 1.0001f);
                }
            }
        }
    }

    private void assertValidGlyphOffsets(Collection<VPage> aPages)
    {
        for (VPage page : aPages) {
            for (VChunk line : page.getChunks()) {
                assertValidGlyphOffsets(line);
            }
        }
    }

    private void assertValidGlyphOffsets(VChunk aLine)
    {
        int cumulativePositionLength = aLine.getGlyphs().stream()
                .mapToInt(t -> t.getUnicode().length()) //
                .sum();

        int textLength = aLine.getText().length();
        if (textLength != cumulativePositionLength) {
            System.out.printf("%d (%d) vs %d (%d)%n", textLength,
                    aLine.getText().codePoints().count(), cumulativePositionLength,
                    aLine.getGlyphs().size());
            System.out.println(" Text [" + aLine.getText() + "]");
            StringBuilder sb = new StringBuilder();
            for (VGlyph g : aLine.getGlyphs()) {
                sb.append(g.getUnicode());
            }
            String posText = sb.toString();
            System.out.println(" Pos [" + posText + "]");
            System.out.println(" Diff [" + StringUtils.difference(posText, aLine.getText()) + "]");

            assertThat(textLength) //
                    .as("Text positions account for a string length of [" + cumulativePositionLength
                            + "] but string has length [" + textLength + "]") //
                    .isEqualTo(cumulativePositionLength);
        }
    }
}
