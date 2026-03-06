# frozen_string_literal: true

class Mutations::CreateReview < BaseMutation
  argument :booking_id, ID, required: true
  argument :rating, Integer, required: true
  argument :quality_rating, Integer, required: false
  argument :communication_rating, Integer, required: false
  argument :value_rating, Integer, required: false
  argument :punctuality_rating, Integer, required: false
  argument :comment, String, required: false

  field :review, Types::ReviewType, null: true
  field :errors, [String], null: false

  def resolve(booking_id:, rating:, **)
    user = context[:current_user]
    return { review: nil, errors: ['Authentication required'] } unless user

    return { review: nil, errors: ['Only customers can submit reviews'] } unless user.customer?

    booking = Booking.find_by(id: booking_id)
    return { review: nil, errors: ['Booking not found'] } unless booking

    return { review: nil, errors: ['You can only review your own bookings'] } unless booking.customer == user

    review = Review.new(
      booking: booking,
      customer: user,
      vendor_profile: booking.vendor_profile,
      service: booking.service,
      rating: rating,
      **
    )

    if review.save
      { review: review, errors: [] }
    else
      { review: nil, errors: review.errors.full_messages }
    end
  end
end
