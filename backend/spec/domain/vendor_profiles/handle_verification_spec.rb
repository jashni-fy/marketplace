# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorProfiles::HandleVerification do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }

  describe '.call' do
    context 'when action is request' do
      it 'updates status to pending_verification' do
        described_class.call(vendor_profile: vendor_profile, action: :request)
        expect(vendor_profile.verification_status).to eq('pending_verification')
      end
    end

    context 'when action is approve' do
      it 'updates status to verified' do
        described_class.call(vendor_profile: vendor_profile, action: :approve)
        expect(vendor_profile.verification_status).to eq('verified')
        expect(vendor_profile.verified_at).not_to be_nil
      end
    end

    context 'when action is reject' do
      it 'updates status to rejected and sets rejection reason' do
        reason = 'Missing documents'
        described_class.call(vendor_profile: vendor_profile, action: :reject, reason: reason)
        expect(vendor_profile.verification_status).to eq('rejected')
        expect(vendor_profile.rejection_reason).to eq(reason)
      end
    end

    context 'with unknown action' do
      it 'raises ArgumentError' do
        expect do
          described_class.call(vendor_profile: vendor_profile, action: :invalid)
        end.to raise_error(ArgumentError, /Unknown verification action/)
      end
    end
  end
end
