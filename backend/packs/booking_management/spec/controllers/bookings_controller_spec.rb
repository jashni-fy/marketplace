# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::BookingsController, type: :controller do
  let(:customer) { create(:user, :customer) }
  let(:vendor) { create(:user, :vendor) }
  let(:service) { create(:service, vendor_profile: vendor.vendor_profile) }
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

  describe 'GET #index' do
    context 'when user is a customer' do
      before do
        token = JwtService.encode(user_id: customer.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns customer bookings' do
        customer_booking = create(:booking, customer: customer, vendor: vendor, service: service)
        other_booking = create(:booking, vendor: vendor, service: service)

        get :index

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['bookings'].length).to eq(1)
        expect(json_response['bookings'].first['id']).to eq(customer_booking.id)
      end
    end

    context 'when user is a vendor' do
      before do
        token = JwtService.encode(user_id: vendor.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns vendor bookings' do
        # Create availability slots for both vendors
        create(:availability_slot,
          vendor_profile: vendor.vendor_profile,
          date: 1.week.from_now.to_date,
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        )
        
        other_vendor = create(:user, :vendor)
        create(:availability_slot,
          vendor_profile: other_vendor.vendor_profile,
          date: 1.week.from_now.to_date,
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        )
        
        vendor_booking = create(:booking, customer: customer, vendor: vendor, service: service)
        other_customer = create(:user, :customer)
        other_service = create(:service, vendor_profile: other_vendor.vendor_profile)
        other_booking = create(:booking, customer: other_customer, vendor: other_vendor, service: other_service)

        get :index

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['bookings'].length).to eq(1)
        expect(json_response['bookings'].first['id']).to eq(vendor_booking.id)
      end
    end
  end

  describe 'GET #show' do
    context 'when user is the customer' do
      before do
        token = JwtService.encode(user_id: customer.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns the booking details' do
        get :show, params: { id: booking.id }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['booking']['id']).to eq(booking.id)
        expect(json_response['booking']['status']).to eq(booking.status)
      end
    end

    context 'when user is the vendor' do
      before do
        token = JwtService.encode(user_id: vendor.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns the booking details' do
        get :show, params: { id: booking.id }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['booking']['id']).to eq(booking.id)
      end
    end

    context 'when user is not involved in the booking' do
      let(:other_user) { create(:user, :customer) }
      before do
        token = JwtService.encode(user_id: other_user.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns forbidden' do
        get :show, params: { id: booking.id }

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied')
      end
    end
  end

  describe 'POST #create' do
    before do
      token = JwtService.encode(user_id: customer.id)
      request.headers['Authorization'] = "Bearer #{token}"
    end

    let!(:availability_slot) do
      create(:availability_slot,
        vendor_profile: vendor.vendor_profile,
        date: 1.week.from_now.to_date,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      )
    end

    let(:valid_params) do
      {
        booking: {
          service_id: service.id,
          event_date: 1.week.from_now.change(hour: 10),
          event_location: 'Test Location',
          total_amount: 100.00,
          requirements: 'Test requirements',
          special_instructions: 'Test instructions'
        }
      }
    end

    it 'creates a new booking using BookingCreationService' do
      expect {
        post :create, params: valid_params
      }.to change(Booking, :count).by(1)

      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      expect(json_response['booking']['service']['id']).to eq(service.id)
      expect(json_response['booking']['customer']['id']).to eq(customer.id)
      expect(json_response['booking']['vendor']['id']).to eq(vendor.id)
      expect(json_response['booking']['status']).to eq('pending')
      expect(json_response['message']).to eq('Booking created successfully')
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        {
          booking: {
            service_id: nil,
            event_date: nil
          }
        }
      end

      it 'returns unprocessable entity' do
        expect {
          post :create, params: invalid_params
        }.not_to change(Booking, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to be_an(Array)
        expect(json_response['error']).to eq('Failed to create booking')
      end
    end

    context 'when vendor has no availability' do
      before { availability_slot.destroy }

      it 'returns unprocessable entity with availability error' do
        expect {
          post :create, params: valid_params
        }.not_to change(Booking, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Event date is not available for this vendor')
      end
    end
  end

  describe 'PUT #update' do
    before do
      token = JwtService.encode(user_id: customer.id)
      request.headers['Authorization'] = "Bearer #{token}"
    end

    let(:update_params) do
      {
        id: booking.id,
        booking: {
          event_location: 'Updated Location',
          requirements: 'Updated requirements'
        }
      }
    end

    context 'when booking can be modified' do
      before { allow(booking).to receive(:can_be_modified?).and_return(true) }

      it 'updates the booking' do
        put :update, params: update_params

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['booking']['event_location']).to eq('Updated Location')
        expect(json_response['booking']['requirements']).to eq('Updated requirements')
      end
    end

    context 'when booking cannot be modified' do
      let(:non_modifiable_booking) { create(:booking, customer: customer, vendor: vendor, service: service, status: :accepted) }
      let(:update_params) do
        {
          id: non_modifiable_booking.id,
          booking: {
            event_location: 'Updated Location',
            requirements: 'Updated requirements'
          }
        }
      end

      it 'returns forbidden' do
        put :update, params: update_params

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Cannot modify this booking')
      end
    end
  end

  describe 'DELETE #destroy' do
    before do
      token = JwtService.encode(user_id: customer.id)
      request.headers['Authorization'] = "Bearer #{token}"
    end

    context 'when booking can be cancelled' do
      before { allow(booking).to receive(:can_be_cancelled?).and_return(true) }

      it 'cancels the booking' do
        delete :destroy, params: { id: booking.id }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Booking cancelled successfully')
        expect(booking.reload.status).to eq('cancelled')
      end
    end

    context 'when booking cannot be cancelled' do
      before { allow(booking).to receive(:can_be_cancelled?).and_return(false) }

      it 'returns unprocessable entity' do
        delete :destroy, params: { id: booking.id }

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Booking cannot be cancelled')
      end
    end
  end

  describe 'POST #respond' do
    before do
      token = JwtService.encode(user_id: vendor.id)
      request.headers['Authorization'] = "Bearer #{token}"
    end

    context 'when accepting a booking' do
      it 'accepts the booking' do
        post :respond, params: { id: booking.id, response_action: 'accept' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Booking accepted successfully')
        expect(booking.reload.status).to eq('accepted')
      end
    end

    context 'when declining a booking' do
      it 'declines the booking' do
        post :respond, params: { id: booking.id, response_action: 'decline' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Booking declined')
        expect(booking.reload.status).to eq('declined')
      end
    end

    context 'when making a counter offer' do
      it 'creates a counter offer' do
        post :respond, params: { 
          id: booking.id, 
          response_action: 'counter_offer',
          counter_amount: 150.00,
          counter_message: 'Counter offer message'
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Counter offer sent')
        expect(booking.reload.status).to eq('counter_offered')
        expect(booking.total_amount).to eq(150.00)
      end
    end

    context 'with invalid response action' do
      it 'returns bad request' do
        post :respond, params: { id: booking.id, response_action: 'invalid' }

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Invalid response action')
      end
    end

    context 'when user is not the vendor' do
      before do
        token = JwtService.encode(user_id: customer.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns forbidden' do
        post :respond, params: { id: booking.id, response_action: 'accept' }

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Cannot respond to this booking')
      end
    end
  end

  describe 'GET #messages' do
    let!(:message) { create(:booking_message, booking: booking, sender: customer) }

    context 'when user is involved in the booking' do
      before do
        token = JwtService.encode(user_id: customer.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns booking messages' do
        get :messages, params: { id: booking.id }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['messages'].length).to eq(1)
        expect(json_response['messages'].first['id']).to eq(message.id)
      end
    end

    context 'when user is not involved in the booking' do
      let(:other_user) { create(:user, :customer) }
      before do
        token = JwtService.encode(user_id: other_user.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns forbidden' do
        get :messages, params: { id: booking.id }

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied')
      end
    end
  end

  describe 'POST #send_message' do
    before do
      token = JwtService.encode(user_id: customer.id)
      request.headers['Authorization'] = "Bearer #{token}"
    end

    it 'creates a new message' do
      expect {
        post :send_message, params: { id: booking.id, message: 'Test message' }
      }.to change(BookingMessage, :count).by(1)

      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      expect(json_response['message']['message']).to eq('Test message')
      expect(json_response['message']['sender']['id']).to eq(customer.id)
    end

    context 'with invalid message' do
      it 'returns unprocessable entity' do
        expect {
          post :send_message, params: { id: booking.id, message: '' }
        }.not_to change(BookingMessage, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to be_an(Array)
      end
    end
  end

  describe 'POST #check_availability' do
    before do
      token = JwtService.encode(user_id: customer.id)
      request.headers['Authorization'] = "Bearer #{token}"
    end

    let!(:availability_slot) do
      create(:availability_slot,
        vendor_profile: vendor.vendor_profile,
        date: 1.week.from_now.to_date,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      )
    end

    let(:valid_params) do
      {
        service_id: service.id,
        date: 1.week.from_now.to_date.to_s,
        start_time: '10:00',
        end_time: '12:00'
      }
    end

    it 'returns availability status when time is available' do
      post :check_availability, params: valid_params

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['available']).to be true
      expect(json_response['message']).to eq('Time slot is available')
    end

    it 'returns unavailable status when time is not available' do
      params = valid_params.merge(start_time: '18:00', end_time: '20:00')
      post :check_availability, params: params

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['available']).to be false
      expect(json_response['message']).to eq('Time slot is not available')
      expect(json_response['suggested_times']).to be_an(Array)
    end

    it 'returns bad request for invalid date format' do
      params = valid_params.merge(date: 'invalid-date')
      post :check_availability, params: params

      expect(response).to have_http_status(:bad_request)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Invalid date or time format')
    end
  end

  describe 'POST #suggest_alternatives' do
    before do
      token = JwtService.encode(user_id: customer.id)
      request.headers['Authorization'] = "Bearer #{token}"
    end

    let!(:availability_slot) do
      create(:availability_slot,
        vendor_profile: vendor.vendor_profile,
        date: 1.week.from_now.to_date,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      )
    end

    let!(:conflicting_booking) do
      create(:booking,
        customer: create(:user, :customer),
        vendor: vendor,
        service: service,
        event_date: 1.week.from_now.change(hour: 10),
        event_end_date: 1.week.from_now.change(hour: 12),
        status: :accepted
      )
    end

    let(:valid_params) do
      {
        vendor_id: vendor.id,
        date: 1.week.from_now.to_date.to_s,
        start_time: '10:00',
        end_time: '12:00'
      }
    end

    it 'returns conflict status and alternative times' do
      post :suggest_alternatives, params: valid_params

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['has_conflict']).to be true
      expect(json_response['alternative_times']).to be_an(Array)
    end

    it 'returns no conflict when times do not overlap' do
      params = valid_params.merge(start_time: '14:00', end_time: '16:00')
      post :suggest_alternatives, params: params

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['has_conflict']).to be false
    end

    it 'returns bad request for invalid date format' do
      params = valid_params.merge(date: 'invalid-date')
      post :suggest_alternatives, params: params

      expect(response).to have_http_status(:bad_request)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Invalid date or time format')
    end
  end
end