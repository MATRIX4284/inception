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
package de.tudarmstadt.ukp.inception.export.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import de.tudarmstadt.ukp.clarin.webanno.api.AnnotationSchemaService;
import de.tudarmstadt.ukp.clarin.webanno.api.CasStorageService;
import de.tudarmstadt.ukp.clarin.webanno.api.DocumentImportExportService;
import de.tudarmstadt.ukp.clarin.webanno.api.DocumentService;
import de.tudarmstadt.ukp.clarin.webanno.api.ProjectService;
import de.tudarmstadt.ukp.clarin.webanno.api.config.RepositoryProperties;
import de.tudarmstadt.ukp.clarin.webanno.api.format.FormatSupport;
import de.tudarmstadt.ukp.clarin.webanno.security.UserDao;
import de.tudarmstadt.ukp.inception.export.DocumentImportExportServiceImpl;
import de.tudarmstadt.ukp.inception.export.exporters.AnnotationDocumentExporter;
import de.tudarmstadt.ukp.inception.export.exporters.GuidelinesExporter;
import de.tudarmstadt.ukp.inception.export.exporters.LayerExporter;
import de.tudarmstadt.ukp.inception.export.exporters.ProjectLogExporter;
import de.tudarmstadt.ukp.inception.export.exporters.ProjectMetaInfExporter;
import de.tudarmstadt.ukp.inception.export.exporters.ProjectPermissionsExporter;
import de.tudarmstadt.ukp.inception.export.exporters.ProjectSettingsExporter;
import de.tudarmstadt.ukp.inception.export.exporters.SourceDocumentExporter;
import de.tudarmstadt.ukp.inception.export.exporters.TagSetExporter;

@Configuration
// @EnableConfigurationProperties({ DocumentImportExportServicePropertiesImpl.class })
public class DocumentImportExportServiceAutoConfiguration
{
    @Bean
    public DocumentImportExportService documentImportExportService(
            RepositoryProperties aRepositoryProperties,
            @Lazy @Autowired(required = false) List<FormatSupport> aFormats,
            CasStorageService aCasStorageService, AnnotationSchemaService aAnnotationService,
            DocumentImportExportServiceProperties aServiceProperties)
    {
        return new DocumentImportExportServiceImpl(aRepositoryProperties, aFormats,
                aCasStorageService, aAnnotationService, aServiceProperties);
    }

    @Bean
    public DocumentImportExportServiceProperties documentImportExportServiceProperties()
    {
        return new DocumentImportExportServicePropertiesImpl();
    }

    @Bean
    public SourceDocumentExporter sourceDocumentExporter(DocumentService aDocumentService,
            RepositoryProperties aRepositoryProperties)
    {
        return new SourceDocumentExporter(aDocumentService, aRepositoryProperties);
    }

    @Bean
    public LayerExporter layerExporter(AnnotationSchemaService aAnnotationService)
    {
        return new LayerExporter(aAnnotationService);
    }

    @Bean
    public ProjectSettingsExporter projectSettingsExporter(ProjectService aProjectService)
    {
        return new ProjectSettingsExporter(aProjectService);
    }

    @Bean
    public ProjectLogExporter projectLogExporter(ProjectService aProjectService)
    {
        return new ProjectLogExporter(aProjectService);
    }

    @Bean
    public TagSetExporter tagSetExporter(AnnotationSchemaService aAnnotationService)
    {
        return new TagSetExporter(aAnnotationService);
    }

    @Bean
    public ProjectPermissionsExporter projectPermissionsExporter(ProjectService aProjectService,
            UserDao aUserService)
    {
        return new ProjectPermissionsExporter(aProjectService, aUserService);
    }

    @Bean
    public AnnotationDocumentExporter annotationDocumentExporter(DocumentService aDocumentService,
            UserDao aUserRepository, DocumentImportExportService aImportExportService,
            RepositoryProperties aRepositoryProperties)
    {
        return new AnnotationDocumentExporter(aDocumentService, aUserRepository,
                aImportExportService, aRepositoryProperties);
    }

    @Bean
    public GuidelinesExporter guidelinesExporter(ProjectService aProjectService)
    {
        return new GuidelinesExporter(aProjectService);
    }

    @Bean
    public ProjectMetaInfExporter projectMetaInfExporter(ProjectService aProjectService)
    {
        return new ProjectMetaInfExporter(aProjectService);
    }
}
