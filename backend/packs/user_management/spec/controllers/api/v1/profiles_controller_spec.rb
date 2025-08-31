require 'rails_helper'

RSpec.describe Api::V1::ProfilesController, type: :controller do
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
      it 'returns not found error' do
        request.headers.merge!(auth_headers(vendor_user))
        get :show, params: { id: 99999 }, format: :json
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Vendor profile not found')
      end
    end
  end

  describe 'POST #create' do
    context 'when user is authenticated as vendor' do
      let(:new_vendor_user) { create(:user, role: :vendor) }

      context 'with valid parameters' do
        let(:valid_params) do
          {
            vendor_profile: {
              business_name: 'Test Photography',
              description: 'Professional photography services for all your special moments and events',
              location: 'New York, NY',
              phone: '+1-555-123-4567',
              website: 'https://testphotography.com',
              years_experience: 5,
              service_categories_list: ['Photography', 'Event Management']
            }
          }
        end

        it 'creates a new vendor profile' do
          # Destroy the auto-created profile to test creation
          new_vendor_user.vendor_profile.destroy
          request.headers.merge!(auth_headers(new_vendor_user))
          
          expect {
            post :create, params: valid_params, format: :json
          }.to change(VendorProfile, :count).by(1)

          expect(response).to have_http_status(:created)
          json_response = JSON.parse(response.body)
          expect(json_response['business_name']).to eq('Test Photography')
          expect(json_response['service_categories']).to eq(['Photography', 'Event Management'])
        end
      end

      context 'with invalid parameters' do
        let(:invalid_params) do
          {
            vendor_profile: {
              business_name: '',
              description: 'Short',
              location: '',
              phone: 'invalid-phone',
              website: 'not-a-url'
            }
          }
        end

        it 'returns validation errors' do
          # Destroy the auto-created profile to test creation
          new_vendor_user.vendor_profile.destroy
          request.headers.merge!(auth_headers(new_vendor_user))
          post :create, params: invalid_params, format: :json
          
          expect(response).to have_http_status(:unprocessable_content)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('Profile creation failed')
          expect(json_response['details']).to be_an(Array)
        end
      end

      context 'when vendor already has a profile' do
        it 'returns validation error for uniqueness' do
          request.headers.merge!(auth_headers(vendor_user))
          valid_params = {
            vendor_profile: {
              business_name: 'Another Business',
              description: 'Another description that is long enough to pass validation',
              location: 'Los Angeles, CA'
            }
          }

          post :create, params: valid_params, format: :json
          
          expect(response).to have_http_status(:unprocessable_content)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('Profile already exists')
          expect(json_response['details']).to include('Vendor profile already exists for this user')
        end
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized error' do
        post :create, params: { vendor_profile: { business_name: 'Test' } }, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when user is not a vendor' do
      it 'returns forbidden error' do
        request.headers.merge!(auth_headers(customer_user))
        post :create, params: { vendor_profile: { business_name: 'Test' } }, format: :json
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. Vendor role required.')
      end
    end
  end

  describe 'PUT #update' do
    context 'when user owns the profile' do
      context 'with valid parameters' do
        let(:update_params) do
          {
            id: vendor_profile.id,
            vendor_profile: {
              business_name: 'Updated Photography',
              description: 'Updated professional photography services for all your special moments',
              location: 'Los Angeles, CA',
              years_experience: 8
            }
          }
        end

        it 'updates the vendor profile' do
          request.headers.merge!(auth_headers(vendor_user))
          put :update, params: update_params, format: :json
          
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['business_name']).to eq('Updated Photography')
          expect(json_response['years_experience']).to eq(8)
          
          vendor_profile.reload
          expect(vendor_profile.business_name).to eq('Updated Photography')
        end
      end

      context 'with invalid parameters' do
        let(:invalid_update_params) do
          {
            id: vendor_profile.id,
            vendor_profile: {
              business_name: '',
              description: 'Too short'
            }
          }
        end

        it 'returns validation errors' do
          request.headers.merge!(auth_headers(vendor_user))
          put :update, params: invalid_update_params, format: :json
          
          expect(response).to have_http_status(:unprocessable_content)
          json_response = JSON.parse(response.body)
          expect(json_response['error']).to eq('Profile update failed')
          expect(json_response['details']).to be_an(Array)
        end
      end
    end

    context 'when user does not own the profile' do
      it 'returns forbidden error' do
        request.headers.merge!(auth_headers(other_vendor_user))
        put :update, params: { 
          id: vendor_profile.id, 
          vendor_profile: { business_name: 'Hacked' } 
        }, format: :json
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. You can only manage your own profile.')
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized error' do
        put :update, params: { 
          id: vendor_profile.id, 
          vendor_profile: { business_name: 'Test' } 
        }, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when user owns the profile' do
      it 'deletes the vendor profile' do
        request.headers.merge!(auth_headers(vendor_user))
        profile_id = vendor_profile.id
        
        expect {
          delete :destroy, params: { id: profile_id }, format: :json
        }.to change(VendorProfile, :count).by(-1)
        
        expect(response).to have_http_status(:no_content)
      end
    end

    context 'when user does not own the profile' do
      it 'returns forbidden error' do
        request.headers.merge!(auth_headers(other_vendor_user))
        delete :destroy, params: { id: vendor_profile.id }, format: :json
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. You can only manage your own profile.')
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized error' do
        delete :destroy, params: { id: vendor_profile.id }, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET #me' do
    context 'when vendor has a profile' do
      it 'returns the current user vendor profile' do
        request.headers.merge!(auth_headers(vendor_user))
        get :me, format: :json
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['id']).to eq(vendor_profile.id)
        expect(json_response['user_id']).to eq(vendor_user.id)
      end
    end

    context 'when vendor does not have a profile' do
      let(:new_vendor) { create(:user, role: :vendor) }

      it 'returns not found error' do
        # Destroy the auto-created profile to test the not found case
        new_vendor.vendor_profile.destroy
        request.headers.merge!(auth_headers(new_vendor))
        get :me, format: :json
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Vendor profile not found')
      end
    end

    context 'when user is not a vendor' do
      it 'returns forbidden error' do
        request.headers.merge!(auth_headers(customer_user))
        get :me, format: :json
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. Vendor role required.')
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized error' do
        get :me, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET #service_categories' do
    let!(:photography_category) { create(:service_category, name: 'Photography', active: true) }
    let!(:videography_category) { create(:service_category, name: 'Videography', active: true) }
    let!(:inactive_category) { create(:service_category, name: 'Inactive', active: false) }

    it 'returns active service categories' do
      get :service_categories, format: :json
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      categories = json_response['service_categories']
      
      expect(categories.length).to eq(2)
      category_names = categories.map { |c| c['name'] }
      expect(category_names).to include('Photography', 'Videography')
      expect(category_names).not_to include('Inactive')
    end

    it 'includes category details' do
      get :service_categories, format: :json
      
      json_response = JSON.parse(response.body)
      category = json_response['service_categories'].first
      
      expect(category).to have_key('id')
      expect(category).to have_key('name')
      expect(category).to have_key('slug')
      expect(category).to have_key('description')
    end
  end
end