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

# Expose fallback port for documentation (optional)
EXPOSE 8085

# Run the Matrix Service with prod profile and dynamic env config
ENTRYPOINT ["sh", "-c", "java \
  -Dspring.profiles.active=prod \
  -Dserver.port=${MATRIX_PORT:-8085} \
  -Dspring.datasource.url=${DB_URL} \
  -Dspring.datasource.username=${DB_USER} \
  -Dspring.datasource.password=${DB_PASS} \
  -Deureka.client.service-url.defaultZone=${EUREKA_DEFAULT_ZONE} \
  -jar app.jar"]
