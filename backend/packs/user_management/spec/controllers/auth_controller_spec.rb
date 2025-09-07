require 'rails_helper'

RSpec.describe Api::AuthController, type: :controller do
  let(:user) { create(:user, confirmed_at: Time.current) }
  let(:unconfirmed_user) { create(:user, confirmed_at: nil) }
  
  describe 'POST #login' do
    context 'with valid credentials' do
      let(:valid_params) do
        {
          auth: {
            email: user.email,
            password: user.password
          }
        }
      end

      it 'returns success response with token and user data' do
        post :login, params: valid_params, format: :json
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['message']).to eq('Login successful')
        expect(json_response['token']).to be_present
        expect(json_response['user']['id']).to eq(user.id)
        expect(json_response['user']['email']).to eq(user.email)
        expect(json_response['user']['confirmed']).to be true
      end
    end

    context 'with invalid credentials' do
      let(:invalid_params) do
        {
          auth: {
            email: user.email,
            password: 'wrong_password'
          }
        }
      end

      it 'returns unauthorized response' do
        post :login, params: invalid_params, format: :json
        
        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Invalid credentials')
      end
    end

    context 'with unconfirmed user' do
      let(:unconfirmed_params) do
        {
          auth: {
            email: unconfirmed_user.email,
            password: unconfirmed_user.password
          }
        }
      end

      it 'returns unauthorized response' do
        post :login, params: unconfirmed_params, format: :json
        
        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Please confirm your email address before logging in')
      end
    end

    context 'with missing parameters' do
      it 'returns bad request when email is missing' do
        post :login, params: { auth: { password: 'password' } }, format: :json
        
        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Email and password are required')
      end

      it 'returns bad request when password is missing' do
        post :login, params: { auth: { email: 'test@example.com' } }, format: :json
        
        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Email and password are required')
      end
    end
  end

  describe 'POST #register' do
    context 'with valid parameters' do
      let(:valid_params) do
        {
          auth: {
            email: 'newuser@example.com',
            password: 'password123',
            password_confirmation: 'password123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'customer'
          }
        }
      end

      it 'creates a new user and returns success response' do
        expect {
          post :register, params: valid_params, format: :json
        }.to change(User, :count).by(1)
        
        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        
        expect(json_response['message']).to eq('Registration successful. Please check your email to confirm your account.')
        expect(json_response['user']['email']).to eq('newuser@example.com')
        expect(json_response['user']['first_name']).to eq('John')
        expect(json_response['user']['last_name']).to eq('Doe')
        expect(json_response['user']['role']).to eq('customer')
        expect(json_response['user']['confirmed']).to be false
      end
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        {
          auth: {
            email: 'invalid_email',
            password: 'short',
            password_confirmation: 'different',
            first_name: '',
            last_name: '',
            role: 'customer'
          }
        }
      end

      it 'returns unprocessable entity with error details' do
        expect {
          post :register, params: invalid_params, format: :json
        }.not_to change(User, :count)
        
        expect(response).to have_http_status(:unprocessable_content)
        json_response = JSON.parse(response.body)
        
        expect(json_response['error']).to eq('Registration failed')
        expect(json_response['details']).to be_an(Array)
        expect(json_response['details']).to include(match(/Email is invalid/))
      end
    end

    context 'with existing email' do
      let(:existing_email_params) do
        {
          auth: {
            email: user.email,
            password: 'password123',
            password_confirmation: 'password123',
            first_name: 'Jane',
            last_name: 'Doe',
            role: 'vendor'
          }
        }
      end

      it 'returns unprocessable entity' do
        # Ensure the user exists before the test
        user.save! if user.new_record?
        
        expect {
          post :register, params: existing_email_params, format: :json
        }.not_to change(User, :count)
        
        expect(response).to have_http_status(:unprocessable_content)
        json_response = JSON.parse(response.body)
        
        expect(json_response['error']).to eq('Registration failed')
        expect(json_response['details']).to include(match(/Email has already been taken/))
      end
    end
  end

  describe 'DELETE #logout' do
    it 'returns success response' do
      delete :logout, format: :json
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Logout successful')
    end
  end
end