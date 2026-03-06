# frozen_string_literal: true

class Types::RatingBreakdownType < Types::BaseObject
  field :quality, Float, null: false
  field :communication, Float, null: false
  field :value, Float, null: false
  field :punctuality, Float, null: false
end
