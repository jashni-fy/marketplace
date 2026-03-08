# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::CreateForm do
  let(:valid_params) do
    {
      service_id: create(:service).id,
      event_date: 1.week.from_now,
      event_location: '123 Main St, City',
      total_amount: 100.00,
      event_duration: '2 hours'
    }
  end

  describe '.call' do
    context 'with valid parameters' do
      it 'returns success result' do
        result = described_class.call(valid_params)
        expect(result.success?).to be true
      end

      it 'converts to booking attributes' do
        result = described_class.call(valid_params)
        attrs = result.value.to_booking_attributes
        expect(attrs[:service_id]).to eq(valid_params[:service_id])
        expect(attrs[:event_location]).to eq(valid_params[:event_location])
        expect(attrs[:total_amount]).to eq(valid_params[:total_amount])
      end
    end

    context 'with missing required fields' do
      it 'fails without service_id' do
        params = valid_params.except(:service_id)
        result = described_class.call(params)
        expect(result.failure?).to be true
        expect(result.errors).to include(:service_id)
      end

      it 'fails without event_date' do
        params = valid_params.except(:event_date)
        result = described_class.call(params)
        expect(result.failure?).to be true
        expect(result.errors).to include(:event_date)
      end

      it 'fails without event_location' do
        params = valid_params.except(:event_location)
        result = described_class.call(params)
        expect(result.failure?).to be true
        expect(result.errors).to include(:event_location)
      end

      it 'fails without total_amount' do
        params = valid_params.except(:total_amount)
        result = described_class.call(params)
        expect(result.failure?).to be true
        expect(result.errors).to include(:total_amount)
      end
    end

    context 'with invalid parameter values' do
      it 'fails with non-integer service_id' do
        params = valid_params.merge(service_id: 'not-an-id')
        result = described_class.call(params)
        expect(result.failure?).to be true
      end

      it 'fails with negative total_amount' do
        params = valid_params.merge(total_amount: -100)
        result = described_class.call(params)
        expect(result.failure?).to be true
      end

      it 'fails with zero total_amount' do
        params = valid_params.merge(total_amount: 0)
        result = described_class.call(params)
        expect(result.failure?).to be true
      end

      it 'fails with short event_location' do
        params = valid_params.merge(event_location: 'ab')
        result = described_class.call(params)
        expect(result.failure?).to be true
      end
    end

    context 'with optional fields' do
      it 'succeeds without event_duration' do
        params = valid_params.except(:event_duration)
        result = described_class.call(params)
        expect(result.success?).to be true
      end

      it 'includes optional fields when provided' do
        params = valid_params.merge(requirements: 'Special request')
        result = described_class.call(params)
        attrs = result.value.to_booking_attributes
        expect(attrs[:requirements]).to eq('Special request')
      end
    end
  end

  describe 'result object' do
    context 'when successful' do
      let(:result) { described_class.call(valid_params) }

      it 'responds to success?' do
        expect(result.success?).to be true
      end

      it 'responds to failure?' do
        expect(result.failure?).to be false
      end

      it 'has value' do
        expect(result.value).to be_a(described_class)
      end

      it 'has no errors' do
        expect(result.errors).to be_empty
      end
    end

    context 'when invalid' do
      let(:result) { described_class.call(valid_params.except(:service_id)) }

      it 'responds to success?' do
        expect(result.success?).to be false
      end

      it 'responds to failure?' do
        expect(result.failure?).to be true
      end

      it 'has no value' do
        expect(result.value).to be_nil
      end

      it 'has errors hash' do
        expect(result.errors).to be_a(Hash)
        expect(result.errors).to include(:service_id)
      end
    end
  end
end
