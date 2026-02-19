module Mutations
  class CreateReview < BaseMutation
    argument :booking_id, ID, required: true
    argument :rating, Integer, required: true
    argument :quality_rating, Integer, required: false
    argument :communication_rating, Integer, required: false
    argument :value_rating, Integer, required: false
    argument :punctuality_rating, Integer, required: false
    argument :comment, String, required: false

    field :review, Types::ReviewType, null: true
    field :errors, [String], null: false

    def resolve(booking_id:, rating:, **kwargs)
      user = context[:current_user]
      unless user
        return { review: nil, errors: ["Authentication required"] }
      end

      unless user.customer?
        return { review: nil, errors: ["Only customers can submit reviews"] }
      end

      booking = Booking.find_by(id: booking_id)
      unless booking
        return { review: nil, errors: ["Booking not found"] }
      end

      unless booking.customer == user
        return { review: nil, errors: ["You can only review your own bookings"] }
      end

      review = Review.new(
        booking: booking,
        customer: user,
        vendor_profile: booking.vendor_profile,
        service: booking.service,
        rating: rating,
        **kwargs
      )

      if review.save
        { review: review, errors: [] }
      else
        { review: nil, errors: review.errors.full_messages }
      end
    end
  end
end
