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
package de.tudarmstadt.ukp.inception.experimental.api.model;

import java.util.List;

import de.tudarmstadt.ukp.clarin.webanno.api.annotation.model.VID;

/**
 * Support Class representing an Arc annotation
 *
 * Attributes: id: The ID of the Arc sourceId: The ID of the source span annotation for the Arc
 * targetId: The ID of the target span annotation for the Arc layerId: The ID of the layer the Arc
 * belongs to features: List of annotation features of the Arc color: Color of the Arc
 **/
public class Arc
{
    private VID id;
    private VID sourceId;
    private VID targetId;
    private long layerId;
    private List<FeatureX> features;
    private String color;

    public Arc()
    {
        // Default required
    }

    public Arc(VID aId, VID aSourceId, VID aTargetId, String aColor, long aLayerId,
            List<FeatureX> aFeatures)
    {
        id = aId;
        sourceId = aSourceId;
        targetId = aTargetId;
        layerId = aLayerId;
        features = aFeatures;
        color = aColor;
    }

    public VID getId()
    {
        return id;
    }

    public void setId(VID aId)
    {
        id = aId;
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
