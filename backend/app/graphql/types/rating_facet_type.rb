# frozen_string_literal: true

class Types::RatingFacetType < Types::BaseObject
  field :min_rating, Float, null: false
  field :max_rating, Float, null: false
  field :label, String, null: false, description: 'Human-readable rating range label'
  field :count, Integer, null: false, description: 'Number of vendors in this rating range'
end
