# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorProfiles::CalculatePublicStats do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service) }

  describe '.call' do
    context 'with no bookings' do
      it 'returns nil for rates and 0 for total_events' do
        result = described_class.call(vendor_profile: vendor_profile)

        expect(result[:response_rate]).to be_nil
        expect(result[:response_time_hours]).to be_nil
        expect(result[:completion_rate]).to be_nil
        expect(result[:total_events]).to eq(0)
      end
    end

    context 'with bookings' do
      let!(:booking1) do
        create(:booking, vendor_profile: vendor_profile, customer: customer, service: service, status: :completed)
      end
      let!(:booking2) do
        create(:booking, vendor_profile: vendor_profile, customer: customer, service: service, status: :completed,
                         created_at: 3.days.ago)
      end

      it 'calculates response rate' do
        booking1.update_column(:vendor_first_response_at, booking1.created_at + 24.hours)
        booking2.update_column(:vendor_first_response_at, booking2.created_at + 72.hours)

        result = described_class.call(vendor_profile: vendor_profile)

        expect(result[:response_rate]).to eq(50.0)
      end

      it 'calculates completion rate' do
        result = described_class.call(vendor_profile: vendor_profile)

        expect(result[:completion_rate]).to eq(1.0)
        expect(result[:total_events]).to eq(2)
      end

      it 'calculates repeat customer rate' do
        result = described_class.call(vendor_profile: vendor_profile)

        expect(result[:repeat_customer_rate]).to eq(100.0)
      end
    end
  end
end
