# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AvailabilitySlotsController, type: :controller do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:availability_slot) { create(:availability_slot, vendor_profile: vendor_user.vendor_profile) }

  describe 'authentication and authorization' do
    context 'when not authenticated' do
      it 'returns unauthorized for index' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as customer' do
      before { sign_in customer_user }

      it 'returns forbidden for index' do
        get :index
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. Vendor account required.')
      end
    end
  end

  describe 'GET #index' do
    before { sign_in vendor_user }

    let!(:today_slot) { create(:availability_slot, vendor_profile: vendor_user.vendor_profile, date: Date.current) }
    let!(:future_slot) { create(:availability_slot, vendor_profile: vendor_user.vendor_profile, date: 1.week.from_now) }
    let!(:past_slot) { create(:availability_slot, vendor_profile: vendor_user.vendor_profile, date: 1.week.ago) }

    it 'returns upcoming availability slots by default' do
      get :index

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['availability_slots']).to be_an(Array)
      # Should include today and future slots, but not past slots
      slot_ids = json_response['availability_slots'].map { |slot| slot['id'] }
      expect(slot_ids).to include(today_slot.id, future_slot.id)
      expect(slot_ids).not_to include(past_slot.id)
    end

    context 'with date range filter' do
      it 'filters by date range' do
        get :index, params: { 
          start_date: Date.current, 
          end_date: Date.current + 3.days 
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        slot_ids = json_response['availability_slots'].map { |slot| slot['id'] }
        expect(slot_ids).to include(today_slot.id)
        expect(slot_ids).not_to include(future_slot.id, past_slot.id)
      end
    end

    context 'with specific date filter' do
      it 'filters by specific date' do
        get :index, params: { date: Date.current }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['availability_slots'].length).to eq(1)
        expect(json_response['availability_slots'].first['id']).to eq(today_slot.id)
      end
    end

    it 'includes pagination metadata' do
      get :index

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['pagination']).to be_a(Hash)
      expect(json_response['pagination']).to have_key('current_page')
      expect(json_response['pagination']).to have_key('total_pages')
      expect(json_response['pagination']).to have_key('total_count')
    end
  end

  describe 'GET #show' do
    before { sign_in vendor_user }

    it 'returns the availability slot' do
      get :show, params: { id: availability_slot.id }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['availability_slot']['id']).to eq(availability_slot.id)
      expect(json_response['availability_slot']['date']).to eq(availability_slot.date.to_s)
    end

    context 'when slot does not exist' do
      it 'returns not found' do
        get :show, params: { id: 999999 }

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Availability slot not found')
      end
    end
  end

  describe 'POST #create' do
    before { sign_in vendor_user }

    let(:valid_params) do
      {
        availability_slot: {
          date: 1.week.from_now.to_date,
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        }
      }
    end

    it 'creates a new availability slot' do
      expect {
        post :create, params: valid_params
      }.to change(AvailabilitySlot, :count).by(1)

      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      expect(json_response['availability_slot']['date']).to eq(valid_params[:availability_slot][:date].to_s)
      expect(json_response['availability_slot']['is_available']).to be true
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        {
          availability_slot: {
            date: nil,
            start_time: '09:00',
            end_time: '08:00' # End time before start time
          }
        }
      end

      it 'returns unprocessable entity' do
        expect {
          post :create, params: invalid_params
        }.not_to change(AvailabilitySlot, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to be_an(Array)
      end
    end
  end

  describe 'PUT #update' do
    before { sign_in vendor_user }

    let(:update_params) do
      {
        id: availability_slot.id,
        availability_slot: {
          start_time: '10:00',
          end_time: '18:00',
          is_available: false
        }
      }
    end

    it 'updates the availability slot' do
      put :update, params: update_params

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['availability_slot']['start_time']).to eq('10:00')
      expect(json_response['availability_slot']['end_time']).to eq('18:00')
      expect(json_response['availability_slot']['is_available']).to be false
    end
  end

  describe 'DELETE #destroy' do
    before { sign_in vendor_user }

    context 'when slot has no booking conflicts' do
      before { allow_any_instance_of(AvailabilitySlot).to receive(:has_booking_conflict?).and_return(false) }

      it 'deletes the availability slot' do
        slot_to_delete = create(:availability_slot, vendor_profile: vendor_user.vendor_profile)
        
        expect {
          delete :destroy, params: { id: slot_to_delete.id }
        }.to change(AvailabilitySlot, :count).by(-1)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Availability slot deleted successfully')
      end
    end

    context 'when slot has booking conflicts' do
      before { allow_any_instance_of(AvailabilitySlot).to receive(:has_booking_conflict?).and_return(true) }

      it 'returns unprocessable entity' do
        expect {
          delete :destroy, params: { id: availability_slot.id }
        }.not_to change(AvailabilitySlot, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Cannot delete availability slot with existing bookings')
      end
    end
  end

  describe 'POST #bulk_create' do
    before { sign_in vendor_user }

    let(:bulk_params) do
      {
        availability_slots: [
          {
            date: 1.week.from_now.to_date,
            start_time: '09:00',
            end_time: '12:00',
            is_available: true
          },
          {
            date: 1.week.from_now.to_date,
            start_time: '13:00',
            end_time: '17:00',
            is_available: true
          }
        ]
      }
    end

    it 'creates multiple availability slots' do
      expect {
        post :bulk_create, params: bulk_params
      }.to change(AvailabilitySlot, :count).by(2)

      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      expect(json_response['availability_slots'].length).to eq(2)
      expect(json_response['message']).to eq('2 slots created successfully')
    end

    context 'with mixed valid and invalid slots' do
      let(:mixed_params) do
        {
          availability_slots: [
            {
              date: 1.week.from_now.to_date,
              start_time: '09:00',
              end_time: '12:00',
              is_available: true
            },
            {
              date: nil, # Invalid
              start_time: '13:00',
              end_time: '17:00',
              is_available: true
            }
          ]
        }
      end

      it 'creates valid slots and reports errors' do
        expect {
          post :bulk_create, params: mixed_params
        }.to change(AvailabilitySlot, :count).by(1)

        expect(response).to have_http_status(:partial_content)
        json_response = JSON.parse(response.body)
        expect(json_response['created_slots'].length).to eq(1)
        expect(json_response['errors'].length).to eq(1)
        expect(json_response['message']).to eq('1 slots created, 1 failed')
      end
    end
  end

  describe 'GET #check_conflicts' do
    before { sign_in vendor_user }

    let(:conflict_params) do
      {
        date: Date.current,
        start_time: '10:00',
        end_time: '14:00'
      }
    end

    context 'when no conflicts exist' do
      it 'returns no conflicts' do
        get :check_conflicts, params: conflict_params

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['has_conflicts']).to be false
        expect(json_response['overlapping_slots']).to be_empty
        expect(json_response['booking_conflicts']).to be_empty
      end
    end

    context 'when overlapping slots exist' do
      let!(:overlapping_slot) do
        create(:availability_slot, 
               vendor_profile: vendor_user.vendor_profile,
               date: Date.current,
               start_time: '09:00',
               end_time: '12:00')
      end

      it 'returns overlapping slots' do
        get :check_conflicts, params: conflict_params

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['has_conflicts']).to be true
        expect(json_response['overlapping_slots'].length).to eq(1)
        expect(json_response['overlapping_slots'].first['id']).to eq(overlapping_slot.id)
      end
    end

    context 'with missing parameters' do
      it 'returns bad request' do
        get :check_conflicts, params: { date: Date.current }

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Missing required parameters')
      end
    end

    context 'with exclude_id parameter' do
      let!(:existing_slot) do
        create(:availability_slot, 
               vendor_profile: vendor_user.vendor_profile,
               date: Date.current,
               start_time: '09:00',
               end_time: '12:00')
      end

      it 'excludes the specified slot from conflict check' do
        get :check_conflicts, params: conflict_params.merge(exclude_id: existing_slot.id)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['has_conflicts']).to be false
        expect(json_response['overlapping_slots']).to be_empty
      end
    end
  end
end