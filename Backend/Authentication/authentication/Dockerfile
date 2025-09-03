# =========================
# Runtime Image Only
# =========================
FROM eclipse-temurin:21-jre
WORKDIR /app

# Security: Use non-root user
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Copy prebuilt JAR from host (after mvn package)
COPY target/*.jar app.jar

# Environment (can be overridden at runtime)
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8081

# Expose service port
EXPOSE 8081

# Run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
