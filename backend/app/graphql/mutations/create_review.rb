# frozen_string_literal: true

class Mutations::CreateReview < BaseMutation
  description 'Creates a new review for a booking'

  argument :review_input,
           Types::CreateReviewInput,
           required: true,
           description: 'Attributes for the review that will be created'

  field :errors, [String], null: false, description: 'Errors encountered during review creation'
  field :review, Types::ReviewType, null: true, description: 'The created review'

  def resolve(review_input:)
    user = context[:current_user]
    return { review: nil, errors: ['Authentication required'] } unless user

    return { review: nil, errors: ['Only customers can submit reviews'] } unless user.customer?

    booking = Booking.find_by(id: review_input.booking_id)
    return { review: nil, errors: ['Booking not found'] } unless booking

    return { review: nil, errors: ['You can only review your own bookings'] } unless booking.customer == user

    review_attributes = review_input.to_h.reject { |key, _| key.to_sym == :booking_id }

    review = Review.new(
      booking: booking,
      customer: user,
      vendor_profile: booking.vendor_profile,
      service: booking.service,
      **review_attributes
    )

    if review.save
      { review: review, errors: [] }
    else
      { review: nil, errors: review.errors.full_messages }
    end
  end
end
