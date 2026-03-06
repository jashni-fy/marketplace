# frozen_string_literal: true

class Types::RatingDistributionType < Types::BaseObject
  description 'Count of reviews grouped by rating value'

  field :five_star, Integer, null: false, description: 'Count of five-star reviews'
  field :four_star, Integer, null: false, description: 'Count of four-star reviews'
  field :one_star, Integer, null: false, description: 'Count of one-star reviews'
  field :three_star, Integer, null: false, description: 'Count of three-star reviews'
  field :two_star, Integer, null: false, description: 'Count of two-star reviews'

  def five_star
    object[5]
  end

  def four_star
    object[4]
  end

  def three_star
    object[3]
  end

  def two_star
    object[2]
  end

  def one_star
    object[1]
  end
end
