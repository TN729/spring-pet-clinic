# ---------- Build stage ----------
FROM gradle:8.5-jdk17 AS builder
WORKDIR /build

# Cache dependencies first for faster rebuilds
COPY --chown=gradle:gradle build.gradle settings.gradle gradle.properties* ./
COPY --chown=gradle:gradle gradle ./gradle
RUN gradle dependencies --no-daemon || true

# Copy source and build
COPY --chown=gradle:gradle src ./src
RUN gradle bootJar --no-daemon -x test

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

COPY --from=builder /build/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
