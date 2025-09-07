module Types
  class PriceRangeFacetType < Types::BaseObject
    field :min_price, Float, null: false
    field :max_price, Float, null: false
    field :label, String, null: false, description: "Human-readable price range label"
    field :count, Integer, null: false, description: "Number of services in this price range"
  end
end