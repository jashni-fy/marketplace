# frozen_string_literal: true

# Single source of truth for booking conflict logic
class BookingConflictsQuery
  def initialize(vendor_profile:, event_date:, event_end_date: nil)
    @vendor_profile = vendor_profile
    @event_date = event_date
    @event_end_date = event_end_date || (event_date + 2.hours)
  end

  def self.call(**params)
    new(**params).call
  end

  def call
    bookings.exists?
  end

  def bookings
    Booking
      .where(vendor_profile: @vendor_profile)
      .where(status: %i[pending accepted])
      .overlapping_period(@event_date, @event_end_date)
  end
end
