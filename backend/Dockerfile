# ---------- Build stage ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Gradle wrapper and config
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle gradle
COPY gradlew gradlew
COPY gradlew.bat gradlew.bat

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon

# Copy source
COPY src src

# Build Spring Boot jar
RUN ./gradlew bootJar --no-daemon

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Declare runtime env vars (NO VALUES)
ENV SPRING_PROFILES_ACTIVE=prod

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
