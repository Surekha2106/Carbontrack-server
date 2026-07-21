# CarbonTrack System Architecture

## Overview
CarbonTrack is a full-stack sustainability platform designed with a modern Spring Boot 3 backend and a React (Vite) frontend.

## Architecture Diagram

```mermaid
graph TD
    subgraph Frontend [React / Vite SPA]
        A[Dashboard UI]
        B[Activity Logger]
        C[Analytics & Goals]
        D[Gamification & Org View]
    end

    subgraph Backend [Spring Boot 3 API]
        E[Security Filter Chain - JWT/OAuth2]
        F[Controllers]
        G[Services - Calculation Engine]
        H[Spring Data JPA Repositories]
        I[Groq AI Client]
    end

    subgraph Database [Persistence]
        J[(PostgreSQL)]
        K[(Redis Cache)]
    end

    A <-->|REST API| E
    B <-->|REST API| E
    C <-->|REST API| E
    D <-->|REST API| E
    
    E --> F
    F --> G
    G --> H
    G <-->|External API| I
    H <-->|SQL / JDBC| J
    G <-->|Cache| K
```

## Deployment Stack
- **Frontend**: Containerized React app served by Nginx.
- **Backend**: Containerized Spring Boot 3 Java 21 application.
- **Database**: PostgreSQL 15 running in Docker with persistent volumes.
- **Cache**: Redis 7 running in Docker.

## CI/CD Readiness
- **Testing**: Includes JUnit 5 suites and `k6` load testing scripts.
- **Documentation**: Springdoc OpenAPI / Swagger automatically exposed at `/swagger-ui/index.html`.
- **Containers**: Includes `docker-compose.yml` for unified, single-command deployment.
