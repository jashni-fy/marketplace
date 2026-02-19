module Types
  class ReviewType < Types::BaseObject
    field :id, ID, null: false
    field :rating, Integer, null: false
    field :quality_rating, Integer, null: true
    field :communication_rating, Integer, null: true
    field :value_rating, Integer, null: true
    field :punctuality_rating, Integer, null: true
    field :comment, String, null: true
    field :status, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    # Associations
    field :customer, Types::UserType, null: false
    field :service, Types::ServiceType, null: false
    field :vendor_profile, Types::VendorProfileType, null: false
    field :booking, Types::NodeType, null: false # Or specific BookingType if exists
  end
end
