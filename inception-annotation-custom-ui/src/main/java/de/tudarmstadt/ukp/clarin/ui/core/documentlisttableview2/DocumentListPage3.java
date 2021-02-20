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
package de.tudarmstadt.ukp.clarin.ui.core.documentlisttableview2;

import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.form.Form;
import org.apache.wicket.model.CompoundPropertyModel;
import org.apache.wicket.model.IModel;
import org.wicketstuff.annotation.mount.MountPath;

import de.tudarmstadt.ukp.clarin.webanno.ui.core.page.ApplicationPageBase;

/**
 * This is used for a Websocket Test
 */
// @MenuItem(icon = "images/information.png", label = "Table View Annotation 2")
@MountPath("/DocumentListPage3.html")

public class DocumentListPage3
    extends ApplicationPageBase
{
    private static final long serialVersionUID = -5972434095216188594L;

    private class RequestForm
        extends Form<String>
    {
        private static final long serialVersionUID = -1L;
        Label output = new Label("output", "OutputText");

        public RequestForm(String id, IModel<String> aModel)
        {
            super(id, new CompoundPropertyModel<>(aModel));

            setOutputMarkupId(true);
            setOutputMarkupPlaceholderTag(true);

            output.setVisible(true);
            add(output);
        }

        @Override
        protected void onConfigure()
        {
            super.onConfigure();

            setVisible(getModelObject() != null);
        }
    }

    private RequestForm requestForm;

    private IModel<String> selectedMsg;

    public DocumentListPage3()
    {
        requestForm = new RequestForm("detailForm", selectedMsg);

        add(requestForm);
        requestForm.setVisible(true);
    }
}
