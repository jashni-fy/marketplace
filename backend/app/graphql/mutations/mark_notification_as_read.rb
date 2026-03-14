# frozen_string_literal: true

module Mutations
  class MarkNotificationAsRead < Mutations::BaseMutation
    argument :notification_id, ID, required: true

    field :errors, [String], null: false
    field :notification, Types::InAppNotificationType, null: true

    def resolve(notification_id:)
      notification = InAppNotification.find_by(id: notification_id)
      return error_response('Notification not found') unless notification

      return error_response('Unauthorized') unless notification.user_id == context[:current_user]&.id

      if notification.mark_as_read!
        { notification: notification, errors: [] }
      else
        error_response(notification.errors.full_messages)
      end
    end

    private

    def error_response(messages)
      { notification: nil, errors: Array(messages) }
    end
  end
end
