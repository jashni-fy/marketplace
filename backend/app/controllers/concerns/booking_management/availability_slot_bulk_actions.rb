# frozen_string_literal: true

module BookingManagement::AvailabilitySlotBulkActions
  extend ActiveSupport::Concern

  def bulk_create
    slots_params = params[:availability_slots] || []
    created_slots, errors = process_bulk_slot_params(slots_params)

    render_bulk_create_response(created_slots, errors)
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
