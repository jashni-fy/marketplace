# Backend Architecture

The Jashnify Backend is built as a **Modular Monolith** using Ruby on Rails and the `packwerk` gem to enforce boundary separation.

## System Overview

```mermaid
flowchart TD
    %% Layer Styles
    classDef client fill:#f5f5f5,stroke:#333,stroke-width:2px;
    classDef interface fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef domain fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef db fill:#ffebee,stroke:#c62828,stroke-width:2px;

    Client([Frontend / Mobile Clients]):::client

    subgraph Interfaces ["API Layer"]
        direction LR
        GraphQL[GraphQL Endpoint]:::interface
        REST[REST Endpoints]:::interface
        Auth[JWT / Auth]:::interface
    end

    subgraph Domains ["Modular Monolith (Packwerk)"]
        direction TB
        UserMgmt[User Management]:::domain
        ServiceCat[Service Catalog]:::domain
        BookingMgmt[Booking Management]:::domain
        Reviews[Reviews]:::domain
        
        %% Internal Dependencies
        BookingMgmt -.-> UserMgmt
        BookingMgmt -.-> ServiceCat
        ServiceCat -.-> Reviews
    end

    subgraph Infrastructure ["Infrastructure & Storage"]
        direction LR
        Jobs[[Sidekiq Workers]]:::infra
        Storage([ActiveStorage / S3]):::infra
        Redis[(Redis)]:::db
        DB[(PostgreSQL)]:::db
    end

    %% External Flow
    Client ==>|Queries/Mutations| GraphQL
    Client ==>|Uploads| REST

    %% API to Domain
    GraphQL --> Auth
    REST --> Auth
    
    GraphQL ==> Domains
    REST ==> Domains

    %% Domain to Infrastructure
    Domains ==> DB
    Domains --> Storage
    Domains --> Jobs
    
    %% Async Flow
    Jobs --> Redis
```

## Component Breakdown

### 1. API Layer
- **GraphQL (`/graphql`)**: The primary interface for the frontend. Uses `graphql-ruby`.
- **REST (`/api/v1`)**: Used for specialized operations like file uploads, analytics, and health checks.

### 2. Packs (Business Logic)
Each pack is a self-contained module with its own models, services, and tests.
- **`user_management`**: Handles authentication, user profiles, and roles (Admin, Vendor, Customer).
- **`service_catalog`**: Manages photographer services, categories, and portfolios.
- **`booking_management`**: Core logic for availability slots, booking requests, and status transitions.
- **`reviews`**: Handles customer feedback and rating distribution.

### 3. Core Services
- **`JWTService`**: Handles token issuance and verification.
- **`AuthorizeApiRequest`**: Command pattern service for securing endpoints.
- **`VendorAnalyticsService`**: Aggregates data for vendor dashboards.

### 4. Infrastructure
- **PostgreSQL**: Primary relational database.
- **Redis**: Powering Sidekiq for background jobs (image processing, email notifications).
- **ActiveStorage**: Handles portfolio image uploads and processing via `libvips`.

## Enforced Boundaries
We use `packwerk` to ensure that packs do not have circular dependencies and only access each other's public APIs.
