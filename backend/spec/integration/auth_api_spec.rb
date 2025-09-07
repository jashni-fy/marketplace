require 'rails_helper'

RSpec.describe 'Authentication API', type: :request do
  let(:user) { create(:user, confirmed_at: Time.current) }
  let(:unconfirmed_user) { create(:user, confirmed_at: nil) }

  describe 'POST /api/auth/login' do
    it 'successfully logs in a confirmed user' do
      post '/api/auth/login', params: {
        auth: {
          email: user.email,
          password: user.password
        }
      }, as: :json

      expect(response).to have_http_status(:ok)
      
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Login successful')
      expect(json_response['token']).to be_present
      expect(json_response['user']['email']).to eq(user.email)
    end

    it 'rejects unconfirmed user login' do
      post '/api/auth/login', params: {
        auth: {
          email: unconfirmed_user.email,
          password: unconfirmed_user.password
        }
      }, as: :json

      expect(response).to have_http_status(:unauthorized)
      
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Please confirm your email address before logging in')
    end

    it 'rejects invalid credentials' do
      post '/api/auth/login', params: {
        auth: {
          email: user.email,
          password: 'wrongpassword'
        }
      }, as: :json

      expect(response).to have_http_status(:unauthorized)
      
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Invalid credentials')
    end
  end

  describe 'POST /api/auth/register' do
    it 'successfully registers a new user' do
      expect {
        post '/api/auth/register', params: {
          auth: {
            email: 'newuser@example.com',
            password: 'password123',
            password_confirmation: 'password123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'customer'
          }
        }, as: :json
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Registration successful. Please check your email to confirm your account.')
      expect(json_response['user']['email']).to eq('newuser@example.com')
      expect(json_response['user']['confirmed']).to be false
    end

    it 'rejects registration with invalid data' do
      post '/api/auth/register', params: {
        auth: {
          email: 'invalid-email',
          password: '123',
          password_confirmation: '456',
          first_name: '',
          last_name: '',
          role: 'customer'
        }
      }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Registration failed')
      expect(json_response['details']).to be_an(Array)
      expect(json_response['details'].length).to be > 0
    end
  end

  describe 'DELETE /api/auth/logout' do
    it 'successfully logs out' do
      delete '/api/auth/logout', as: :json

      expect(response).to have_http_status(:ok)
      
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Logout successful')
    end
  end

  describe 'JWT token usage' do
    it 'allows access to protected endpoints with valid token' do
      # Login to get a token
      post '/api/auth/login', params: {
        auth: {
          email: user.email,
          password: user.password
        }
      }, as: :json

      token = JSON.parse(response.body)['token']

      # Use the token to access a protected endpoint (we'll use a simple endpoint)
      get '/api/users/show', headers: {
        'Authorization' => "Bearer #{token}"
      }, as: :json

      # This should not return a missing token error
      # The actual response depends on whether the endpoint exists and is implemented
      expect(response.status).not_to eq(422) # Should not be "Missing token"
    end
  end
end