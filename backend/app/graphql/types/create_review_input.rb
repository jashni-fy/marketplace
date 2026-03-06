# frozen_string_literal: true

class Types::CreateReviewInput < Types::BaseInputObject
  description 'Attributes required to submit a new booking review'

  argument :booking_id, ID, required: true, description: 'ID of the booking being reviewed'
  argument :comment, String, required: false, description: 'Optional review comment'
  argument :communication_rating, Integer, required: false, description: 'Communication rating (1-5)'
  argument :punctuality_rating, Integer, required: false, description: 'Punctuality rating (1-5)'
  argument :quality_rating, Integer, required: false, description: 'Quality rating (1-5)'
  argument :rating, Integer, required: true, description: 'Overall rating (1-5)'
  argument :value_rating, Integer, required: false, description: 'Value for money rating (1-5)'
end
