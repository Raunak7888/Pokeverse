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

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose fallback port for documentation (e.g., 8084)
EXPOSE 8084

# Run the Pokédex Service with prod profile and dynamic config
ENTRYPOINT ["sh", "-c", "java \
  -Dspring.profiles.active=prod \
  -Dserver.port=${DEX_PORT:-8084} \
  -Dspring.datasource.url=${DB_URL} \
  -Dspring.datasource.username=${DB_USER} \
  -Dspring.datasource.password=${DB_PASS} \
  -Deureka.client.service-url.defaultZone=${EUREKA_DEFAULT_ZONE} \
  -jar app.jar"]
