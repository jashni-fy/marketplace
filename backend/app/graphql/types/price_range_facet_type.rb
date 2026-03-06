# frozen_string_literal: true

class Types::PriceRangeFacetType < Types::BaseObject
  description 'Price range bucket used to filter services'

  field :count, Integer, null: false, description: 'Number of services in this price range'
  field :label, String, null: false, description: 'Human-readable price range label'
  field :max_price, Float, null: false, description: 'Upper bound of the price bucket'
  field :min_price, Float, null: false, description: 'Lower bound of the price bucket'
end
