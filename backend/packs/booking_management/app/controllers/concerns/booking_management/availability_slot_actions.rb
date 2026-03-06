# frozen_string_literal: true

module BookingManagement::AvailabilitySlotHelpers
  extend ActiveSupport::Concern
  include BookingManagement::PaginationHelper

  private

  def filtered_slots
    scope = current_user.vendor_profile.availability_slots.includes(:vendor_profile)
    if params[:start_date].present? && params[:end_date].present?
      scope.where(date: params[:start_date]..params[:end_date])
    elsif params[:date].present?
      scope.for_date(params[:date])
    else
      scope.upcoming
    end
  end

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

  def set_availability_slot
    @slot = current_user.vendor_profile.availability_slots.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Availability slot not found' }, status: :not_found
  end

  def availability_slot_params
    params.require(:availability_slot).permit(:date, :start_time, :end_time, :is_available)
  end
end

module BookingManagement::AvailabilitySlotActions
  extend ActiveSupport::Concern
  include BookingManagement::AvailabilitySlotHelpers

  included do
    before_action :set_availability_slot, only: %i[show update destroy]
  end

  def index
    slots = filtered_slots
            .order(:date, :start_time)
            .page(params[:page])
            .per(params[:per_page] || 50)

    render json: {
      availability_slots: slots.map { |slot| AvailabilitySlotPresenter.new(slot).as_json },
      pagination: pagination_meta(slots)
    }
  end

  def show
    render json: { availability_slot: AvailabilitySlotPresenter.new(@slot).as_json }
  end

  def create
    @slot = current_user.vendor_profile.availability_slots.build(availability_slot_params)
    if @slot.save
      render json: { availability_slot: AvailabilitySlotPresenter.new(@slot).as_json }, status: :created
    else
      render json: { errors: @slot.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @slot.update(availability_slot_params)
      render json: { availability_slot: AvailabilitySlotPresenter.new(@slot).as_json }
    else
      render json: { errors: @slot.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    if @slot.booking_conflict?
      render json: { error: 'Cannot delete availability slot with existing bookings' }, status: :unprocessable_content
    else
      @slot.destroy
      render json: { message: 'Availability slot deleted successfully' }
    end
  end

  def bulk_create
    slots_params = params[:availability_slots] || []
    created_slots, errors = process_bulk_slot_params(slots_params)

    render_bulk_create_response(created_slots, errors)
  end

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

  def process_bulk_slot_params(slots_params)
    created_slots = []
    errors = []

    slots_params.each_with_index do |slot_params, index|
      slot = build_bulk_slot(slot_params)

      if slot.save
        created_slots << AvailabilitySlotPresenter.new(slot).as_json
      else
        errors << { index: index, errors: slot.errors.full_messages }
      end
    end

    [created_slots, errors]
  end

  def build_bulk_slot(slot_params)
    current_user.vendor_profile.availability_slots.build(
      slot_params.permit(:date, :start_time, :end_time, :is_available)
    )
  end

  def render_bulk_create_response(created_slots, errors)
    if errors.empty?
      render json: {
        availability_slots: created_slots,
        message: "#{created_slots.count} slots created successfully"
      }, status: :created
    else
      render json: {
        created_slots: created_slots,
        errors: errors,
        message: "#{created_slots.count} slots created, #{errors.count} failed"
      }, status: :partial_content
    end
  end
end
