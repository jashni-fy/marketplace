# frozen_string_literal: true

module BookingManagement::AvailabilitySlotActions
  extend ActiveSupport::Concern
  include BookingManagement::PaginationHelper

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

  def set_availability_slot
    @slot = current_user.vendor_profile.availability_slots.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Availability slot not found' }, status: :not_found
  end

  def availability_slot_params
    params.require(:availability_slot).permit(:date, :start_time, :end_time, :is_available)
  end
end
