# frozen_string_literal: true

module Types
  class EmailNotificationPreferenceType < Types::BaseObject
    field :booking_accepted, Boolean, null: false, description: 'Receive email when booking is accepted'
    field :booking_cancelled, Boolean, null: false, description: 'Receive email when booking is cancelled'
    field :booking_created, Boolean, null: false, description: 'Receive email when booking is created'
    field :booking_rejected, Boolean, null: false, description: 'Receive email when booking is rejected'
    field :booking_reminder, Boolean, null: false, description: 'Receive email reminder before booking'
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :id, ID, null: false
    field :new_message, Boolean, null: false, description: 'Receive email for new messages'
    field :review_received, Boolean, null: false, description: 'Receive email when review is received'
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :user_id, ID, null: false
  end
end
