# frozen_string_literal: true

class Types::VendorAnalyticsType < Types::BaseObject
  field :overview, GraphQL::Types::JSON, null: false
  field :revenue_stats, GraphQL::Types::JSON, null: false
  field :booking_stats, GraphQL::Types::JSON, null: false
  field :rating_stats, GraphQL::Types::JSON, null: false
  field :recent_activity, [GraphQL::Types::JSON], null: false
end
