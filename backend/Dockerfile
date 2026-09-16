# Stage 1: Build JAR using Maven & Java 21
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY checkstyle.xml* ./
COPY src ./src
ENV MAVEN_OPTS="-Xmx1024m -XX:+UseG1GC"
RUN mvn clean package -DskipTests -Dcheckstyle.skip=true && \
    cp $(ls target/quickcart-backend-*.jar | grep -v 'original') /app/app.jar

# Stage 2: Minimal Production JRE Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/app.jar app.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
