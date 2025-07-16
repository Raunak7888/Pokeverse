package com.pokeverse.auth.authentication.documentation;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI(
            @Value("${spring.application.name}") String appName
    ) {
        return new OpenAPI()
                .info(new Info()
                        .title(appName + " APIs")
                        .version("1.0")
                        .description("API documentation for " + appName)
                );
    }

}
