module Types
  class PricingTypeFacetType < Types::BaseObject
    field :pricing_type, String, null: false
    field :label, String, null: false, description: "Human-readable pricing type label"
    field :count, Integer, null: false, description: "Number of services with this pricing type"
  end
end