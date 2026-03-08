# frozen_string_literal: true

module Bookings
  # Validates booking status transitions to prevent invalid state changes
  # Booking lifecycle: pending -> accepted/declined/counter_offered -> completed/cancelled
  class StateMachine
    VALID_TRANSITIONS = {
      pending: %i[accepted declined counter_offered cancelled],
      accepted: %i[completed cancelled],
      declined: %i[], # Terminal state
      counter_offered: %i[accepted declined cancelled],
      completed: %i[],  # Terminal state
      cancelled: %i[]   # Terminal state
    }.freeze

    def self.valid_transition?(from_status, to_status)
      from = from_status.to_sym
      to = to_status.to_sym
      VALID_TRANSITIONS[from]&.include?(to) || false
    end

    def self.can_transition?(booking, new_status)
      return false unless valid_transition?(booking.status, new_status)

      case new_status.to_sym
      when :cancelled
        booking.event_date > 24.hours.from_now
      when :completed
        booking.accepted? || booking.pending?
      else
        true
      end
    end

    # Document valid transitions for API/UI
    def self.available_transitions_for(status)
      VALID_TRANSITIONS[status.to_sym] || []
    end
  end
end
