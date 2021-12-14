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
package de.tudarmstadt.ukp.inception.experimental.api.messages.response.create;

import java.util.List;

import de.tudarmstadt.ukp.clarin.webanno.api.annotation.model.VID;
import de.tudarmstadt.ukp.inception.experimental.api.model.FeatureX;

/**
 * Class required for Messaging between Server and Client. Basis for JSON ArcCreatedMessage: Message
 * published to clients that an Arc annotation has been created
 *
 * Attributes: arcId: The ID of the new arc projectId: The ID of the project to which the new Arc
 * belongs sourceId: The ID of the source annotation of the Arc targetId: The ID of the target
 * annotation of the Arc color: The color of the Arc layerId: The ID of the layer the Arc belongs to
 * features: List of AnnotationFeatures that the Arc has
 **/
public class ArcCreatedMessage
{
    private VID arcId;
    private long projectId;
    private VID sourceId;
    private VID targetId;
    private String color;
    private long layerId;
    private List<FeatureX> features;

    public ArcCreatedMessage(VID aArcId, long aProjectId, VID aSourceId, VID aTargetId,
            String aColor, long aLayerId, List<FeatureX> aFeatures)
    {
        arcId = aArcId;
        projectId = aProjectId;
        sourceId = aSourceId;
        targetId = aTargetId;
        color = aColor;
        layerId = aLayerId;
        features = aFeatures;
    }

    public VID getArcId()
    {
        return arcId;
    }

    public void setArcId(VID aArcId)
    {
        arcId = aArcId;
    }

    public long getProjectId()
    {
        return projectId;
    }

    public void setProjectId(long aProjectId)
    {
        projectId = aProjectId;
    }

    public VID getSourceId()
    {
        return sourceId;
    }

    public void setSourceId(VID aSourceId)
    {
        sourceId = aSourceId;
    }

    public VID getTargetId()
    {
        return targetId;
    }

    public void setTargetId(VID aTargetId)
    {
        targetId = aTargetId;
    }

    public String getColor()
    {
        return color;
    }

    public void setColor(String aColor)
    {
        color = aColor;
    }

    public long getLayerId()
    {
        return layerId;
    }

    public void setLayerId(long aLayerId)
    {
        layerId = aLayerId;
    }

    public List<FeatureX> getFeatures()
    {
        return features;
    }

    public void setFeatures(List<FeatureX> aFeatures)
    {
        features = aFeatures;
    }
}
