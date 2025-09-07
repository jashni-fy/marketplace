# GraphQL Implementation for Advanced Search

This document describes the GraphQL implementation for advanced search capabilities in the marketplace application.

## Overview

The GraphQL implementation provides advanced search functionality with flexible filtering, faceted search, and geospatial queries. It's designed to complement the existing REST API by handling complex search scenarios efficiently.

## Key Features

### 1. Advanced Service Search
- **Endpoint**: `POST /graphql`
- **Query**: `searchServices`
- **Features**:
  - Text-based search across service names, descriptions, and vendor names
  - Category filtering
  - Price range filtering
  - Vendor rating filtering
  - Location-based filtering (text and geospatial)
  - Pagination and sorting
  - Faceted search results

### 2. Geospatial Search
- Location-based search using latitude/longitude coordinates
- Radius-based filtering (in kilometers)
- Distance calculations using Haversine formula
- Coordinate validation and error handling

### 3. Query Complexity Analysis
- Maximum query complexity: 1000
- Maximum query depth: 15
- Query complexity analysis for performance monitoring
- Rate limiting protection against expensive queries

### 4. Faceted Search Results
- **Category facets**: Available service categories with counts
- **Price range facets**: Predefined price buckets with counts
- **Location facets**: Available locations with service counts
- **Pricing type facets**: Different pricing models with counts
- **Vendor rating facets**: Rating ranges with vendor counts

## GraphQL Schema

### Main Query Types

```graphql
type Query {
  # Advanced search
  searchServices(
    query: String
    filters: ServiceFiltersInput
    location: LocationInput
    pagination: PaginationInput
  ): ServiceSearchResult!
  
  # Basic queries
  service(id: ID!): Service
  services(limit: Int): [Service!]!
  serviceCategories: [ServiceCategory!]!
  vendorProfile(id: ID!): VendorProfile
}
```

### Input Types

```graphql
input ServiceFiltersInput {
  categories: [ID!]
  priceMin: Float
  priceMax: Float
  pricingType: String
  vendorRating: Float
  verifiedVendorsOnly: Boolean
  status: String
}

input LocationInput {
  latitude: Float
  longitude: Float
  radius: Float
  city: String
  state: String
  country: String
  address: String
}

input PaginationInput {
  page: Int = 1
  perPage: Int = 20
  sortBy: String = "created_at"
  sortOrder: String = "desc"
}
```

### Result Types

```graphql
type ServiceSearchResult {
  services: [Service!]!
  totalCount: Int!
  currentPage: Int!
  perPage: Int!
  totalPages: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  facets: SearchFacets!
  searchTime: Float!
}

type SearchFacets {
  categories: [CategoryFacet!]!
  priceRanges: [PriceRangeFacet!]!
  locations: [LocationFacet!]!
  pricingTypes: [PricingTypeFacet!]!
  vendorRatings: [RatingFacet!]!
}
```

## Example Queries

### Basic Search
```graphql
{
  searchServices(query: "photography") {
    services {
      id
      name
      basePrice
      vendorBusinessName
      serviceCategory {
        name
        slug
      }
    }
    totalCount
    searchTime
  }
}
```

### Advanced Search with Filters
```graphql
{
  searchServices(
    query: "wedding"
    filters: {
      categories: ["1"]
      priceMin: 1000
      priceMax: 5000
      vendorRating: 4.0
      verifiedVendorsOnly: true
    }
    location: {
      city: "New York"
    }
    pagination: {
      page: 1
      perPage: 10
      sortBy: "price"
      sortOrder: "asc"
    }
  ) {
    services {
      id
      name
      basePrice
      vendorBusinessName
      vendorLocation
      vendorAverageRating
    }
    totalCount
    currentPage
    totalPages
    facets {
      categories {
        id
        name
        count
      }
      priceRanges {
        minPrice
        maxPrice
        label
        count
      }
    }
  }
}
```

### Geospatial Search
```graphql
{
  searchServices(
    location: {
      latitude: 40.7128
      longitude: -74.0060
      radius: 50
    }
  ) {
    services {
      id
      name
      vendorProfile {
        businessName
        location
        hasCoordinates
        coordinates
        distanceTo(latitude: 40.7128, longitude: -74.0060)
      }
    }
    totalCount
  }
}
```

## Performance Considerations

### Query Complexity
- Each field has an assigned complexity value
- Complex associations (like vendor profiles) have higher complexity
- Total query complexity is calculated and limited

### Caching Strategy
- Facet generation can be cached for frequently accessed filters
- Search results can be cached based on query parameters
- Consider implementing Redis caching for production

### Database Optimization
- Proper indexing on searchable fields
- Geospatial indexes for location-based queries
- Consider using database-specific full-text search features

## Security Features

### Rate Limiting
- Query complexity analysis prevents expensive queries
- Query depth limits prevent deeply nested queries
- Token limits prevent overly large query strings

### Input Validation
- All input parameters are validated
- Pagination limits are enforced (max 100 items per page)
- Coordinate validation for geospatial queries

## Development Tools

### GraphiQL Interface
- Available at `/graphiql` in development mode
- Interactive query builder and documentation
- Real-time query validation and testing

### Testing
- Comprehensive test suite for resolvers and types
- Integration tests for complete search workflows
- Performance tests for complex queries

## Future Enhancements

### Elasticsearch Integration
- Full-text search capabilities
- Advanced relevance scoring
- Real-time indexing

### PostGIS Integration
- More advanced geospatial queries
- Polygon-based location filtering
- Spatial relationship queries

### Real-time Features
- GraphQL subscriptions for live search results
- Real-time facet updates
- Live availability updates

## Usage Guidelines

### When to Use GraphQL vs REST
- **Use GraphQL for**:
  - Complex search queries with multiple filters
  - Faceted search requirements
  - Flexible data fetching needs
  - Advanced filtering and aggregation

- **Use REST for**:
  - Simple CRUD operations
  - File uploads
  - Standard resource management
  - Authentication flows

### Best Practices
- Always specify required fields only
- Use pagination for large result sets
- Implement proper error handling
- Monitor query complexity in production
- Cache frequently accessed data