# Build Stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy project files
COPY . .

# Build the project without running tests
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose a default port for documentation (optional)
EXPOSE 8080

# Run the Gateway with prod profile and dynamic env vars
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=prod -Dserver.port=${GATEWAY_PORT} -Deureka.client.service-url.defaultZone=${EUREKA_DEFAULT_ZONE} -jar app.jar"]
