# frozen_string_literal: true

module Notifications
  class SendBookingStatusChange
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)
    option :status, type: Types::String

    def self.call(**)
      new(**).call
    end

    def call
      case status
      when 'confirmed'
        send_confirmation_notification
      when 'cancelled'
        send_cancellation_notification
      else
        { success: false, error: "Unknown status: #{status}" }
      end
    end

    private

    def send_confirmation_notification
      # Notify customer that vendor accepted their booking
      SendNotification.call(
        user: booking.customer,
        title: 'Booking Accepted',
        message: "#{booking.vendor_profile.display_name} has accepted your booking request for #{booking.event_date.strftime('%B %d, %Y')}.",
        notification_type: 'booking_accepted',
        related_type: 'Booking',
        related_id: booking.id
      )
      { success: true }
    rescue StandardError => e
      Rails.logger.error("Failed to send confirmation notification: #{e.message}")
      { success: false, error: e.message }
    end

    def send_cancellation_notification
      # Notify both parties about cancellation
      SendNotification.call(
        user: booking.customer,
        title: 'Booking Cancelled',
        message: "Your booking with #{booking.vendor_profile.display_name} for #{booking.event_date.strftime('%B %d, %Y')} has been cancelled.",
        notification_type: 'booking_cancelled',
        related_type: 'Booking',
        related_id: booking.id
      )

      SendNotification.call(
        user: booking.vendor_profile.user,
        title: 'Booking Cancelled',
        message: "The booking from #{booking.customer.full_name} for #{booking.event_date.strftime('%B %d, %Y')} has been cancelled.",
        notification_type: 'booking_cancelled',
        related_type: 'Booking',
        related_id: booking.id
      )
      { success: true }
    rescue StandardError => e
      Rails.logger.error("Failed to send cancellation notification: #{e.message}")
      { success: false, error: e.message }
    end
  end
end
