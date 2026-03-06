# frozen_string_literal: true

class Types::PricingTypeFacetType < Types::BaseObject
  description 'Facet describing how services are priced'

  field :count, Integer, null: false, description: 'Number of services with this pricing type'
  field :label, String, null: false, description: 'Human-readable pricing type label'
  field :pricing_type, String, null: false, description: 'Internal identifier for the pricing type'
end
