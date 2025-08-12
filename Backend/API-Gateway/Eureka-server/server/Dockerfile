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

# Expose dynamic port (optional for documentation purposes)
EXPOSE 8761

# Start the app with prod profile and dynamic port
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=prod -Dserver.port=${SERVER_PORT} -jar app.jar"]
