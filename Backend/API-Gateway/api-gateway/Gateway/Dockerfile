# =========================
# Runtime Image Only
# =========================
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy the prebuilt JAR from host (built with ./mvnw package)
COPY target/*.jar app.jar

# Non-root user for security
RUN useradd -m appuser
USER appuser

# Environment variables can be passed at runtime (not baked in here)
# Expose gateway port (will be overridden by env if needed)
EXPOSE 8080

# Run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
