# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::AuthController do
  let(:user) { create(:user, confirmed_at: Time.current) }
  let(:unconfirmed_user) { create(:user, confirmed_at: nil) }

  describe 'POST #login' do
    context 'with valid credentials' do
      let(:valid_params) do
        { auth: { email: user.email, password: user.password } }
      end

      before { post :login, params: valid_params, format: :json }

      it { expect(response).to have_http_status(:ok) }

      it 'returns success message' do
        expect(response.parsed_body['message']).to eq('Login successful')
      end

      it 'returns JWT token' do
        expect(response.parsed_body['token']).to be_present
      end

      it 'returns correct user data' do
        expect(response.parsed_body['user']).to include(
          'id' => user.id, 'email' => user.email, 'confirmed' => true
        )
      end
    end

    context 'with invalid credentials' do
      let(:invalid_params) do
        { auth: { email: user.email, password: 'wrong_password' } }
      end

      it 'returns unauthorized response' do
        post :login, params: invalid_params, format: :json
        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body['error']).to eq('Invalid credentials')
      end
    end

    context 'with unconfirmed user' do
      let(:unconfirmed_params) do
        { auth: { email: unconfirmed_user.email, password: unconfirmed_user.password } }
      end

      it 'returns unauthorized response for unconfirmed user' do
        post :login, params: unconfirmed_params, format: :json
        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body['error']).to eq('Please confirm your email address before logging in')
      end
    end

    context 'with missing parameters' do
      it 'returns bad request when email is missing' do
        post :login, params: { auth: { password: 'password' } }, format: :json
        expect(response).to have_http_status(:bad_request)
      end

      it 'returns error message for missing credentials' do
        post :login, params: { auth: { password: 'password' } }, format: :json
        expect(response.parsed_body['error']).to eq('Email and password are required')
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

      it 'creates a new user' do
        expect do
          post :register, params: valid_params, format: :json
        end.to change(User, :count).by(1)
      end

      it 'returns created status' do
        post :register, params: valid_params, format: :json
        expect(response).to have_http_status(:created)
      end

      it 'returns success message' do
        post :register, params: valid_params, format: :json
        msg = 'Registration successful. Please check your email to confirm your account.'
        expect(response.parsed_body['message']).to eq(msg)
      end

      it 'returns registered user details' do
        post :register, params: valid_params, format: :json
        expect(response.parsed_body['user']).to include(
          'email' => 'newuser@example.com', 'first_name' => 'John',
          'last_name' => 'Doe', 'role' => 'customer', 'confirmed' => false
        )
      end
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        {
          auth: {
            email: 'invalid_email',
            password: 'short',
            password_confirmation: 'different'
          }
        }
      end

      before { post :register, params: invalid_params, format: :json }

      it { expect(response).to have_http_status(:unprocessable_content) }

      it 'returns registration failure message' do
        expect(response.parsed_body['error']).to eq('Registration failed')
      end

      it 'returns error details' do
        expect(response.parsed_body['details']).to be_an(Array)
      end
    end
  end

  describe 'DELETE #logout' do
    it 'returns logout success response' do
      delete :logout, format: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['message']).to eq('Logout successful')
    end
  end
end
