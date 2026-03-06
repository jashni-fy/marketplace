# frozen_string_literal: true

class Types::RatingFacetType < Types::BaseObject
  description 'Rating range bucket for vendor search results'

  field :count, Integer, null: false, description: 'Number of vendors in this rating range'
  field :label, String, null: false, description: 'Human-readable rating range label'
  field :max_rating, Float, null: false, description: 'Upper bound for the rating bucket'
  field :min_rating, Float, null: false, description: 'Lower bound for the rating bucket'
end
