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
package de.tudarmstadt.ukp.clarin.webanno.security.preauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatNoException;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import de.tudarmstadt.ukp.clarin.webanno.security.UserDao;
import de.tudarmstadt.ukp.clarin.webanno.security.config.InceptionSecurityAutoConfiguration;
import de.tudarmstadt.ukp.clarin.webanno.security.config.SecurityAutoConfiguration;
import de.tudarmstadt.ukp.clarin.webanno.security.model.Role;
import de.tudarmstadt.ukp.clarin.webanno.security.model.User;
import de.tudarmstadt.ukp.clarin.webanno.security.model.User_;
import de.tudarmstadt.ukp.clarin.webanno.support.ApplicationContextProvider;
import de.tudarmstadt.ukp.inception.support.deployment.DeploymentModeService;

@Transactional
@ActiveProfiles(DeploymentModeService.PROFILE_AUTH_MODE_EXTERNAL_PREAUTH)
@DataJpaTest( //
        showSql = false, //
        properties = { //
                "spring.liquibase.enabled=false", //
                "spring.main.banner-mode=off" })
@ImportAutoConfiguration({ //
        SecurityAutoConfiguration.class, //
        InceptionSecurityAutoConfiguration.class })
@EntityScan(basePackages = { //
        "de.tudarmstadt.ukp.clarin.webanno.security.model" })
class ShibbolethRequestHeaderAuthenticationFilterTest
{
    private static final String USERNAME = "ThatGuy";

    @Autowired
    UserDao userService;

    @Autowired
    ShibbolethRequestHeaderAuthenticationFilter sut;

    ClientRegistration clientRegistration;
    OAuth2AccessToken oAuth2AccessToken;
    OidcIdToken oidcIdToken;

    @BeforeEach
    void setup()
    {
        userService.delete(USERNAME);
    }

    @Test
    void thatUserIsCreatedIfMissing()
    {
        assertThat(userService.get(USERNAME)) //
                .as("User should not exist when test starts").isNull();

        sut.loadUser(USERNAME);

        User autoCreatedUser = userService.get(USERNAME);
        assertThat(autoCreatedUser) //
                .as("User should have been created as part of the authentication")
                .usingRecursiveComparison() //
                .ignoringFields(User_.CREATED, User_.UPDATED, User_.PASSWORD, "passwordEncoder") //
                .isEqualTo(User.builder() //
                        .withUsername(USERNAME) //
                        .withRealm(UserDao.REALM_PREAUTH).withRoles(Set.of(Role.ROLE_USER)) //
                        .withEnabled(true) //
                        .build());

        assertThat(userService.userHasNoPassword(autoCreatedUser)) //
                .as("Auto-created external users should be created without password") //
                .isTrue();
    }

    @Test
    void thatLoginWithExistingUserIsPossible()
    {
        userService.create(User.builder() //
                .withUsername(USERNAME) //
                .withRealm(UserDao.REALM_PREAUTH) //
                .withRoles(Set.of(Role.ROLE_USER)) //
                .withEnabled(true) //
                .build());

        assertThat(userService.get(USERNAME)) //
                .as("User should exist when test starts").isNotNull();

        assertThatNoException().isThrownBy(() -> sut.loadUser(USERNAME));
    }

    @Test
    void thatAccessToDisabledUserIsDenied()
    {
        userService.create(User.builder() //
                .withUsername(USERNAME) //
                .withEnabled(false) //
                .build());

        assertThatExceptionOfType(BadCredentialsException.class) //
                .isThrownBy(() -> sut.loadUser(USERNAME)) //
                .withMessageContaining("Realm mismatch");
    }

    @Test
    void thatUserWithFunkyUsernameIsDeniedAccess()
    {
        assertThatExceptionOfType(BadCredentialsException.class) //
                .isThrownBy(() -> sut.loadUser("/etc/passwd")) //
                .withMessageContaining("Illegal username");

        assertThatExceptionOfType(BadCredentialsException.class) //
                .isThrownBy(() -> sut.loadUser("../escape.zip")) //
                .withMessageContaining("Illegal username");

        assertThatExceptionOfType(BadCredentialsException.class) //
                .isThrownBy(() -> sut.loadUser("")) //
                .withMessageContaining("Username cannot be empty");

        assertThatExceptionOfType(BadCredentialsException.class) //
                .isThrownBy(() -> sut.loadUser("*".repeat(2000))) //
                .withMessageContaining("Illegal username");

        assertThatExceptionOfType(BadCredentialsException.class) //
                .isThrownBy(() -> sut.loadUser("mel\0ove")) //
                .withMessageContaining("Illegal username");

        assertThat(userService.list()).isEmpty();
    }

    @SpringBootConfiguration
    @AutoConfigurationPackage
    public static class SpringConfig
    {
        @Bean
        ApplicationContextProvider applicationContextProvider()
        {
            return new ApplicationContextProvider();
        }

        @Bean
        ShibbolethRequestHeaderAuthenticationFilter ShibbolethRequestHeaderAuthenticationFilter(
                UserDao aUserService, AuthenticationConfiguration aAuthenticationConfiguration)
            throws Exception
        {
            var sut = new ShibbolethRequestHeaderAuthenticationFilter();
            sut.setUserRepository(aUserService);
            sut.setAuthenticationManager(aAuthenticationConfiguration.getAuthenticationManager());
            return sut;
        }
    }
}
