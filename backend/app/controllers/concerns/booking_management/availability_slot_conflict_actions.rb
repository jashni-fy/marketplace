# frozen_string_literal: true

module BookingManagement::AvailabilitySlotConflictActions
  extend ActiveSupport::Concern

  def check_conflicts
    date, start_time, end_time, exclude_id = conflict_params
    unless date && start_time && end_time
      render json: { error: 'Missing required parameters' }, status: :bad_request
      return
    end

    overlapping_slots = overlapping_availability_slots(date, start_time, end_time, exclude_id)
    booking_conflicts = booking_conflicts_for(date, start_time, end_time)

    render json: {
      has_conflicts: overlapping_slots.exists? || booking_conflicts.exists?,
      overlapping_slots: overlapping_slots.map { |slot| AvailabilitySlotPresenter.new(slot).as_json },
      booking_conflicts: booking_conflicts.map { |booking| BookingConflictPresenter.new(booking).as_json }
    }
  end

  private

  def conflict_params
    [params[:date], params[:start_time], params[:end_time], params[:exclude_id]]
  end

  def overlapping_availability_slots(date, start_time, end_time, exclude_id)
    scope = current_user.vendor_profile.availability_slots
    scope = scope.where(date: date)
    scope = scope.where('(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?)',
                        end_time, start_time, start_time, end_time)
    scope = scope.where.not(id: exclude_id) if exclude_id.present?
    scope
  end

  def booking_conflicts_for(date, start_time, end_time)
    Booking.joins(:vendor)
           .joins('JOIN vendor_profiles ON vendor_profiles.user_id = users.id')
           .where(vendor_profiles: { id: current_user.vendor_profile.id })
           .where(status: %i[pending accepted])
           .where('DATE(event_date) = ?', date)
           .where('(TIME(event_date) < ? AND TIME(COALESCE(event_end_date, event_date + INTERVAL \'2 hours\')) > ?)',
                  end_time, start_time)
  end
end
