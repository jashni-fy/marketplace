require 'rails_helper'

RSpec.describe Admin::UsersController, type: :controller do
  let(:admin_user) { create(:user, :admin) }
  let(:regular_user) { create(:user, :customer) }
  let(:vendor_user) { create(:user, :vendor) }

  before do
    # Mock the JWT authentication
    token = JwtService.encode(user_id: admin_user.id)
    request.headers['Authorization'] = "Bearer #{token}"
  end

  describe 'GET #index' do
    before do
      create_list(:user, 3, :customer)
      create_list(:user, 2, :vendor)
    end

    it 'returns all users' do
      get :index
      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response['users']).to be_an(Array)
      expect(json_response['meta']).to include('current_page', 'total_pages', 'total_count')
    end

    it 'filters users by role' do
      get :index, params: { role: 'customer' }
      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      json_response['users'].each do |user|
        expect(user['role']).to eq('customer')
      end
    end

    it 'filters users by email' do
      user = create(:user, email: 'test@example.com')
      get :index, params: { email: 'test@example' }
      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response['users'].any? { |u| u['email'] == 'test@example.com' }).to be true
    end
  end

  describe 'GET #show' do
    it 'returns user details' do
      get :show, params: { id: regular_user.id }
      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response['user']['id']).to eq(regular_user.id)
      expect(json_response['user']['email']).to eq(regular_user.email)
    end
  end

  describe 'PATCH #update' do
    it 'updates user successfully' do
      patch :update, params: { 
        id: regular_user.id, 
        user: { first_name: 'Updated', last_name: 'Name' } 
      }
      expect(response).to have_http_status(:success)
      
      regular_user.reload
      expect(regular_user.first_name).to eq('Updated')
      expect(regular_user.last_name).to eq('Name')
    end

    it 'returns errors for invalid data' do
      patch :update, params: { 
        id: regular_user.id, 
        user: { email: '' } 
      }
      expect(response).to have_http_status(:unprocessable_entity)
      
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end
  end

  describe 'DELETE #destroy' do
    it 'deletes user successfully' do
      user_to_delete = create(:user)
      expect {
        delete :destroy, params: { id: user_to_delete.id }
      }.to change(User, :count).by(-1)
      
      expect(response).to have_http_status(:success)
    end
  end

  describe 'authentication' do
    context 'when user is not admin' do
      before do
        token = JwtService.encode(user_id: regular_user.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'denies access' do
        get :index
        expect(response).to have_http_status(:forbidden)
        
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to include('Admin privileges required')
      end
    end

    context 'when user is not authenticated' do
      before do
        request.headers['Authorization'] = nil
      end

      it 'denies access' do
        get :index
        expect(response).to have_http_status(:unprocessable_entity)
        
        json_response = JSON.parse(response.body)
        # The response should contain a message about missing token
        expect(json_response['message']).to include('Missing token')
      end
    end
  end
end