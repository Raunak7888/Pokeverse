package com.pokequiz.quiz.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.tags.Tag;
// Removed io.swagger.v3.oas.models.OpenAPI as it's not needed for this approach
import org.springframework.context.annotation.Configuration;
// Removed org.springframework.context.annotation.Bean as the bean method is being removed

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "PokeQuiz API",
                version = "1.0",
                description = "API documentation for the PokeQuiz application. " +
                        "This application allows users to play quizzes based on Pokémon, " +
                        "manage quiz questions, track quiz attempts, and engage in " +
                        "multiplayer quiz sessions with real-time communication.",
                termsOfService = "http://localhost:8080/terms", // Replace with actual terms if applicable
                contact = @Contact(
                        name = "PokeQuiz Support",
                        email = "support@pokequiz.com", // Replace with your support email
                        url = "https://www.pokequiz.com/contact" // Replace with your contact URL
                ),
                license = @License(
                        name = "Apache 2.0",
                        url = "https://www.apache.org/licenses/LICENSE-2.0.html"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local Development Server"),
                // Add more server URLs for different environments (e.g., production, staging)
                // @Server(url = "https://api.pokequiz.com", description = "Production Server")
        },
        tags = {
                @Tag(name = "Quiz Attempt Controller", description = "APIs for managing and retrieving quiz attempts."),
                @Tag(name = "Quiz Management Controller", description = "APIs for managing quiz questions (CRUD operations and various fetching methods)."),
                @Tag(name = "Quiz Session Controller", description = "APIs for managing quiz sessions, including creation, updates, and retrieval."),
                @Tag(name = "Room Controller", description = "APIs for managing multiplayer quiz rooms and player interactions."),
                @Tag(name = "WebSocket & Real-time Communication", description = "This section describes the WebSocket (STOMP) channels used for real-time chat, game control, and score updates. Note: These are not standard HTTP endpoints and require a STOMP client for interaction. Refer to the separate WebSocket API Documentation (e.g., `websocket-docs.md`) for detailed channel and message format information.")
        }
)
public class SwaggerConfig {
    // Removed the customOpenAPI() @Bean method
    // All necessary configuration is handled by the @OpenAPIDefinition annotation above.
}