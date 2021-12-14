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
package de.tudarmstadt.ukp.inception.experimental.editor.advanced;

import static org.apache.wicket.markup.head.JavaScriptHeaderItem.forReference;

import javax.servlet.ServletContext;

import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.head.JavaScriptHeaderItem;
import org.apache.wicket.model.IModel;
import org.apache.wicket.spring.injection.annot.SpringBean;

import de.tudarmstadt.ukp.clarin.webanno.api.CasProvider;
import de.tudarmstadt.ukp.clarin.webanno.api.annotation.AnnotationEditorBase;
import de.tudarmstadt.ukp.clarin.webanno.api.annotation.action.AnnotationActionHandler;
import de.tudarmstadt.ukp.clarin.webanno.api.annotation.model.AnnotatorState;
import de.tudarmstadt.ukp.inception.experimental.editor.resources.ExperimentalAPIBasicEditorReference;

public class ExperimentalAdvancedEditor
    extends AnnotationEditorBase
{
    private static final long serialVersionUID = -5928851124630974531L;

    private @SpringBean ServletContext servletContext;

    public ExperimentalAdvancedEditor(String aId, IModel<AnnotatorState> aModel,
            AnnotationActionHandler aActionHandler, CasProvider aCasProvider)
    {
        super(aId, aModel, aActionHandler, aCasProvider);
    }

    @Override
    public void renderHead(IHeaderResponse aResponse)
    {
        super.renderHead(aResponse);
        aResponse.render(forReference(ExperimentalAPIBasicEditorReference.get()));
        aResponse.render(JavaScriptHeaderItem.forScript(setupExperienceAPI(), "1"));
    }

    public String setupExperienceAPI()
    {
        AnnotatorState state = getModelObject();
        return "const editor = new AnnotationExperienceAPIBasicEditor.AnnotationExperienceAPIBasicEditor("
                + state.getProject().getId() + "," + state.getDocument().getId() + ",'"
                + state.getUser().getUsername() + "');";
    }

    @Override
    protected void render(AjaxRequestTarget aTarget)
    {
        // Rendering should be handled by the scripting language files
    }
}
