# frozen_string_literal: true

class Types::RatingBreakdownType < Types::BaseObject
  description 'Average rating components for a vendor profile'

  field :communication, Float, null: false, description: 'Average communication score'
  field :punctuality, Float, null: false, description: 'Average punctuality score'
  field :quality, Float, null: false, description: 'Average quality score'
  field :value, Float, null: false, description: 'Average value-for-money score'
end
