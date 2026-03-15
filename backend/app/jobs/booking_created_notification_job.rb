# frozen_string_literal: true

class BookingCreatedNotificationJob < ApplicationJob
  queue_as :default
  discard_on ActiveRecord::RecordNotFound

  def perform(booking_id, recipient_id)
    idempotency_key = JobIdempotencyCache.generate_key(self.class.name, booking_id, recipient_id)
    return if JobIdempotencyCache.processed?(idempotency_key)

    booking = Booking.find(booking_id)
    recipient = User.find(recipient_id)

    # Send email notification via service layer
    Notifications::EmailService.send_booking_created(booking, recipient)

    # Create in-app notification
    InAppNotification.create_notification(
      user_id: recipient.id,
      title: 'New Booking Request',
      message: "You have a new booking request from #{booking.customer.full_name} for #{booking.service.name}",
      notification_type: 'booking_created',
      related_type: 'Booking',
      related_id: booking.id
    )

    JobIdempotencyCache.mark_processed(idempotency_key)
    Rails.logger.info "Booking created notification sent for booking #{booking_id} to user #{recipient_id}"
  end
end
