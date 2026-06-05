# Step 1 — Build the jar
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Step 2 — Run the jar
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar healthcare-backend.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "healthcare-backend.jar"]