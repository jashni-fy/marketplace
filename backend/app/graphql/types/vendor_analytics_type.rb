# frozen_string_literal: true

class Types::VendorAnalyticsType < Types::BaseObject
  description 'Aggregated analytics data surfaced on the vendor dashboard'

  field :booking_stats, GraphQL::Types::JSON, null: false, description: 'Summary of booking metrics'
  field :overview, GraphQL::Types::JSON, null: false, description: 'High-level overview data'
  field :rating_stats, GraphQL::Types::JSON, null: false, description: 'Rating statistics for the vendor'
  field :recent_activity,
        [GraphQL::Types::JSON],
        null: false,
        description: 'List of recent actions related to the vendor'
  field :revenue_stats, GraphQL::Types::JSON, null: false, description: 'Summary of revenue performance'
end
