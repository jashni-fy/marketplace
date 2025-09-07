# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Booking, type: :model do
  let(:customer) { create(:user, :customer) }
  let(:vendor) { create(:user, :vendor) }
  let(:service) { create(:service, vendor_profile: vendor.vendor_profile) }
  
  describe 'associations' do
    it { should belong_to(:customer).class_name('User') }
    it { should belong_to(:vendor).class_name('User') }
    it { should belong_to(:service) }
    it { should have_many(:booking_messages).dependent(:destroy) }
  end

  describe 'validations' do
    subject { build(:booking, customer: customer, vendor: vendor, service: service) }
    
    it { should validate_presence_of(:event_date) }
    it { should validate_presence_of(:event_location) }
    it { should validate_presence_of(:total_amount) }
    it { should validate_numericality_of(:total_amount).is_greater_than(0) }
    it { should validate_presence_of(:status) }
    
    it 'validates event_date is in the future on create' do
      booking = build(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.day.ago)
      expect(booking).not_to be_valid
      expect(booking.errors[:event_date]).to include('must be in the future')
    end
  end

  describe 'enums' do
    it { should define_enum_for(:status).with_values(
      pending: 0,
      accepted: 1,
      declined: 2,
      completed: 3,
      cancelled: 4,
      counter_offered: 5
    ) }
  end

  describe 'scopes' do
    let!(:upcoming_availability) do
      create(:availability_slot,
        vendor_profile: vendor.vendor_profile,
        date: 1.week.from_now.to_date,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      )
    end
    let!(:upcoming_booking) { create(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.week.from_now.change(hour: 10)) }
    let!(:past_booking) do
      booking = build(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.week.ago, event_location: 'Test Location', total_amount: 100)
      booking.save(validate: false)
      booking
    end
    let!(:pending_booking) { create(:booking, customer: customer, vendor: vendor, service: service, status: :pending, event_date: 1.week.from_now.change(hour: 14)) }
    let!(:accepted_booking) { create(:booking, customer: customer, vendor: vendor, service: service, status: :accepted, event_date: 1.week.from_now.change(hour: 15)) }

    describe '.upcoming' do
      it 'returns bookings with future event dates' do
        expect(Booking.upcoming).to include(upcoming_booking)
        expect(Booking.upcoming).not_to include(past_booking)
      end
    end

    describe '.for_vendor' do
      it 'returns bookings for specific vendor' do
        expect(Booking.for_vendor(vendor)).to include(upcoming_booking, past_booking)
      end
    end

    describe '.for_customer' do
      it 'returns bookings for specific customer' do
        expect(Booking.for_customer(customer)).to include(upcoming_booking, past_booking)
      end
    end

    describe '.by_status' do
      it 'returns bookings with specific status' do
        expect(Booking.by_status(:pending)).to include(pending_booking)
        expect(Booking.by_status(:accepted)).to include(accepted_booking)
      end
    end
  end

  describe 'instance methods' do
    let!(:availability_slot) do
      create(:availability_slot,
        vendor_profile: vendor.vendor_profile,
        date: 1.week.from_now.to_date,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      )
    end
    let(:booking) { create(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.week.from_now.change(hour: 10)) }

    describe '#duration_hours' do
      context 'when event_end_date is present' do
        it 'calculates duration in hours' do
          booking.update(
            event_date: Time.current + 1.day,
            event_end_date: Time.current + 1.day + 4.hours
          )
          expect(booking.duration_hours).to eq(4.0)
        end
      end

      context 'when event_end_date is not present' do
        it 'returns nil' do
          expect(booking.duration_hours).to be_nil
        end
      end
    end

    describe '#can_be_modified?' do
      it 'returns true for pending bookings more than 24 hours away' do
        booking.update(status: :pending, event_date: 2.days.from_now)
        expect(booking.can_be_modified?).to be true
      end

      it 'returns false for non-pending bookings' do
        booking.update(status: :accepted, event_date: 2.days.from_now)
        expect(booking.can_be_modified?).to be false
      end

      it 'returns false for bookings less than 24 hours away' do
        booking.update(status: :pending, event_date: 12.hours.from_now)
        expect(booking.can_be_modified?).to be false
      end
    end

    describe '#can_be_cancelled?' do
      it 'returns true for pending/accepted bookings more than 24 hours away' do
        booking.update(status: :pending, event_date: 2.days.from_now)
        expect(booking.can_be_cancelled?).to be true
        
        booking.update(status: :accepted)
        expect(booking.can_be_cancelled?).to be true
      end

      it 'returns false for completed bookings' do
        booking.update(status: :completed, event_date: 2.days.from_now)
        expect(booking.can_be_cancelled?).to be false
      end

      it 'returns false for bookings less than 24 hours away' do
        booking.update(status: :pending, event_date: 12.hours.from_now)
        expect(booking.can_be_cancelled?).to be false
      end
    end

    describe '#vendor_profile' do
      it 'returns the vendor profile' do
        expect(booking.vendor_profile).to eq(vendor.vendor_profile)
      end
    end

    describe '#customer_profile' do
      it 'returns the customer profile' do
        expect(booking.customer_profile).to eq(customer.customer_profile)
      end
    end
  end

  describe 'availability validation' do
    let!(:availability_slot) do
      create(:availability_slot,
        vendor_profile: vendor.vendor_profile,
        date: 1.week.from_now.to_date,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      )
    end

    it 'validates vendor has availability for the booking date' do
      booking = build(:booking,
        customer: customer,
        vendor: vendor,
        service: service,
        event_date: 1.week.from_now.change(hour: 10)
      )
      expect(booking).to be_valid
    end

    it 'invalidates booking when vendor has no availability' do
      booking = build(:booking,
        customer: customer,
        vendor: vendor,
        service: service,
        event_date: 2.weeks.from_now.change(hour: 10)
      )
      expect(booking).not_to be_valid
      expect(booking.errors[:event_date]).to include('is not available for this vendor')
    end
  end

  describe 'booking conflict validation' do
    let!(:availability_slot) do
      create(:availability_slot,
        vendor_profile: vendor.vendor_profile,
        date: 1.week.from_now.to_date,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      )
    end

    let!(:existing_booking) do
      create(:booking,
        customer: customer,
        vendor: vendor,
        service: service,
        event_date: 1.week.from_now.change(hour: 10),
        event_end_date: 1.week.from_now.change(hour: 12),
        status: :accepted
      )
    end

    it 'prevents overlapping bookings' do
      conflicting_booking = build(:booking,
        customer: create(:user, :customer),
        vendor: vendor,
        service: service,
        event_date: 1.week.from_now.change(hour: 11),
        event_end_date: 1.week.from_now.change(hour: 13)
      )
      
      expect(conflicting_booking).not_to be_valid
      expect(conflicting_booking.errors[:event_date]).to include('conflicts with another booking')
    end

    it 'allows non-overlapping bookings' do
      non_conflicting_booking = build(:booking,
        customer: create(:user, :customer),
        vendor: vendor,
        service: service,
        event_date: 1.week.from_now.change(hour: 14),
        event_end_date: 1.week.from_now.change(hour: 16)
      )
      
      expect(non_conflicting_booking).to be_valid
    end
  end
end