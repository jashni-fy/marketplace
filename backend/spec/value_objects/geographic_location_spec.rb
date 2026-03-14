# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GeographicLocation do
  describe 'initialization' do
    it 'creates a location with valid coordinates' do
      location = described_class.new(40.7128, -74.0060)
      expect(location.latitude).to eq(40.7128)
      expect(location.longitude).to eq(-74.0060)
    end

    it 'raises error for invalid latitude' do
      expect { described_class.new(91, -74.0060) }.to raise_error(ArgumentError)
      expect { described_class.new(-91, -74.0060) }.to raise_error(ArgumentError)
    end

    it 'raises error for invalid longitude' do
      expect { described_class.new(40.7128, 181) }.to raise_error(ArgumentError)
      expect { described_class.new(40.7128, -181) }.to raise_error(ArgumentError)
    end

    it 'raises error for non-numeric coordinates' do
      expect { described_class.new('invalid', -74.0060) }.to raise_error(ArgumentError)
    end
  end

  describe '#valid?' do
    it 'returns true for valid coordinates' do
      location = described_class.new(40.7128, -74.0060)
      expect(location.valid?).to be true
    end

    it 'returns false for invalid latitude' do
      location = described_class.new(40.7128, -74.0060)
      allow(location).to receive(:latitude).and_return(91)
      expect(location.valid?).to be false
    end
  end

  describe '#distance_to' do
    let(:new_york) { described_class.new(40.7128, -74.0060) }
    let(:los_angeles) { described_class.new(34.0522, -118.2437) }
    let(:same_location) { described_class.new(40.7128, -74.0060) }

    it 'returns 0 for same location' do
      expect(new_york.distance_to(same_location, unit: :meters)).to eq(0.0)
    end

    it 'calculates distance in meters' do
      distance = new_york.distance_to(los_angeles, unit: :meters)
      expect(distance).to be_between(3.9e6, 4.0e6) # ~3,944 km in meters
    end

    it 'calculates distance in kilometers' do
      distance = new_york.distance_to(los_angeles, unit: :kilometers)
      expect(distance).to be_between(3900, 4000)
    end

    it 'calculates distance in miles' do
      distance = new_york.distance_to(los_angeles, unit: :miles)
      expect(distance).to be_between(2400, 2500)
    end

    it 'raises error for invalid unit' do
      expect { new_york.distance_to(los_angeles, unit: :invalid) }.to raise_error(ArgumentError)
    end

    it 'handles zero distance calculation edge case' do
      # Test that zero distance is correctly handled
      expect(new_york.distance_to(new_york, unit: :kilometers)).to eq(0.0)
      expect(new_york.distance_to(new_york, unit: :miles)).to eq(0.0)
    end
  end

  describe '.sql_distance_predicate' do
    it 'returns SQL predicate string' do
      sql = described_class.sql_distance_predicate
      expect(sql).to include('acos')
      expect(sql).to include('radians')
      expect(sql).to include('<=')
    end
  end
end
