# frozen_string_literal: true

class ConflictResolutionService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attr_accessor :vendor
  attribute :event_date, :datetime
  attribute :event_end_date, :datetime
  attribute :exclude_booking_id, :integer

  validates :vendor, presence: true
  validates :event_date, presence: true

  def initialize(attributes = {})
    super
    @errors = ActiveModel::Errors.new(self)
    @event_end_date = event_end_date || event_date + 2.hours if event_date
  end

  def has_conflict?
    return false unless valid?

    conflicting_bookings.exists?
  end

  def conflicting_bookings
    @conflicting_bookings ||= begin
      bookings = Booking.where(vendor: vendor)
                       .where(status: [:pending, :accepted])
                       .where('DATE(event_date) = ?', event_date.to_date)

      # Exclude specific booking if provided (for updates)
      bookings = bookings.where.not(id: exclude_booking_id) if exclude_booking_id

      # Check for time overlaps
      bookings.where(
        '(event_date < ? AND COALESCE(event_end_date, event_date + INTERVAL \'2 hours\') > ?) OR ' \
        '(event_date < ? AND COALESCE(event_end_date, event_date + INTERVAL \'2 hours\') > ?)',
        @event_end_date, event_date,
        event_date, @event_end_date
      )
    end
  end

  def suggest_alternative_times
    return [] unless has_conflict?

    # Get vendor's availability for the requested date
    availability_slots = vendor.vendor_profile.availability_slots
                              .available
                              .for_date(event_date.to_date)

    return [] unless availability_slots.any?

    suggested_times = []
    duration = calculate_duration

    availability_slots.each do |slot|
      # Find free time slots within this availability slot
      free_slots = find_free_slots_in_availability(slot, duration)
      suggested_times.concat(free_slots)
    end

    suggested_times.uniq.sort_by { |slot| slot[:start_time] }
  end

  def errors
    @errors
  end

  private

  def calculate_duration
    return 2.hours unless @event_end_date

    (@event_end_date - event_date).seconds
  end

  def find_free_slots_in_availability(availability_slot, duration)
    free_slots = []
    slot_start = availability_slot.date.beginning_of_day + 
                availability_slot.start_time.seconds_since_midnight.seconds
    slot_end = availability_slot.date.beginning_of_day + 
              availability_slot.end_time.seconds_since_midnight.seconds

    # Handle overnight slots
    if availability_slot.end_time < availability_slot.start_time
      slot_end += 1.day
    end

    # Get all bookings for this date that might conflict
    existing_bookings = Booking.where(vendor: vendor)
                              .where(status: [:pending, :accepted])
                              .where('DATE(event_date) = ?', availability_slot.date)
                              .order(:event_date)

    current_time = slot_start
    
    existing_bookings.each do |booking|
      booking_start = booking.event_date
      booking_end = booking.event_end_date || booking.event_date + 2.hours

      # If there's enough time before this booking
      if booking_start - current_time >= duration
        free_slots << {
          start_time: current_time.strftime('%H:%M'),
          end_time: (current_time + duration).strftime('%H:%M'),
          duration_hours: (duration / 1.hour).round(2)
        }
      end

      current_time = [current_time, booking_end].max
    end

    # Check if there's time after the last booking
    if slot_end - current_time >= duration
      free_slots << {
        start_time: current_time.strftime('%H:%M'),
        end_time: (current_time + duration).strftime('%H:%M'),
        duration_hours: (duration / 1.hour).round(2)
      }
    end

    free_slots
  end
end