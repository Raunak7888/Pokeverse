# ---- Stage 1: Build the JAR ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Maven/Gradle wrapper & config first for caching
COPY mvnw pom.xml ./
COPY .mvn .mvn
# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code and build
COPY src src
RUN ./mvnw clean package -DskipTests

# ---- Stage 2: Run the application ----
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Environment variables (can be overridden at runtime)
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8761

# Expose port
EXPOSE ${SERVER_PORT}

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
