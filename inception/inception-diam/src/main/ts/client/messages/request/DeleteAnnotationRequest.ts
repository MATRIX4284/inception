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

/**
 * Class required for Messaging between Server and Client.
 * Basis for JSON
 * DeleteAnnotationRequest: Request forwarded to the Server to delete a certain annotation
 *
 * Attributes:
 * @annotatorName: String representation of the name of the annotator the annotation will belong to
 * @projectId: The ID of the project the annotation will belong to
 * @sourceDocumentId: The ID of the sourcedocument the annotation belongs to
 * @annotationId: The ID of the annotation to delete
 * @layerId: The ID of the layer the annotation belongs to
 **/
export class DeleteAnnotationRequest
{
    annotatorName: string;
    projectId: number;
    sourceDocumentId: number;
    annotationId: number;
    layerId: number;

    constructor(aAnnotatorName: string, aProjectId: number, aSourceDocumentId: number, aAnnotationId: number, aLayerId: number)
    {
        this.annotatorName = aAnnotatorName;
        this.projectId = aProjectId;
        this.sourceDocumentId = aSourceDocumentId;
        this.annotationId = aAnnotationId;
        this.layerId = aLayerId;
    }
}