# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AvailabilitySlot, type: :model do
  let(:vendor) { create(:user, :vendor) }
  let(:vendor_profile) { vendor.vendor_profile }

  describe 'associations' do
    it { should belong_to(:vendor_profile) }
  end

  describe 'validations' do
    subject { build(:availability_slot, vendor_profile: vendor_profile) }
    
    it { should validate_presence_of(:date) }
    it { should validate_presence_of(:start_time) }
    it { should validate_presence_of(:end_time) }
    it { should validate_inclusion_of(:is_available).in_array([true, false]) }
    
    it 'validates end_time is after start_time' do
      slot = build(:availability_slot, 
        vendor_profile: vendor_profile,
        start_time: '14:00',
        end_time: '10:00'
      )
      expect(slot).not_to be_valid
      expect(slot.errors[:end_time]).to include('must be after start time')
    end

    it 'validates date is not in the past on create' do
      slot = build(:availability_slot, 
        vendor_profile: vendor_profile,
        date: 1.day.ago
      )
      expect(slot).not_to be_valid
      expect(slot.errors[:date]).to include('cannot be in the past')
    end
  end

  describe 'scopes' do
    let!(:available_slot) { create(:availability_slot, vendor_profile: vendor_profile, is_available: true) }
    let!(:unavailable_slot) { create(:availability_slot, vendor_profile: vendor_profile, is_available: false) }
    let!(:today_slot) { create(:availability_slot, vendor_profile: vendor_profile, date: Date.current) }
    let!(:future_slot) { create(:availability_slot, vendor_profile: vendor_profile, date: 1.week.from_now) }
    let!(:past_slot) { create(:availability_slot, vendor_profile: vendor_profile, date: 1.week.ago) }

    describe '.available' do
      it 'returns only available slots' do
        expect(AvailabilitySlot.available).to include(available_slot)
        expect(AvailabilitySlot.available).not_to include(unavailable_slot)
      end
    end

    describe '.for_date' do
      it 'returns slots for specific date' do
        expect(AvailabilitySlot.for_date(Date.current)).to include(today_slot)
        expect(AvailabilitySlot.for_date(Date.current)).not_to include(future_slot)
      end
    end

    describe '.for_vendor' do
      let(:other_vendor) { create(:user, :vendor) }
      let!(:other_slot) { create(:availability_slot, vendor_profile: other_vendor.vendor_profile) }

      it 'returns slots for specific vendor' do
        expect(AvailabilitySlot.for_vendor(vendor_profile)).to include(available_slot)
        expect(AvailabilitySlot.for_vendor(vendor_profile)).not_to include(other_slot)
      end
    end

    describe '.upcoming' do
      it 'returns slots from today onwards' do
        expect(AvailabilitySlot.upcoming).to include(today_slot, future_slot)
        expect(AvailabilitySlot.upcoming).not_to include(past_slot)
      end
    end
  end

  describe 'instance methods' do
    let(:slot) { create(:availability_slot, 
      vendor_profile: vendor_profile,
      start_time: '09:00',
      end_time: '17:00'
    ) }

    describe '#duration_hours' do
      it 'calculates duration in hours' do
        expect(slot.duration_hours).to eq(8.0)
      end

      it 'handles overnight slots' do
        overnight_slot = create(:availability_slot,
          vendor_profile: vendor_profile,
          start_time: '22:00',
          end_time: '06:00'
        )
        expect(overnight_slot.duration_hours).to eq(8.0)
      end
    end

    describe '#time_range' do
      it 'returns formatted time range' do
        expect(slot.time_range).to eq('09:00 AM - 05:00 PM')
      end
    end

    describe '#overlaps_with?' do
      let(:other_slot) { build(:availability_slot,
        vendor_profile: vendor_profile,
        date: slot.date,
        start_time: '14:00',
        end_time: '18:00'
      ) }

      let(:non_overlapping_slot) { build(:availability_slot,
        vendor_profile: vendor_profile,
        date: slot.date,
        start_time: '18:00',
        end_time: '20:00'
      ) }

      it 'detects overlapping slots' do
        expect(slot.overlaps_with?(other_slot)).to be true
      end

      it 'detects non-overlapping slots' do
        expect(slot.overlaps_with?(non_overlapping_slot)).to be false
      end

      it 'returns false for different dates' do
        other_slot.date = slot.date + 1.day
        expect(slot.overlaps_with?(other_slot)).to be false
      end

      it 'returns false for non-AvailabilitySlot objects' do
        expect(slot.overlaps_with?("not a slot")).to be false
      end
    end

    describe '#has_booking_conflict?' do
      let(:customer) { create(:user, :customer) }
      let(:service) { create(:service, vendor_profile: vendor_profile) }

      context 'when there are conflicting bookings' do
        let!(:booking) { create(:booking,
          customer: customer,
          vendor: vendor,
          service: service,
          event_date: slot.date.beginning_of_day + 10.hours,
          event_end_date: slot.date.beginning_of_day + 12.hours,
          status: :accepted
        ) }

        it 'returns true' do
          expect(slot.has_booking_conflict?).to be true
        end
      end

      context 'when there are no conflicting bookings' do
        it 'returns false' do
          expect(slot.has_booking_conflict?).to be false
        end
      end

      context 'when bookings are declined or cancelled' do
        let!(:declined_booking) { create(:booking,
          customer: customer,
          vendor: vendor,
          service: service,
          event_date: slot.date.beginning_of_day + 10.hours,
          status: :declined
        ) }

        it 'returns false' do
          expect(slot.has_booking_conflict?).to be false
        end
      end
    end
  end
end