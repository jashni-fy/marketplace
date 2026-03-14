# frozen_string_literal: true

module Types
  class InAppNotificationType < Types::BaseObject
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :id, ID, null: false
    field :is_read, Boolean, null: false
    field :message, String, null: false
    field :notification_type, String, null: false
    field :related_id, Integer, null: true
    field :related_type, String, null: true
    field :title, String, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :user_id, ID, null: false
  end
end
