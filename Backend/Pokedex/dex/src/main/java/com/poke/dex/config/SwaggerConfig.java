package com.poke.dex.config;

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
                        .title("POKEDEX APIs")
                        .version("1.0")
                        .description("This is the documentation of Pokedex APIs for Pokeverse.")
                );
    }
}
