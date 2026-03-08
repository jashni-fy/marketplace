# frozen_string_literal: true

class AvailabilitySlots::BulkCreate
  extend Dry::Initializer

  option :vendor_profile, type: Types.Instance(VendorProfile)
  option :slots_params

  def self.call(vendor_profile:, slots_params:)
    new(vendor_profile: vendor_profile, slots_params: slots_params).call
  end

  def call
    created = []
    errors = []
    slots_params.each_with_index do |slot_params, index|
      slot = vendor_profile.availability_slots.build(
        slot_params.permit(:date, :start_time, :end_time, :is_available)
      )
      if slot.save
        created << slot
      else
        errors << { index: index, errors: slot.errors.full_messages }
      end
    end
    { created: created, errors: errors }
  end
end
