// src/main/java/com/poke/matrix/config/OpenApiConfig.java
package com.poke.matrix.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PokeMatrix API")
                        .version("1.0")
                        .description("API for managing Pokémon matrices and related operations."));
    }
}