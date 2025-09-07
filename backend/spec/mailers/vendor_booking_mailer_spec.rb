require 'rails_helper'

RSpec.describe VendorBookingMailer, type: :mailer do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:customer_profile) { customer_user.customer_profile }
  let(:service) { create(:service, vendor_profile: vendor_profile) }
  let(:booking) do
    # Create availability slot for the booking date
    booking_date = 1.week.from_now
    create(:availability_slot, 
           vendor_profile: vendor_profile, 
           date: booking_date.to_date, 
           is_available: true)
    
    create(:booking, service: service, vendor: vendor_user, customer: customer_user, event_date: booking_date)
  end

  describe '#new_booking_notification' do
    let(:mail) { described_class.new_booking_notification(booking) }

    it 'renders the headers' do
      expect(mail.subject).to eq("New Booking Request - #{service.name}")
      expect(mail.to).to eq([vendor_user.email])
      expect(mail.from).to eq(['noreply@marketplace.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to include(vendor_profile.business_name)
      expect(mail.body.encoded).to include(customer_user.name)
      expect(mail.body.encoded).to include(service.name)
    end
  end

  describe '#booking_cancelled_notification' do
    let(:mail) { described_class.booking_cancelled_notification(booking) }

    it 'renders the headers' do
      expect(mail.subject).to eq("Booking Cancelled - #{service.name}")
      expect(mail.to).to eq([vendor_user.email])
      expect(mail.from).to eq(['noreply@marketplace.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to include(vendor_profile.business_name)
      expect(mail.body.encoded).to include(customer_user.name)
      expect(mail.body.encoded).to include(service.name)
    end
  end

  describe '#booking_modified_notification' do
    let(:mail) { described_class.booking_modified_notification(booking) }

    it 'renders the headers' do
      expect(mail.subject).to eq("Booking Modified - #{service.name}")
      expect(mail.to).to eq([vendor_user.email])
      expect(mail.from).to eq(['noreply@marketplace.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to include(vendor_profile.business_name)
      expect(mail.body.encoded).to include(customer_user.name)
      expect(mail.body.encoded).to include(service.name)
    end
  end
end