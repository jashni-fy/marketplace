# frozen_string_literal: true

module Mutations
  class UpdateEmailNotificationPreferences < Mutations::BaseMutation
    argument :booking_accepted, Boolean, required: false
    argument :booking_cancelled, Boolean, required: false
    argument :booking_created, Boolean, required: false
    argument :booking_rejected, Boolean, required: false
    argument :booking_reminder, Boolean, required: false
    argument :new_message, Boolean, required: false
    argument :review_received, Boolean, required: false

    field :errors, [String], null: false
    field :preference, Types::EmailNotificationPreferenceType, null: true

    def resolve(**args)
      preference = context[:current_user]&.email_notification_preference
      return error_response('Preferences not found') unless preference

      updates = args.compact
      return error_response('No updates provided') if updates.empty?

      if preference.update(updates)
        { preference: preference, errors: [] }
      else
        error_response(preference.errors.full_messages)
      end
    end

    private

    def error_response(messages)
      { preference: nil, errors: Array(messages) }
    end
  end
end
