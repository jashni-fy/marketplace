# frozen_string_literal: true

class AvailabilitySlot < ApplicationRecord
  belongs_to :vendor_profile

  validates :date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :is_available, inclusion: { in: [true, false] }

  validate :end_time_after_start_time
  validate :date_not_in_past, on: :create

  scope :available, -> { where(is_available: true) }
  scope :for_date, ->(date) { where(date: date) }
  scope :for_vendor, ->(vendor_profile) { where(vendor_profile: vendor_profile) }
  scope :upcoming, -> { where('date >= ?', Date.current) }

  def duration_hours
    return 0 unless start_time && end_time
    
    # Convert times to seconds from midnight and calculate difference
    end_seconds = end_time.seconds_since_midnight
    start_seconds = start_time.seconds_since_midnight
    
    # Handle case where end time is next day
    if end_seconds < start_seconds
      end_seconds += 24.hours
    end
    
    (end_seconds - start_seconds) / 1.hour
  end

  def time_range
    "#{start_time.strftime('%I:%M %p')} - #{end_time.strftime('%I:%M %p')}"
  end

  def overlaps_with?(other_slot)
    return false unless other_slot.is_a?(AvailabilitySlot)
    return false unless date == other_slot.date

    start_time < other_slot.end_time && end_time > other_slot.start_time
  end

  def has_booking_conflict?
    Booking.joins(vendor: :vendor_profile)
           .where(vendor_profiles: { id: vendor_profile_id })
           .where(status: [:pending, :accepted])
           .where('DATE(bookings.event_date) = ?', date)
           .where(
             '(EXTRACT(HOUR FROM bookings.event_date) * 60 + EXTRACT(MINUTE FROM bookings.event_date) < ? AND ' \
             'EXTRACT(HOUR FROM COALESCE(bookings.event_end_date, bookings.event_date + INTERVAL \'2 hours\')) * 60 + ' \
             'EXTRACT(MINUTE FROM COALESCE(bookings.event_end_date, bookings.event_date + INTERVAL \'2 hours\')) > ?)',
             end_time.hour * 60 + end_time.min,
             start_time.hour * 60 + start_time.min
           ).exists?
  end

  private

  def end_time_after_start_time
    return unless start_time && end_time

    start_minutes = start_time.hour * 60 + start_time.min
    end_minutes = end_time.hour * 60 + end_time.min
    
    # If end_minutes < start_minutes, it's an overnight slot (allowed)
    # If end_minutes == start_minutes, it's invalid (zero duration)
    # If end_minutes > start_minutes, it's a same-day slot (allowed)
    if end_minutes == start_minutes
      errors.add(:end_time, 'must be after start time')
    end
  end

  def date_not_in_past
    return unless date

    if date < Date.current
      errors.add(:date, 'cannot be in the past')
    end
  end
end