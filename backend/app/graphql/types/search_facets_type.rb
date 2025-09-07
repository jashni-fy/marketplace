module Types
  class SearchFacetsType < Types::BaseObject
    field :categories, [Types::CategoryFacetType], null: false, description: "Available service categories with counts"
    field :price_ranges, [Types::PriceRangeFacetType], null: false, description: "Price range buckets with counts"
    field :locations, [Types::LocationFacetType], null: false, description: "Available locations with counts"
    field :pricing_types, [Types::PricingTypeFacetType], null: false, description: "Available pricing types with counts"
    field :vendor_ratings, [Types::RatingFacetType], null: false, description: "Vendor rating ranges with counts"
  end
end