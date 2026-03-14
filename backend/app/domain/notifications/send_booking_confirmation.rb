# frozen_string_literal: true

module Notifications
  class SendBookingConfirmation
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)

    def self.call(**)
      new(**).call
    end

    def call
      # Notify customer about booking confirmation
      SendNotification.call(
        user: booking.customer,
        title: 'Booking Confirmed',
        message: "Your booking with #{booking.vendor_profile.display_name} for #{booking.event_date.strftime('%B %d, %Y')} has been confirmed.",
        notification_type: 'booking_created',
        related_type: 'Booking',
        related_id: booking.id
      )

      # Notify vendor about new booking
      SendNotification.call(
        user: booking.vendor_profile.user,
        title: 'New Booking Request',
        message: "You have a new booking request from #{booking.customer.full_name} for #{booking.event_date.strftime('%B %d, %Y')}.",
        notification_type: 'booking_created',
        related_type: 'Booking',
        related_id: booking.id,
        skip_email: false # Always notify vendor about new bookings
      )
    rescue StandardError => e
      Rails.logger.error("Failed to send booking confirmation: #{e.message}")
      { success: false, error: e.message }
    end
  end
end
