# frozen_string_literal: true

class BookingManagement::AvailabilitySlotPresenter
  attr_reader :slot

  def initialize(slot)
    @slot = slot
  end

  def as_json
    {
      id: slot.id,
      date: slot.date,
      start_time: format_time(slot.start_time),
      end_time: format_time(slot.end_time),
      time_range: slot.time_range,
      duration_hours: slot.duration_hours,
      is_available: slot.is_available,
      has_booking_conflict: slot.booking_conflict?,
      created_at: slot.created_at,
      updated_at: slot.updated_at
    }
  end

  private

  def format_time(time)
    time&.strftime('%H:%M')
  end
end
