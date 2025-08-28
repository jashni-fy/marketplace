require 'rails_helper'

RSpec.describe Api::V1::ServicesController, type: :controller do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:other_vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:other_vendor_profile) { other_vendor_user.vendor_profile }
  let(:service_category) { create(:service_category) }
  
  let(:valid_service_attributes) do
    {
      name: 'Wedding Photography',
      description: 'Professional wedding photography service with high-quality images and comprehensive coverage of your special day.',
      service_category_id: service_category.id,
      base_price: 1200.00,
      pricing_type: 'package',
      status: 'active'
    }
  end

  let(:invalid_service_attributes) do
    {
      name: '',
      description: 'Short',
      service_category_id: nil,
      base_price: -100,
      pricing_type: '',
      status: ''
    }
  end

  # Helper method to generate JWT token for authentication
  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'GET #index' do
    let!(:active_service) { create(:service, vendor_profile: vendor_profile, status: :active) }
    let!(:draft_service) { create(:service, vendor_profile: vendor_profile, status: :draft) }
    let!(:other_vendor_service) { create(:service, vendor_profile: other_vendor_profile, status: :active) }

    context 'without authentication' do
      it 'returns only active services' do
        get :index, format: :json
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        
        expect(json_response['services'].length).to eq(2)
        service_ids = json_response['services'].map { |s| s['id'] }
        expect(service_ids).to include(active_service.id, other_vendor_service.id)
        expect(service_ids).not_to include(draft_service.id)
      end

      it 'includes pagination information' do
        get :index, format: :json
        
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('pagination')
        expect(json_response['pagination']).to include(
          'current_page', 'total_pages', 'total_count', 'per_page'
        )
      end
    end

    context 'with vendor authentication' do
      before { request.headers.merge!(auth_headers(vendor_user)) }

      it 'can filter by status including draft services' do
        get :index, params: { status: 'draft' }, format: :json
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        
        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['id']).to eq(draft_service.id)
      end
    end

    context 'with filtering' do
      let!(:photography_service) { create(:service, :photography, vendor_profile: vendor_profile) }
      let!(:expensive_service) { create(:service, :expensive, vendor_profile: vendor_profile) }

      it 'filters by category' do
        get :index, params: { category_id: photography_service.service_category_id }, format: :json
        
        json_response = JSON.parse(response.body)
        service_ids = json_response['services'].map { |s| s['id'] }
        expect(service_ids).to include(photography_service.id)
      end

      it 'filters by price range' do
        get :index, params: { min_price: 100, max_price: 1000 }, format: :json
        
        json_response = JSON.parse(response.body)
        service_ids = json_response['services'].map { |s| s['id'] }
        expect(service_ids).not_to include(expensive_service.id)
      end
    end

    context 'with pagination' do
      before do
        create_list(:service, 25, vendor_profile: vendor_profile, status: :active)
      end

      it 'paginates results' do
        get :index, params: { page: 1, per_page: 10 }, format: :json
        
        json_response = JSON.parse(response.body)
        expect(json_response['services'].length).to eq(10)
        expect(json_response['pagination']['current_page']).to eq(1)
        expect(json_response['pagination']['total_pages']).to be > 1
      end

      it 'limits per_page to maximum of 100' do
        get :index, params: { per_page: 200 }, format: :json
        
        json_response = JSON.parse(response.body)
        expect(json_response['pagination']['per_page']).to eq(100)
      end
    end
  end

  describe 'GET #show' do
    let(:service) { create(:service, vendor_profile: vendor_profile) }

    it 'returns the service details' do
      get :show, params: { id: service.id }, format: :json
      
      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      
      expect(json_response['service']['id']).to eq(service.id)
      expect(json_response['service']['name']).to eq(service.name)
      expect(json_response['service']['description']).to eq(service.description)
      expect(json_response['service']['vendor']['business_name']).to eq(vendor_profile.business_name)
    end

    it 'returns 404 for non-existent service' do
      get :show, params: { id: 99999 }, format: :json
      
      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Service not found')
    end
  end

  describe 'POST #create' do
    context 'with vendor authentication' do
      before { request.headers.merge!(auth_headers(vendor_user)) }

      context 'with valid attributes' do
        it 'creates a new service' do
          expect {
            post :create, params: { service: valid_service_attributes }, format: :json
          }.to change(Service, :count).by(1)
          
          expect(response).to have_http_status(:created)
          json_response = JSON.parse(response.body)
          
          expect(json_response['message']).to eq('Service created successfully')
          expect(json_response['service']['name']).to eq(valid_service_attributes[:name])
          expect(json_response['service']['vendor']['id']).to eq(vendor_profile.id)
        end
      end

      context 'with invalid attributes' do
        it 'returns validation errors' do
          post :create, params: { service: invalid_service_attributes }, format: :json
          
          expect(response).to have_http_status(:unprocessable_entity)
          json_response = JSON.parse(response.body)
          
          expect(json_response['error']).to eq('Service creation failed')
          expect(json_response['details']).to be_an(Array)
          expect(json_response['details']).not_to be_empty
        end
      end
    end

    context 'with customer authentication' do
      before { request.headers.merge!(auth_headers(customer_user)) }

      it 'returns forbidden error' do
        post :create, params: { service: valid_service_attributes }, format: :json
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Only vendors can manage services')
      end
    end

    context 'without authentication' do
      it 'returns unauthorized error' do
        post :create, params: { service: valid_service_attributes }, format: :json
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PUT #update' do
    let(:service) { create(:service, vendor_profile: vendor_profile) }
    let(:other_vendor_service) { create(:service, vendor_profile: other_vendor_profile) }

    context 'with vendor authentication' do
      before { request.headers.merge!(auth_headers(vendor_user)) }

      context 'updating own service' do
        it 'updates the service successfully' do
          new_name = 'Updated Service Name'
          put :update, params: { 
            id: service.id, 
            service: { name: new_name } 
          }, format: :json
          
          expect(response).to have_http_status(:success)
          json_response = JSON.parse(response.body)
          
          expect(json_response['message']).to eq('Service updated successfully')
          expect(json_response['service']['name']).to eq(new_name)
          
          service.reload
          expect(service.name).to eq(new_name)
        end

        it 'returns validation errors for invalid data' do
          put :update, params: { 
            id: service.id, 
            service: { name: '' } 
          }, format: :json
          
          expect(response).to have_http_status(:unprocessable_entity)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('Service update failed')
        end
      end

      context 'updating another vendor service' do
        it 'returns forbidden error' do
          put :update, params: { 
            id: other_vendor_service.id, 
            service: { name: 'Hacked Name' } 
          }, format: :json
          
          expect(response).to have_http_status(:forbidden)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('You can only manage your own services')
        end
      end
    end

    context 'with customer authentication' do
      before { request.headers.merge!(auth_headers(customer_user)) }

      it 'returns forbidden error' do
        put :update, params: { 
          id: service.id, 
          service: { name: 'New Name' } 
        }, format: :json
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Only vendors can manage services')
      end
    end
  end

  describe 'DELETE #destroy' do
    let!(:service) { create(:service, vendor_profile: vendor_profile) }
    let!(:other_vendor_service) { create(:service, vendor_profile: other_vendor_profile) }

    context 'with vendor authentication' do
      before { request.headers.merge!(auth_headers(vendor_user)) }

      context 'deleting own service' do
        it 'deletes the service successfully' do
          expect {
            delete :destroy, params: { id: service.id }, format: :json
          }.to change(Service, :count).by(-1)
          
          expect(response).to have_http_status(:success)
          json_response = JSON.parse(response.body)
          expect(json_response['message']).to eq('Service deleted successfully')
        end
      end

      context 'deleting another vendor service' do
        it 'returns forbidden error' do
          expect {
            delete :destroy, params: { id: other_vendor_service.id }, format: :json
          }.not_to change(Service, :count)
          
          expect(response).to have_http_status(:forbidden)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('You can only manage your own services')
        end
      end
    end

    context 'with customer authentication' do
      before { request.headers.merge!(auth_headers(customer_user)) }

      it 'returns forbidden error' do
        delete :destroy, params: { id: service.id }, format: :json
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Only vendors can manage services')
      end
    end
  end

  describe 'GET #search' do
    let!(:photography_service) { create(:service, :photography, vendor_profile: vendor_profile) }
    let!(:videography_service) { create(:service, :videography, vendor_profile: vendor_profile) }

    it 'searches services by query' do
      get :search, params: { q: 'photography' }, format: :json
      
      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      
      expect(json_response['query']).to eq('photography')
      service_ids = json_response['services'].map { |s| s['id'] }
      expect(service_ids).to include(photography_service.id)
      expect(service_ids).not_to include(videography_service.id)
    end

    it 'returns error for empty query' do
      get :search, params: { q: '' }, format: :json
      
      expect(response).to have_http_status(:bad_request)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Search query is required')
    end

    it 'applies additional filters to search results' do
      get :search, params: { 
        q: 'service', 
        category_id: photography_service.service_category_id 
      }, format: :json
      
      json_response = JSON.parse(response.body)
      service_ids = json_response['services'].map { |s| s['id'] }
      expect(service_ids).to include(photography_service.id)
    end
  end

  describe 'authorization' do
    context 'with expired token' do
      it 'returns unauthorized error' do
        expired_token = JwtService.encode({ user_id: vendor_user.id }, 1.hour.ago)
        request.headers['Authorization'] = "Bearer #{expired_token}"
        
        post :create, params: { service: valid_service_attributes }, format: :json
        
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with invalid token' do
      it 'returns unauthorized error' do
        request.headers['Authorization'] = "Bearer invalid_token"
        
        post :create, params: { service: valid_service_attributes }, format: :json
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'response format' do
    let(:service) { create(:service, vendor_profile: vendor_profile) }

    it 'returns properly formatted service response' do
      get :show, params: { id: service.id }, format: :json
      
      json_response = JSON.parse(response.body)
      service_data = json_response['service']
      
      expect(service_data).to include(
        'id', 'name', 'description', 'base_price', 'formatted_price',
        'pricing_type', 'status', 'category', 'vendor', 'has_images',
        'created_at', 'updated_at'
      )
      
      expect(service_data['category']).to include('id', 'name', 'slug')
      expect(service_data['vendor']).to include(
        'id', 'business_name', 'location', 'average_rating', 'total_reviews'
      )
    end

    it 'returns properly formatted list response' do
      create(:service, vendor_profile: vendor_profile)
      
      get :index, format: :json
      
      json_response = JSON.parse(response.body)
      
      expect(json_response).to include('services', 'pagination')
      expect(json_response['services']).to be_an(Array)
      expect(json_response['pagination']).to include(
        'current_page', 'total_pages', 'total_count', 'per_page'
      )
    end
  end
end