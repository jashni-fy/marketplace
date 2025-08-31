# User Management Pack

This pack handles user authentication and vendor profile management for the marketplace application.

## Vendor Profile Management API

### Endpoints

#### GET /api/v1/profiles/service_categories
Returns a list of active service categories available for vendor profiles.

**Authentication:** Not required
**Response:**
```json
{
  "service_categories": [
    {
      "id": 1,
      "name": "Photography",
      "slug": "photography",
      "description": "Professional photography services for events, portraits, and commercial needs"
    }
  ]
}
```

#### GET /api/v1/profiles/me
Returns the current authenticated vendor's profile.

**Authentication:** Required (Vendor role)
**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "business_name": "John's Photography",
  "description": "Professional photography services...",
  "location": "New York, NY",
  "phone": "+1-555-123-4567",
  "website": "https://johnsphotography.com",
  "service_categories": ["Photography", "Event Management"],
  "business_license": "ABC123",
  "years_experience": 5,
  "is_verified": false,
  "average_rating": 4.5,
  "total_reviews": 10,
  "profile_complete": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/v1/profiles/:id
Returns a specific vendor profile by ID.

**Authentication:** Required
**Response:** Same as `/me` endpoint

#### POST /api/v1/profiles
Creates a new vendor profile for the authenticated user.

**Authentication:** Required (Vendor role)
**Request Body:**
```json
{
  "vendor_profile": {
    "business_name": "New Photography Business",
    "description": "Professional photography services with years of experience...",
    "location": "San Francisco, CA",
    "phone": "+1-555-987-6543",
    "website": "https://newphotography.com",
    "years_experience": 3,
    "service_categories_list": ["Photography", "Event Management"]
  }
}
```

#### PUT /api/v1/profiles/:id
Updates an existing vendor profile.

**Authentication:** Required (Profile owner only)
**Request Body:** Same as POST endpoint

#### DELETE /api/v1/profiles/:id
Deletes a vendor profile.

**Authentication:** Required (Profile owner only)
**Response:** 204 No Content

### Validation Rules

#### Business Name
- Required
- Minimum 2 characters
- Maximum 100 characters

#### Description
- Minimum 50 characters when present
- Maximum 2000 characters

#### Location
- Required
- Maximum 255 characters

#### Phone
- Must match format: `/\A[\+]?[\d\s\-\(\)]{7,15}\z/`

#### Website
- Must be a valid URL format
- Automatically prefixed with `https://` if protocol is missing

#### Years Experience
- Must be between 0 and 99

#### Service Categories
- Can be provided as an array of category names
- Categories are stored as comma-separated string

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "error": "Access denied. Vendor role required."
}
```

#### 404 Not Found
```json
{
  "error": "Vendor profile not found"
}
```

#### 422 Unprocessable Content
```json
{
  "error": "Profile creation failed",
  "details": [
    "Business name can't be blank",
    "Description is too short (minimum is 50 characters)"
  ]
}
```

### Business Logic

1. **Automatic Profile Creation**: When a user registers with vendor role, a basic vendor profile is automatically created.

2. **Profile Ownership**: Vendors can only manage their own profiles. Attempting to modify another vendor's profile returns a 403 Forbidden error.

3. **Service Categories**: The service categories endpoint is public to allow frontend applications to populate category dropdowns without authentication.

4. **Profile Completeness**: The API includes a `profile_complete` field that indicates whether the profile has all required information for public display.

### Testing

Run the test suite with:
```bash
bundle exec rspec packs/user_management/spec/controllers/api/v1/profiles_controller_spec.rb
bundle exec rspec spec/integration/vendor_profile_management_spec.rb
```

### Dependencies

- JWT authentication via `JwtService`
- Service categories from the `service_catalog` pack
- User model with role-based access control