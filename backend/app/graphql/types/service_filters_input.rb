# frozen_string_literal: true

class Types::ServiceFiltersInput < Types::BaseInputObject
  description 'Filtering options for service search results'
  argument :categories, [ID], required: false, description: 'Filter by service category IDs'
  argument :price_max, Float, required: false, description: 'Maximum price filter'
  argument :price_min, Float, required: false, description: 'Minimum price filter'
  argument :pricing_type, String, required: false, description: 'Filter by pricing type (hourly, package, custom)'
  argument :status, String, required: false, description: 'Filter by service status (active, inactive, draft)'
  argument :vendor_rating, Float, required: false, description: 'Minimum vendor rating filter'
  argument :verified_vendors_only, Boolean, required: false, description: 'Show only verified vendors'
end
