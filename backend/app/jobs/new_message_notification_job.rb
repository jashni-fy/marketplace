# frozen_string_literal: true

class NewMessageNotificationJob < ApplicationJob
  queue_as :default
  discard_on ActiveRecord::RecordNotFound

  def perform(message_id, recipient_id)
    idempotency_key = JobIdempotencyCache.generate_key(self.class.name, message_id, recipient_id)
    return if JobIdempotencyCache.processed?(idempotency_key)

    message = BookingMessage.find(message_id)
    recipient = User.find(recipient_id)

    # Send email notification via service layer
    Notifications::EmailService.send_new_message(message, recipient)

    # Create in-app notification
    InAppNotification.create_notification(
      user_id: recipient.id,
      title: 'New Message',
      message: 'You have a new message about your booking',
      notification_type: 'new_message',
      related_type: 'Booking',
      related_id: message.booking.id
    )

    JobIdempotencyCache.mark_processed(idempotency_key)
    Rails.logger.info "New message notification sent for message #{message_id} to user #{recipient_id}"
  end
end
