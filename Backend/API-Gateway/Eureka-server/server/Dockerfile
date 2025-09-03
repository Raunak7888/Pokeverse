FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy the JAR from the host machine into the container
COPY target/*.jar app.jar

# Set environment variables (overridable at runtime)
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8761

# Expose port
EXPOSE 8761

# Run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]