# frozen_string_literal: true

class AvailabilitySlots::CheckConflicts
  extend Dry::Initializer

  option :vendor_profile, type: Types.Instance(VendorProfile)
  option :date
  option :start_time
  option :end_time
  option :exclude_id, optional: true

  def self.call(vendor_profile:, date:, start_time:, end_time:, exclude_id: nil)
    new(
      vendor_profile: vendor_profile,
      date: date,
      start_time: start_time,
      end_time: end_time,
      exclude_id: exclude_id
    ).call
  end

  def call
    { overlapping_slots: overlapping_availability_slots, booking_conflicts: booking_conflicts }
  end

  private

  def overlapping_availability_slots
    scope = vendor_profile.availability_slots.where(date: date)
                          .where('(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?)',
                                 end_time, start_time, start_time, end_time)
    scope = scope.where.not(id: exclude_id) if exclude_id.present?
    scope
  end

  def booking_conflicts
    Booking.joins(:vendor_profile)
           .where(vendor_profiles: { id: vendor_profile.id })
           .where(status: %i[pending accepted])
           .where('DATE(event_date) = ?', date)
           .where('(TIME(event_date) < ? AND TIME(COALESCE(event_end_date, event_date + INTERVAL \'2 hours\')) > ?)',
                  end_time, start_time)
  end
end
