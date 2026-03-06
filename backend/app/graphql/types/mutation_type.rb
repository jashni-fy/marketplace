# frozen_string_literal: true

class Types::MutationType < Types::BaseObject
  description 'Root entry point for mutations'

  field :create_review, mutation: Mutations::CreateReview,
                        description: 'Submit a review for an existing booking'
  # TODO: remove me
  field :test_field, String, null: false, description: 'An example field added by the generator'
  def test_field
    'Hello World'
  end
end
