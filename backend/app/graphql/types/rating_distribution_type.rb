module Types
  class RatingDistributionType < Types::BaseObject
    field :five_star, Integer, null: false
    field :four_star, Integer, null: false
    field :three_star, Integer, null: false
    field :two_star, Integer, null: false
    field :one_star, Integer, null: false

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
end
