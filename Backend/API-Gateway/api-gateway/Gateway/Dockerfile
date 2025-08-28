# =========================
# Stage 1: Build the JAR
# =========================
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Maven wrapper and POM first (better caching)
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies (offline mode)
RUN ./mvnw dependency:go-offline -B

# Copy source code and build
COPY src src
RUN ./mvnw clean package -DskipTests -B

# =========================
# Stage 2: Runtime Image
# =========================
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Non-root user for security
RUN useradd -m appuser
USER appuser

# Expose port (can override at runtime)
EXPOSE 8080

# Runtime arguments instead of ENV for sensitive values
ENTRYPOINT ["java", "-jar", "app.jar"]
