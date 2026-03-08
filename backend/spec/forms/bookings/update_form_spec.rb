# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::UpdateForm do
  let(:valid_params) do
    {
      event_date: 1.week.from_now,
      event_end_date: 1.week.from_now + 2.hours,
      event_location: '456 Oak Ave, City',
      requirements: 'Updated requirements',
      special_instructions: 'Updated instructions',
      event_duration: '3 hours'
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
        expect(attrs[:event_location]).to eq(valid_params[:event_location])
        expect(attrs[:requirements]).to eq(valid_params[:requirements])
      end
    end

    context 'with empty parameters' do
      it 'succeeds (all fields optional)' do
        result = described_class.call({})
        expect(result.success?).to be true
      end
    end

    context 'with partial parameters' do
      it 'succeeds with only event_location' do
        result = described_class.call(event_location: '789 New St')
        expect(result.success?).to be true
      end

      it 'succeeds with only requirements' do
        result = described_class.call(requirements: 'New requirements')
        expect(result.success?).to be true
      end
    end

    context 'with invalid parameter values' do
      it 'fails with short event_location' do
        params = valid_params.merge(event_location: 'ab')
        result = described_class.call(params)
        expect(result.failure?).to be true
      end

      it 'fails with event_location exceeding max length' do
        params = valid_params.merge(event_location: 'a' * 256)
        result = described_class.call(params)
        expect(result.failure?).to be true
      end

      it 'fails with event_duration exceeding max length' do
        params = valid_params.merge(event_duration: 'x' * 101)
        result = described_class.call(params)
        expect(result.failure?).to be true
      end
    end

    context 'with date/time parameters' do
      it 'parses string event_date' do
        params = valid_params.merge(event_date: 1.week.from_now.to_s)
        result = described_class.call(params)
        expect(result.success?).to be true
      end

      it 'handles already parsed datetime' do
        params = valid_params
        result = described_class.call(params)
        expect(result.success?).to be true
      end

      it 'fails with invalid date format' do
        params = valid_params.merge(event_date: 'not-a-date')
        result = described_class.call(params)
        expect(result.failure?).to be true
      end
    end
  end

  describe 'result object' do
    context 'when successful' do
      let(:result) { described_class.call(valid_params) }

      it 'is successful' do
        expect(result.success?).to be true
        expect(result.failure?).to be false
      end

      it 'has form value' do
        expect(result.value).to be_a(described_class)
      end

      it 'has empty errors' do
        expect(result.errors).to be_empty
      end
    end

    context 'when invalid' do
      let(:result) { described_class.call(event_location: 'a') }

      it 'is a failure' do
        expect(result.success?).to be false
        expect(result.failure?).to be true
      end

      it 'has no value' do
        expect(result.value).to be_nil
      end

      it 'has error hash' do
        expect(result.errors).to be_a(Hash)
      end
    end
  end
end
