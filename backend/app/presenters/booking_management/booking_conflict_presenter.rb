# frozen_string_literal: true

class BookingManagement::BookingConflictPresenter
  attr_reader :booking

  def initialize(booking)
    @booking = booking
  end

  def as_json
    {
      id: booking.id,
      event_date: booking.event_date,
      event_end_date: booking.event_end_date,
      status: booking.status,
      service_name: booking.service.name,
      customer_name: booking.customer.full_name
    }
  end
end
