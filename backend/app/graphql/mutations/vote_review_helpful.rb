# frozen_string_literal: true

module Mutations
  class VoteReviewHelpful < Mutations::BaseMutation
    argument :review_id, ID, required: true

    field :errors, [String], null: false
    field :helpful_votes, Integer, null: false

    def resolve(review_id:)
      user = context[:current_user]
      return { helpful_votes: 0, errors: ['Authentication required'] } unless user

      review = Review.find_by(id: review_id)
      return { helpful_votes: 0, errors: ['Review not found'] } unless review

      result = ::Reviews::VoteHelpful.call(
        review: review,
        voter: user
      )

      if result[:success]
        {
          helpful_votes: result[:helpful_votes],
          errors: []
        }
      else
        {
          helpful_votes: 0,
          errors: Array(result[:error])
        }
      end
    rescue StandardError => e
      {
        helpful_votes: 0,
        errors: ["Failed to vote on review: #{e.message}"]
      }
    end
  end
end
