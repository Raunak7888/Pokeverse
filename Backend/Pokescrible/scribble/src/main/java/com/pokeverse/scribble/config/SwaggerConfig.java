package com.pokeverse.scribble.config;

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
                        .title("Scribble Game API") // Set the title of your API
                        .version("1.0.0") // Set the version of your API
                        .description("API documentation for the Scribble multiplayer drawing game service. " +
                                "This service handles room management, player joining, and round services."));
    }
}
