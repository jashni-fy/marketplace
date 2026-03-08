# frozen_string_literal: true

module AvailabilitySlots
  class FilterForVendor
    extend Dry::Initializer

    option :vendor_profile, type: Types.Instance(VendorProfile)
    option :start_date, optional: true
    option :end_date, optional: true
    option :date, optional: true

    def self.call(vendor_profile:, **params)
      new(vendor_profile: vendor_profile, **params).call
    end

    def call
      scope = vendor_profile.availability_slots.includes(:vendor_profile)
      if start_date.present? && end_date.present?
        scope.where(date: start_date..end_date)
      elsif date.present?
        scope.for_date(date)
      else
        scope.upcoming
      end
    end
  end
end
