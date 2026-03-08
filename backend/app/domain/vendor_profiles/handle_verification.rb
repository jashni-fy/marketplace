# frozen_string_literal: true

module VendorProfiles
  class HandleVerification
    extend Dry::Initializer

    option :vendor_profile, type: Types.Instance(VendorProfile)

    def self.call(vendor_profile:, action:, reason: nil)
      new(vendor_profile: vendor_profile).call(action, reason: reason)
    end

    def call(action, reason: nil)
      case action.to_sym
      when :request
        request_verification
      when :approve
        approve_verification
      when :reject
        reject_verification(reason)
      else
        raise ArgumentError, "Unknown verification action: #{action}"
      end
    end

    private

    def request_verification
      vendor_profile.update(verification_status: :pending_verification)
    end

    def approve_verification
      vendor_profile.update(
        verification_status: :verified,
        verified_at: Time.current,
        rejection_reason: nil
      )
    end

    def reject_verification(reason)
      vendor_profile.update(
        verification_status: :rejected,
        rejection_reason: reason
      )
    end
  end
end
