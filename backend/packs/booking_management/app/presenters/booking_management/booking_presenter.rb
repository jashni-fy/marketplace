# frozen_string_literal: true

class BookingManagement::BookingPresenter
  attr_reader :booking

  def self.collection(bookings, **options)
    bookings.map { |booking| new(booking).as_json(**options) }
  end

  def initialize(booking)
    @booking = booking
  end

  def as_json(include_details: false)
    payload = base_payload
    return payload unless include_details

    payload.merge(
      messages_count: booking.booking_messages.count,
      last_message_at: booking.booking_messages.maximum(:sent_at)
    )
  end

  private

  delegate :customer, :service, :vendor_profile, to: :booking

  def base_payload
    core_payload.merge(
      service: service_hash,
      customer: customer_hash,
      vendor: vendor_hash
    )
  end

  def core_payload
    {
      id: booking.id,
      status: booking.status,
      event_date: booking.event_date,
      event_end_date: booking.event_end_date,
      event_location: booking.event_location,
      total_amount: booking.total_amount,
      requirements: booking.requirements,
      special_instructions: booking.special_instructions,
      event_duration: booking.event_duration,
      duration_hours: booking.duration_hours,
      can_be_modified: booking.can_be_modified?,
      can_be_cancelled: booking.can_be_cancelled?,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }
  end

  def service_hash
    {
      id: service.id,
      name: service.name,
      category: service.category_name
    }
  end

  def customer_hash
    {
      id: customer.id,
      name: customer.full_name,
      email: customer.email
    }
  end

  def vendor_hash
    {
      id: vendor_profile.user_id,
      name: vendor_profile.user.full_name,
      business_name: vendor_profile.business_name,
      profile_id: vendor_profile.id
    }
  end
end
