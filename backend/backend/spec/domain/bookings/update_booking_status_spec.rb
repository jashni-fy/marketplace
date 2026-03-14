# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::UpdateBookingStatus do
  describe '#call' do
    subject(:result) { described_class.call(booking: booking, new_status: new_status) }

    let(:vendor) { create(:user, :vendor) }
    let(:customer) { create(:user, :customer) }
    let(:vendor_profile) { vendor.vendor_profile }
    let(:service) { create(:service, vendor_profile: vendor_profile) }
    let(:booking) { create(:booking, service: service, customer: customer, status: 'pending') }

    describe 'basic status update' do
      let(:new_status) { 'confirmed' }

      it 'updates booking status' do
        expect { result }.to change { booking.reload.status }.to('confirmed')
      end

      it 'returns success result' do
        expect(result[:success]).to be true
        expect(result[:booking]).to eq(booking)
      end
    end

    describe 'notification on status change' do
      context 'when status changes to accepted' do
        let(:new_status) { 'accepted' }

        it 'sends status change notification' do
          expect(Notifications::SendBookingStatusChange).to receive(:call).with(
            booking: booking, status: 'accepted'
          )
          result
        end
      end

      context 'when status changes to cancelled' do
        let(:new_status) { 'cancelled' }

        it 'sends status change notification' do
          expect(Notifications::SendBookingStatusChange).to receive(:call).with(
            booking: booking, status: 'cancelled'
          )
          result
        end
      end

      context 'when status changes to non-notifiable status (pending)' do
        let(:new_status) { 'pending' }

        it 'does not send notification' do
          expect(Notifications::SendBookingStatusChange).not_to receive(:call)
          result
        end
      end

      context 'when notification sending fails' do
        let(:new_status) { 'accepted' }

        before do
          allow(Notifications::SendBookingStatusChange).to receive(:call).and_raise(StandardError, 'Service error')
        end

        it 'still updates booking status' do
          expect { result }.to change { booking.reload.status }.to('accepted')
        end

        it 'returns success' do
          expect(result[:success]).to be true
        end

        it 'logs the error' do
          expect(Rails.logger).to receive(:error).with(/Failed to send status change notification/)
          result
        end
      end
    end

    describe 'inline trust stats calculation' do
      context 'when status changes to completed' do
        let(:new_status) { 'completed' }

        it 'calculates trust stats inline instead of enqueueing job' do
          expect(VendorProfiles::CalculatePublicStats).to receive(:call).with(
            vendor_profile: vendor_profile
          )
          result
        end

        it 'returns success when stats calculation succeeds' do
          allow(VendorProfiles::CalculatePublicStats).to receive(:call)
          expect(result[:success]).to be true
        end

        it 'raises error when stats calculation fails' do
          allow(VendorProfiles::CalculatePublicStats).to receive(:call).and_raise(StandardError, 'Stats error')

          expect { result }.to raise_error(StandardError, /Stats error/)
        end

        it 'logs error when stats calculation fails' do
          allow(VendorProfiles::CalculatePublicStats).to receive(:call).and_raise(StandardError, 'Stats error')

          expect(Rails.logger).to receive(:error).with(/Failed to recalculate trust stats/)
          expect { result }.to raise_error(StandardError)
        end
      end

      context 'when status changes to declined' do
        let(:new_status) { 'declined' }

        it 'calculates trust stats inline' do
          expect(VendorProfiles::CalculatePublicStats).to receive(:call).with(
            vendor_profile: vendor_profile
          )
          result
        end
      end

      context 'when status changes to cancelled' do
        let(:new_status) { 'cancelled' }

        it 'calculates trust stats inline' do
          expect(VendorProfiles::CalculatePublicStats).to receive(:call).with(
            vendor_profile: vendor_profile
          )
          result
        end
      end

      context 'when status changes to non-terminal status (pending)' do
        let(:new_status) { 'pending' }

        it 'does not calculate trust stats' do
          expect(VendorProfiles::CalculatePublicStats).not_to receive(:call)
          result
        end
      end
    end

    describe 'error handling' do
      context 'when booking update fails' do
        let(:new_status) { 'completed' }

        before do
          allow(booking).to receive(:update).and_return(false)
          allow(booking).to receive_message_chain(:errors, :full_messages, :join).and_return('Validation failed')
        end

        it 'returns failure without calculating stats' do
          expect(VendorProfiles::CalculatePublicStats).not_to receive(:call)
          expect(result[:success]).to be false
          expect(result[:error]).to include('Validation failed')
        end
      end

      context 'when stats calculation fails but booking was updated' do
        let(:new_status) { 'completed' }

        before do
          allow(VendorProfiles::CalculatePublicStats).to receive(:call).and_raise(StandardError, 'Stats failed')
        end

        it 'raises the error' do
          expect { result }.to raise_error(StandardError)
        end

        it 'booking is still updated despite stats failure' do
          expect do
            result
          rescue StandardError
            StandardError
          end.to change { booking.reload.status }.to('completed')
        end
      end
    end
  end
end
