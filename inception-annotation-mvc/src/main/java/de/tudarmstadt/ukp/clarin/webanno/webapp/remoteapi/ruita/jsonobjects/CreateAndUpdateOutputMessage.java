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
package de.tudarmstadt.ukp.clarin.webanno.webapp.remoteapi.ruita.jsonobjects;

import java.util.ArrayList;
import java.util.HashMap;

public class CreateAndUpdateOutputMessage
    extends CreateOutputMessage
{
    ArrayList<HashMap<String, Object>> updateResponses;

    public CreateAndUpdateOutputMessage(String text, int createdAnnotationId, long layerId,
            String layerUiName, ArrayList<HashMap<String, Object>> updateResponses)
    {
        super(text, createdAnnotationId, layerId, layerUiName);
        this.updateResponses = updateResponses;
    }

    public ArrayList<HashMap<String, Object>> getUpdateResponses()
    {
        return updateResponses;
    }

    public void setUpdateResponses(ArrayList<HashMap<String, Object>> updateResponses)
    {
        this.updateResponses = updateResponses;
    }

}
