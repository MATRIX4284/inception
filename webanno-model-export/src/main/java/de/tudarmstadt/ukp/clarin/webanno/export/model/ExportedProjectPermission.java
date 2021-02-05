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
package de.tudarmstadt.ukp.clarin.webanno.export.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import de.tudarmstadt.ukp.clarin.webanno.model.PermissionLevel;

/**
 * Project permissions information to be exported/imported
 */
@JsonPropertyOrder(value = { "level", "user" })
public class ExportedProjectPermission
{
    @JsonProperty("level")
    private PermissionLevel level;

    @JsonProperty("user")
    private String user;

    public PermissionLevel getLevel()
    {
        return level;
    }

    public void setLevel(PermissionLevel level)
    {
        this.level = level;
    }

    public String getUser()
    {
        return user;
    }

    public void setUser(String user)
    {
        this.user = user;
    }
}
