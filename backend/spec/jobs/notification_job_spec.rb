require 'rails_helper'

RSpec.describe NotificationJob, type: :job do
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

  describe '#perform' do
    context 'when notification_type is booking_created' do
      it 'sends booking created notification to vendor' do
        expect(VendorBookingMailer).to receive(:new_booking_notification).with(booking).and_call_original
        expect_any_instance_of(ActionMailer::MessageDelivery).to receive(:deliver_now)
        
        expect {
          described_class.perform_now('booking_created', vendor_user.id, { 'booking_id' => booking.id })
        }.not_to raise_error
      end
    end

    context 'when notification_type is booking_approved' do
      it 'sends booking approved notification to customer' do
        expect(CustomerBookingMailer).to receive(:booking_approved_notification).with(booking).and_call_original
        expect_any_instance_of(ActionMailer::MessageDelivery).to receive(:deliver_now)
        
        expect {
          described_class.perform_now('booking_approved', customer_user.id, { 'booking_id' => booking.id })
        }.not_to raise_error
      end
    end

    context 'when notification_type is booking_rejected' do
      it 'sends booking rejected notification to customer' do
        expect(CustomerBookingMailer).to receive(:booking_rejected_notification).with(booking).and_call_original
        expect_any_instance_of(ActionMailer::MessageDelivery).to receive(:deliver_now)
        
        expect {
          described_class.perform_now('booking_rejected', customer_user.id, { 'booking_id' => booking.id })
        }.not_to raise_error
      end
    end

    context 'when notification_type is booking_cancelled' do
      it 'sends booking cancelled notification to vendor' do
        expect(VendorBookingMailer).to receive(:booking_cancelled_notification).with(booking).and_call_original
        expect_any_instance_of(ActionMailer::MessageDelivery).to receive(:deliver_now)
        
        expect {
          described_class.perform_now('booking_cancelled', vendor_user.id, { 'booking_id' => booking.id })
        }.not_to raise_error
      end
    end

    context 'when notification_type is booking_reminder' do
      it 'sends booking reminder notification to customer' do
        expect(CustomerBookingMailer).to receive(:booking_reminder).with(booking).and_call_original
        expect_any_instance_of(ActionMailer::MessageDelivery).to receive(:deliver_now)
        
        expect {
          described_class.perform_now('booking_reminder', customer_user.id, { 'booking_id' => booking.id })
        }.not_to raise_error
      end
    end

    context 'when notification_type is new_message' do
      let(:booking_message) { create(:booking_message, booking: booking, sender: vendor_user, message: 'Test message') }
      
      it 'sends new message notification' do
        expect(MessageMailer).to receive(:new_message_notification).with(booking_message).and_call_original
        expect_any_instance_of(ActionMailer::MessageDelivery).to receive(:deliver_now)
        
        expect {
          described_class.perform_now('new_message', customer_user.id, { 'message_id' => booking_message.id })
        }.not_to raise_error
      end
    end

    context 'when user does not exist' do
      it 'handles error gracefully' do
        expect {
          described_class.perform_now('booking_created', 999999, { 'booking_id' => booking.id })
        }.not_to raise_error
      end
    end

    context 'when notification_type is unknown' do
      it 'handles unknown notification type' do
        expect {
          described_class.perform_now('unknown_type', customer_user.id, {})
        }.not_to raise_error
      end
    end
  end
end