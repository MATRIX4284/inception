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
package de.tudarmstadt.ukp.inception.ui.curation.sidebar.config;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.session.SessionRegistry;

import de.tudarmstadt.ukp.clarin.webanno.api.casstorage.CasStorageService;
import de.tudarmstadt.ukp.clarin.webanno.security.UserDao;
import de.tudarmstadt.ukp.inception.documents.api.DocumentService;
import de.tudarmstadt.ukp.inception.project.api.ProjectService;
import de.tudarmstadt.ukp.inception.schema.AnnotationSchemaService;
import de.tudarmstadt.ukp.inception.schema.feature.FeatureSupportRegistry;
import de.tudarmstadt.ukp.inception.schema.layer.LayerSupportRegistry;
import de.tudarmstadt.ukp.inception.ui.curation.sidebar.CurationEditorExtension;
import de.tudarmstadt.ukp.inception.ui.curation.sidebar.CurationSidebarApplicationInitializer;
import de.tudarmstadt.ukp.inception.ui.curation.sidebar.CurationSidebarFactory;
import de.tudarmstadt.ukp.inception.ui.curation.sidebar.CurationSidebarService;
import de.tudarmstadt.ukp.inception.ui.curation.sidebar.CurationSidebarServiceImpl;
import de.tudarmstadt.ukp.inception.ui.curation.sidebar.render.CurationSidebarRenderer;

@ConditionalOnWebApplication
@Configuration
@ConditionalOnProperty(prefix = "curation.sidebar", name = "enabled", havingValue = "true")
public class CurationSidebarAutoConfiguration
{
    private @PersistenceContext EntityManager entityManager;

    @Bean
    public CurationSidebarService curationSidebarService(EntityManager aEntityManager,
            DocumentService aDocumentService, SessionRegistry aSessionRegistry,
            ProjectService aProjectService, UserDao aUserRegistry,
            CasStorageService aCasStorageService)
    {
        return new CurationSidebarServiceImpl(aEntityManager, aDocumentService, aSessionRegistry,
                aProjectService, aUserRegistry, aCasStorageService);
    }

    @Bean(CurationEditorExtension.EXTENSION_ID)
    public CurationEditorExtension curationEditorExtension(
            AnnotationSchemaService aAnnotationService, DocumentService aDocumentService,
            ApplicationEventPublisher aApplicationEventPublisher, UserDao aUserRepository,
            CurationSidebarService aCurationSidebarService,
            FeatureSupportRegistry aFeatureSupportRegistry)
    {
        return new CurationEditorExtension(aAnnotationService, aDocumentService,
                aApplicationEventPublisher, aUserRepository, aCurationSidebarService,
                aFeatureSupportRegistry);
    }

    @Bean("curationSidebar")
    @ConditionalOnProperty(prefix = "curation.sidebar", name = "enabled", havingValue = "true")
    public CurationSidebarFactory curationSidebarFactory(ProjectService aProjectService,
            UserDao aUserService)
    {
        return new CurationSidebarFactory(aProjectService, aUserService);
    }

    @Bean
    public CurationSidebarRenderer curationSidebarRenderer(CurationSidebarService aCurationService,
            LayerSupportRegistry aLayerSupportRegistry, DocumentService aDocumentService,
            UserDao aUserRepository, AnnotationSchemaService aAnnotationService)
    {
        return new CurationSidebarRenderer(aCurationService, aLayerSupportRegistry,
                aDocumentService, aUserRepository, aAnnotationService);
    }

    @Bean
    public CurationSidebarApplicationInitializer curationSidebarApplicationInitializer()
    {
        return new CurationSidebarApplicationInitializer();
    }
}
