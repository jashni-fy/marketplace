# frozen_string_literal: true

# Single source of truth for vendor availability checks
class VendorAvailabilityQuery
  def initialize(vendor_profile:, date:)
    @vendor_profile = vendor_profile
    @date = date
  end

  def self.call(**params)
    new(**params).call
  end

  def call
    available?
  end

  def available?
    @vendor_profile.availability_slots.available_on(@date).exists?
  end
end
