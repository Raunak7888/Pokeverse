# Build Stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy project files
COPY . .

# Build the project (skip tests)
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose fallback port for documentation (e.g., 8083)
EXPOSE 8083

# Run the Quiz Service with prod profile and dynamic config
ENTRYPOINT ["sh", "-c", "java \
  -Dspring.profiles.active=prod \
  -Dserver.port=${QUIZ_PORT:-8083} \
  -Dspring.datasource.url=${DB_URL} \
  -Dspring.datasource.username=${DB_USER} \
  -Dspring.datasource.password=${DB_PASS} \
  -Deureka.client.service-url.defaultZone=${EUREKA_DEFAULT_ZONE} \
  -jar app.jar"]
