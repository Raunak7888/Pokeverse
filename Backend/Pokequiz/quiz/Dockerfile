FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

ARG APP_PORT=8082
ENV QUIZ_PROFILE=prod \
    SERVER_PORT=${APP_PORT}

EXPOSE ${APP_PORT}

COPY --from=builder /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
