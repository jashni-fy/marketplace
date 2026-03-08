# frozen_string_literal: true

module Bookings
  class AuthorizeAccess
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)
    option :user, type: Types.Instance(User)

    def self.call(booking:, user:, action:)
      new(booking: booking, user: user).call(action)
    end

    def call(action)
      case action
      when :access
        booking.customer == user || booking.vendor == user
      when :modify
        booking.customer == user && booking.can_be_modified?
      when :vendor_respond
        booking.vendor == user && booking.pending?
      else
        raise ArgumentError, "Unknown action: #{action}"
      end
    end
  end
end
