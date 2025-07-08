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

# Expose a default fallback port (for documentation)
EXPOSE 8082

# Run the Auth Service with prod profile and dynamic env variables
ENTRYPOINT ["sh", "-c", "java \
  -Dspring.profiles.active=prod \
  -Dserver.port=${AUTH_PORT:-8082} \
  -Dspring.datasource.url=${DB_URL} \
  -Dspring.datasource.username=${DB_USER} \
  -Dspring.datasource.password=${DB_PASS} \
  -Dspring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID} \
  -Dspring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET} \
  -Dsecret=${JWT_SECRET} \
  -Dcors.allowed-origin=${ALLOWED_ORIGIN} \
  -Deureka.client.service-url.defaultZone=${EUREKA_DEFAULT_ZONE} \
  -jar app.jar"]
