# frozen_string_literal: true

class Types::ReviewType < Types::BaseObject
  description 'Details of a customer review for a booking'

  field :comment, String, null: true, description: 'Customer comments about the service'
  field :communication_rating, Integer, null: true, description: 'Communication score (1-5)'
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'Timestamp when the review was created'
  field :id, ID, null: false, description: 'Unique identifier of the review'
  field :punctuality_rating, Integer, null: true, description: 'Punctuality score (1-5)'
  field :quality_rating, Integer, null: true, description: 'Quality score (1-5)'
  field :rating, Integer, null: false, description: 'Overall rating (1-5)'
  field :status, String, null: false, description: 'Current status of the review'
  field :updated_at,
        GraphQL::Types::ISO8601DateTime,
        null: false,
        description: 'Timestamp when the review was last updated'
  field :value_rating, Integer, null: true, description: 'Value for money score (1-5)'

  # Associations
  field :booking, Types::NodeType, null: false, description: 'Booking that was reviewed'
  field :customer, Types::UserType, null: false, description: 'Customer who submitted the review'
  field :service, Types::ServiceType, null: false, description: 'Service that the review targets'
  field :vendor_profile,
        Types::VendorProfileType,
        null: false,
        description: 'Vendor profile associated with the service'
end
