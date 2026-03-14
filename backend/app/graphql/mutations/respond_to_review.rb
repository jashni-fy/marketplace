# frozen_string_literal: true

module Mutations
  class RespondToReview < Mutations::BaseMutation
    argument :response, String, required: true
    argument :review_id, ID, required: true

    field :errors, [String], null: false
    field :review, Types::ReviewType, null: true

    def resolve(review_id:, response:)
      user = context[:current_user]
      return { review: nil, errors: ['Authentication required'] } unless user

      review = Review.find_by(id: review_id)
      return { review: nil, errors: ['Review not found'] } unless review

      result = ::Reviews::RespondToReview.call(
        review: review,
        vendor: user,
        response: response
      )

      if result[:success]
        {
          review: result[:review],
          errors: []
        }
      else
        {
          review: nil,
          errors: Array(result[:error])
        }
      end
    rescue StandardError => e
      {
        review: nil,
        errors: ["Failed to respond to review: #{e.message}"]
      }
    end
  end
end
