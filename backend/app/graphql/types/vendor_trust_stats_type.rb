# frozen_string_literal: true

class Types::VendorTrustStatsType < Types::BaseObject
  description 'Trust and credibility metrics for a vendor'

  field :completion_rate, Float, null: true, description: 'Percentage of bookings completed (0.0-1.0)'
  field :member_since, GraphQL::Types::ISO8601DateTime, null: false, description: 'When vendor joined the platform'
  field :repeat_customer_rate, Float, null: true, description: 'Percentage of customers who booked multiple times'
  field :response_rate, Float, null: true, description: 'Percentage of bookings vendor responded to within 48 hours'
  field :response_time_hours, Float, null: true, description: 'Average response time in hours'
  field :total_events, Integer, null: false, description: 'Total number of completed bookings'
end
