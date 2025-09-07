# frozen_string_literal: true

class AvailabilitySlotsController < ApiController
  # Authentication is handled by ApiController
  before_action :ensure_vendor!
  before_action :set_availability_slot, only: [:show, :update, :destroy]

  def index
    @slots = current_user.vendor_profile
                         .availability_slots
                         .includes(:vendor_profile)

    # Filter by date range if provided
    if params[:start_date].present? && params[:end_date].present?
      @slots = @slots.where(date: params[:start_date]..params[:end_date])
    elsif params[:date].present?
      @slots = @slots.for_date(params[:date])
    else
      # Default to upcoming slots
      @slots = @slots.upcoming
    end

    @slots = @slots.order(:date, :start_time)
                   .page(params[:page])
                   .per(params[:per_page] || 50)

    render json: {
      availability_slots: @slots.map { |slot| availability_slot_json(slot) },
      pagination: pagination_meta(@slots)
    }
  end

  def show
    render json: { availability_slot: availability_slot_json(@slot) }
  end

  def create
    @slot = current_user.vendor_profile.availability_slots.build(availability_slot_params)

    if @slot.save
      render json: { availability_slot: availability_slot_json(@slot) }, status: :created
    else
      render json: { errors: @slot.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @slot.update(availability_slot_params)
      render json: { availability_slot: availability_slot_json(@slot) }
    else
      render json: { errors: @slot.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @slot.has_booking_conflict?
      render json: { error: 'Cannot delete availability slot with existing bookings' }, status: :unprocessable_entity
    else
      @slot.destroy
      render json: { message: 'Availability slot deleted successfully' }
    end
  end

  def bulk_create
    slots_params = params[:availability_slots] || []
    created_slots = []
    errors = []

    slots_params.each_with_index do |slot_params, index|
      slot = current_user.vendor_profile.availability_slots.build(slot_params.permit(:date, :start_time, :end_time, :is_available))
      
      if slot.save
        created_slots << availability_slot_json(slot)
      else
        errors << { index: index, errors: slot.errors.full_messages }
      end
    end

    if errors.empty?
      render json: { availability_slots: created_slots, message: "#{created_slots.count} slots created successfully" }, status: :created
    else
      render json: { 
        created_slots: created_slots, 
        errors: errors,
        message: "#{created_slots.count} slots created, #{errors.count} failed"
      }, status: :partial_content
    end
  end

  def check_conflicts
    date = params[:date]
    start_time = params[:start_time]
    end_time = params[:end_time]
    exclude_id = params[:exclude_id]

    return render json: { error: 'Missing required parameters' }, status: :bad_request unless date && start_time && end_time

    # Check for overlapping availability slots
    overlapping_slots = current_user.vendor_profile
                                   .availability_slots
                                   .where(date: date)
                                   .where(
                                     '(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?)',
                                     end_time, start_time, start_time, end_time
                                   )

    overlapping_slots = overlapping_slots.where.not(id: exclude_id) if exclude_id.present?

    # Check for booking conflicts
    booking_conflicts = Booking.joins(:vendor)
                              .joins('JOIN vendor_profiles ON vendor_profiles.user_id = users.id')
                              .where(vendor_profiles: { id: current_user.vendor_profile.id })
                              .where(status: [:pending, :accepted])
                              .where('DATE(event_date) = ?', date)
                              .where(
                                '(TIME(event_date) < ? AND TIME(COALESCE(event_end_date, event_date + INTERVAL \'2 hours\')) > ?)',
                                end_time, start_time
                              )

    render json: {
      has_conflicts: overlapping_slots.exists? || booking_conflicts.exists?,
      overlapping_slots: overlapping_slots.map { |slot| availability_slot_json(slot) },
      booking_conflicts: booking_conflicts.map { |booking| booking_conflict_json(booking) }
    }
  end

  private

  def set_availability_slot
    @slot = current_user.vendor_profile.availability_slots.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Availability slot not found' }, status: :not_found
  end

  def ensure_vendor!
    unless current_user.vendor?
      render json: { error: 'Access denied. Vendor account required.' }, status: :forbidden
    end
  end

  def availability_slot_params
    params.require(:availability_slot).permit(:date, :start_time, :end_time, :is_available)
  end

  def availability_slot_json(slot)
    {
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time.strftime('%H:%M'),
      end_time: slot.end_time.strftime('%H:%M'),
      time_range: slot.time_range,
      duration_hours: slot.duration_hours,
      is_available: slot.is_available,
      has_booking_conflict: slot.has_booking_conflict?,
      created_at: slot.created_at,
      updated_at: slot.updated_at
    }
  end

  def booking_conflict_json(booking)
    {
      id: booking.id,
      event_date: booking.event_date,
      event_end_date: booking.event_end_date,
      status: booking.status,
      service_name: booking.service.name,
      customer_name: booking.customer.full_name
    }
  end

  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count,
      per_page: collection.limit_value
    }
  end
end