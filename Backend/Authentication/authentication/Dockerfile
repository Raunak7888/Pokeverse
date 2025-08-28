# =========================
# Stage 1: Build the JAR
# =========================
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and build files first (for caching dependencies)
COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application without tests
RUN ./mvnw clean package -DskipTests

# =========================
# Stage 2: Create Runtime Image
# =========================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Security: Use non-root user
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Expose service port (use ARG for flexibility)
ARG APP_PORT=8082
EXPOSE ${APP_PORT}

# Copy JAR from builder stage (rename to app.jar)
COPY --from=builder /app/target/*.jar app.jar

# Environment variables (NO secrets here; pass secrets at runtime via `docker run -e`)
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=${APP_PORT}

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
