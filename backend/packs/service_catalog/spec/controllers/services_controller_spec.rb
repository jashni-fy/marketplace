require 'rails_helper'

RSpec.describe ServicesController, type: :controller do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:service_category) { create(:service_category) }
  let(:service) { create(:service, vendor_profile: vendor_user.vendor_profile, service_category: service_category) }
  let(:other_service) { create(:service, service_category: service_category) }

  describe 'GET #index' do
    let!(:active_service) { create(:service, status: :active, service_category: service_category) }
    let!(:inactive_service) { create(:service, status: :inactive, service_category: service_category) }

    context 'without authentication' do
      it 'returns only active services' do
        get :index

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['id']).to eq(active_service.id)
        expect(json_response['services'].first['status']).to eq('active')
      end
    end

    context 'with vendor authentication' do
      before { sign_in vendor_user }

      it 'returns vendor own services regardless of status' do
        vendor_active = create(:service, vendor_profile: vendor_user.vendor_profile, status: :active)
        vendor_inactive = create(:service, vendor_profile: vendor_user.vendor_profile, status: :inactive)

        get :index

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['services'].length).to eq(2)
        service_ids = json_response['services'].map { |s| s['id'] }
        expect(service_ids).to include(vendor_active.id, vendor_inactive.id)
      end
    end

    context 'with filters' do
      it 'filters by category' do
        other_category = create(:service_category)
        other_service = create(:service, service_category: other_category, status: :active)

        get :index, params: { category_id: service_category.id }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['category']['id']).to eq(service_category.id)
      end

      it 'filters by price range' do
        cheap_service = create(:service, base_price: 50, status: :active)
        expensive_service = create(:service, base_price: 200, status: :active)

        get :index, params: { min_price: 100, max_price: 300 }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['id']).to eq(expensive_service.id)
      end
    end

    context 'with sorting' do
      let!(:service_a) { create(:service, name: 'A Service', base_price: 100, status: :active) }
      let!(:service_b) { create(:service, name: 'B Service', base_price: 50, status: :active) }

      it 'sorts by name' do
        get :index, params: { sort: 'name' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['services'].first['name']).to eq('A Service')
        expect(json_response['services'].last['name']).to eq('B Service')
      end

      it 'sorts by price low to high' do
        get :index, params: { sort: 'price_low' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['services'].first['base_price']).to eq(50)
        expect(json_response['services'].last['base_price']).to eq(100)
      end
    end
  end

  describe 'GET #show' do
    it 'returns the service details' do
      get :show, params: { id: service.id }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['service']['id']).to eq(service.id)
      expect(json_response['service']['name']).to eq(service.name)
      expect(json_response['service']['vendor']['id']).to eq(service.vendor_profile.id)
    end

    context 'when service does not exist' do
      it 'returns not found' do
        get :show, params: { id: 999999 }

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Service not found')
      end
    end
  end

  describe 'POST #create' do
    context 'when authenticated as vendor' do
      before { sign_in vendor_user }

      let(:valid_params) do
        {
          service: {
            name: 'New Service',
            description: 'A new service description',
            service_category_id: service_category.id,
            base_price: 100.00,
            pricing_type: 'fixed',
            status: 'active'
          }
        }
      end

      it 'creates a new service' do
        expect {
          post :create, params: valid_params
        }.to change(Service, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Service created successfully')
        expect(json_response['service']['name']).to eq('New Service')
        expect(json_response['service']['vendor']['id']).to eq(vendor_user.vendor_profile.id)
      end

      context 'with invalid parameters' do
        let(:invalid_params) do
          {
            service: {
              name: '',
              description: 'Description without name'
            }
          }
        end

        it 'returns unprocessable entity' do
          expect {
            post :create, params: invalid_params
          }.not_to change(Service, :count)

          expect(response).to have_http_status(:unprocessable_entity)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('Service creation failed')
          expect(json_response['details']).to be_an(Array)
        end
      end
    end

    context 'when authenticated as customer' do
      before { sign_in customer_user }

      it 'returns forbidden' do
        post :create, params: { service: { name: 'Test' } }

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Only vendors can manage services')
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        post :create, params: { service: { name: 'Test' } }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PUT #update' do
    before { sign_in vendor_user }

    let(:update_params) do
      {
        id: service.id,
        service: {
          name: 'Updated Service Name',
          description: 'Updated description'
        }
      }
    end

    it 'updates the service' do
      put :update, params: update_params

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Service updated successfully')
      expect(json_response['service']['name']).to eq('Updated Service Name')
    end

    context 'when user does not own the service' do
      let(:other_vendor) { create(:user, :vendor) }
      before { sign_in other_vendor }

      it 'returns forbidden' do
        put :update, params: update_params

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('You can only manage your own services')
      end
    end
  end

  describe 'DELETE #destroy' do
    before { sign_in vendor_user }

    it 'deletes the service' do
      service_to_delete = create(:service, vendor_profile: vendor_user.vendor_profile)
      
      expect {
        delete :destroy, params: { id: service_to_delete.id }
      }.to change(Service, :count).by(-1)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Service deleted successfully')
    end
  end

  describe 'GET #search' do
    let!(:matching_service) { create(:service, name: 'Photography Service', status: :active) }
    let!(:non_matching_service) { create(:service, name: 'Catering Service', status: :active) }

    it 'searches services by query' do
      get :search, params: { q: 'photography' }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['query']).to eq('photography')
      expect(json_response['services'].length).to eq(1)
      expect(json_response['services'].first['id']).to eq(matching_service.id)
    end

    context 'with empty query' do
      it 'returns bad request' do
        get :search, params: { q: '' }

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Search query is required')
      end
    end

    context 'with additional filters' do
      it 'applies filters to search results' do
        photography_expensive = create(:service, name: 'Expensive Photography', base_price: 500, status: :active)
        photography_cheap = create(:service, name: 'Cheap Photography', base_price: 50, status: :active)

        get :search, params: { q: 'photography', min_price: 100 }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['id']).to eq(photography_expensive.id)
      end
    end
  end
end