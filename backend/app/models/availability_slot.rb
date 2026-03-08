# frozen_string_literal: true

# == Schema Information
#
# Table name: availability_slots
#
#  id                :bigint           not null, primary key
#  date              :date             not null
#  end_time          :time             not null
#  is_available      :boolean          default(TRUE), not null
#  start_time        :time             not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  vendor_profile_id :bigint           not null
#
# Indexes
#
#  index_availability_slots_on_date_and_is_available       (date,is_available)
#  index_availability_slots_on_vendor_profile_id           (vendor_profile_id)
#  index_availability_slots_on_vendor_profile_id_and_date  (vendor_profile_id,date)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
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
  scope :upcoming, -> { where(date: Date.current..) }

  # Domain scopes for queries
  scope :available_on, ->(date) { where(date: date, is_available: true) }
  scope :overlapping_time, lambda { |start_time, end_time|
    where('(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?)',
          end_time, start_time, start_time, end_time)
  }

  def duration_hours
    return 0 unless start_time && end_time

    # Convert times to seconds from midnight and calculate difference
    end_seconds = end_time.seconds_since_midnight
    start_seconds = start_time.seconds_since_midnight

    # Handle case where end time is next day
    end_seconds += 24.hours if end_seconds < start_seconds

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

  def booking_conflict?
    conflict_sql = <<~SQL.squish
      (EXTRACT(HOUR FROM bookings.event_date) * 60 + EXTRACT(MINUTE FROM bookings.event_date) < ? AND
      EXTRACT(HOUR FROM COALESCE(bookings.event_end_date, bookings.event_date + INTERVAL '2 hours')) * 60 +
      EXTRACT(MINUTE FROM COALESCE(bookings.event_end_date, bookings.event_date + INTERVAL '2 hours')) > ?)
    SQL

    Booking.joins(vendor: :vendor_profile)
           .where(vendor_profiles: { id: vendor_profile_id })
           .where(status: %i[pending accepted])
           .where('DATE(bookings.event_date) = ?', date)
           .exists?([conflict_sql, (end_time.hour * 60) + end_time.min, (start_time.hour * 60) + start_time.min])
  end

  private

  def end_time_after_start_time
    return unless start_time && end_time

    start_minutes = (start_time.hour * 60) + start_time.min
    end_minutes = (end_time.hour * 60) + end_time.min

    # If end_minutes < start_minutes, it's an overnight slot (allowed)
    # If end_minutes == start_minutes, it's invalid (zero duration)
    # If end_minutes > start_minutes, it's a same-day slot (allowed)
    return unless end_minutes == start_minutes

    errors.add(:end_time, 'must be after start time')
  end

  def date_not_in_past
    return unless date

    return unless date < Date.current

    errors.add(:date, 'cannot be in the past')
  end
end
