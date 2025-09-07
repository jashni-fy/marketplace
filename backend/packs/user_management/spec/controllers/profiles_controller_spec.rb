require 'rails_helper'

RSpec.describe ProfilesController, type: :controller do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:other_vendor_user) { create(:user, :vendor) }
  let(:other_vendor_profile) { other_vendor_user.vendor_profile }

  # Helper method to generate JWT token for authentication
  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'GET #show' do
    context 'when vendor profile exists' do
      it 'returns the vendor profile' do
        request.headers.merge!(auth_headers(vendor_user))
        get :show, params: { id: vendor_profile.id }, format: :json

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['id']).to eq(vendor_profile.id)
        expect(json_response['business_name']).to eq(vendor_profile.business_name)
      end
    end

    context 'when vendor profile does not exist' do
      it 'returns not found' do
        request.headers.merge!(auth_headers(vendor_user))
        get :show, params: { id: 999999 }, format: :json

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Vendor profile not found')
      end
    end
  end

  describe 'POST #create' do
    context 'when user is a vendor without existing profile' do
      let(:user_without_profile) { create(:user, :vendor) }
      
      before do
        user_without_profile.vendor_profile&.destroy
        user_without_profile.reload
      end

      let(:valid_params) do
        {
          vendor_profile: {
            business_name: 'Test Business',
            description: 'Test Description',
            location: 'Test Location',
            phone: '123-456-7890',
            website: 'https://test.com',
            years_experience: 5
          }
        }
      end

      it 'creates a new vendor profile' do
        request.headers.merge!(auth_headers(user_without_profile))
        
        expect {
          post :create, params: valid_params, format: :json
        }.to change(VendorProfile, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['business_name']).to eq('Test Business')
        expect(json_response['user_id']).to eq(user_without_profile.id)
      end
    end

    context 'when user already has a vendor profile' do
      let(:valid_params) do
        {
          vendor_profile: {
            business_name: 'Another Business',
            description: 'Another Description'
          }
        }
      end

      it 'returns unprocessable entity' do
        request.headers.merge!(auth_headers(vendor_user))
        
        post :create, params: valid_params, format: :json

        expect(response).to have_http_status(:unprocessable_content)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Profile already exists')
      end
    end

    context 'when user is not a vendor' do
      it 'returns forbidden' do
        request.headers.merge!(auth_headers(customer_user))
        
        post :create, params: { vendor_profile: { business_name: 'Test' } }, format: :json

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. Vendor role required.')
      end
    end
  end

  describe 'PUT #update' do
    let(:update_params) do
      {
        id: vendor_profile.id,
        vendor_profile: {
          business_name: 'Updated Business Name',
          description: 'Updated Description'
        }
      }
    end

    context 'when user owns the profile' do
      it 'updates the vendor profile' do
        request.headers.merge!(auth_headers(vendor_user))
        
        put :update, params: update_params, format: :json

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['business_name']).to eq('Updated Business Name')
        expect(json_response['description']).to eq('Updated Description')
      end
    end

    context 'when user does not own the profile' do
      it 'returns forbidden' do
        request.headers.merge!(auth_headers(other_vendor_user))
        
        put :update, params: update_params, format: :json

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. You can only manage your own profile.')
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when user owns the profile' do
      it 'deletes the vendor profile' do
        request.headers.merge!(auth_headers(vendor_user))
        
        expect {
          delete :destroy, params: { id: vendor_profile.id }, format: :json
        }.to change(VendorProfile, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context 'when user does not own the profile' do
      it 'returns forbidden' do
        request.headers.merge!(auth_headers(other_vendor_user))
        
        delete :destroy, params: { id: vendor_profile.id }, format: :json

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. You can only manage your own profile.')
      end
    end
  end

  describe 'GET #me' do
    context 'when user has a vendor profile' do
      it 'returns the current user vendor profile' do
        request.headers.merge!(auth_headers(vendor_user))
        
        get :me, format: :json

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['id']).to eq(vendor_profile.id)
        expect(json_response['user_id']).to eq(vendor_user.id)
      end
    end

    context 'when user does not have a vendor profile' do
      let(:user_without_profile) { create(:user, :vendor) }
      
      before do
        user_without_profile.vendor_profile&.destroy
        user_without_profile.reload
      end

      it 'returns not found' do
        request.headers.merge!(auth_headers(user_without_profile))
        
        get :me, format: :json

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Vendor profile not found')
      end
    end
  end

  describe 'GET #service_categories' do
    let!(:active_category) { create(:service_category, name: 'Active Category', active: true) }
    let!(:inactive_category) { create(:service_category, name: 'Inactive Category', active: false) }

    it 'returns active service categories without authentication' do
      get :service_categories, format: :json

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['service_categories']).to be_an(Array)
      expect(json_response['service_categories'].length).to eq(1)
      expect(json_response['service_categories'].first['name']).to eq('Active Category')
    end
  end
end