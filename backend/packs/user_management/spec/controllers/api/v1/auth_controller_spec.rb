require 'rails_helper'

RSpec.describe Api::V1::AuthController, type: :controller do
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
        expect(json_response['user']['role']).to eq(user.role)
        expect(json_response['user']['confirmed']).to be true
      end

      it 'generates a valid JWT token' do
        post :login, params: valid_params, format: :json
        
        json_response = JSON.parse(response.body)
        token = json_response['token']
        
        decoded_token = JwtService.decode(token)
        expect(decoded_token[:user_id]).to eq(user.id)
      end

      it 'handles case insensitive email' do
        params_with_uppercase_email = {
          auth: {
            email: user.email.upcase,
            password: user.password
          }
        }
        
        post :login, params: params_with_uppercase_email, format: :json
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['user']['email']).to eq(user.email)
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

      it 'returns unauthorized status with confirmation message' do
        post :login, params: unconfirmed_params, format: :json
        
        expect(response).to have_http_status(:unauthorized)
        
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Please confirm your email address before logging in')
      end
    end

    context 'with invalid credentials' do
      let(:invalid_params) do
        {
          auth: {
            email: user.email,
            password: 'wrongpassword'
          }
        }
      end

      it 'returns unauthorized status with error message' do
        post :login, params: invalid_params, format: :json
        
        expect(response).to have_http_status(:unauthorized)
        
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq(Message.invalid_credentials)
      end
    end

    context 'with non-existent user' do
      let(:nonexistent_params) do
        {
          auth: {
            email: 'nonexistent@example.com',
            password: 'password123'
          }
        }
      end

      it 'returns unauthorized status with error message' do
        post :login, params: nonexistent_params, format: :json
        
        expect(response).to have_http_status(:unauthorized)
        
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq(Message.invalid_credentials)
      end
    end

    context 'with missing parameters' do
      it 'returns error when email is missing' do
        params = { auth: { password: 'password123' } }
        
        post :login, params: params, format: :json
        
        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Email and password are required')
      end

      it 'returns error when password is missing' do
        params = { auth: { email: 'test@example.com' } }
        
        post :login, params: params, format: :json
        
        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Email and password are required')
      end

      it 'returns error when auth params are completely missing' do
        post :login, params: {}, format: :json
        
        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Email and password are required')
      end
    end
  end

  describe 'POST #register' do
    context 'with valid parameters' do
      let(:valid_register_params) do
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
          post :register, params: valid_register_params, format: :json
        }.to change(User, :count).by(1)
        
        expect(response).to have_http_status(:created)
        
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Registration successful. Please check your email to confirm your account.')
        expect(json_response['user']['email']).to eq('newuser@example.com')
        expect(json_response['user']['role']).to eq('customer')
        expect(json_response['user']['confirmed']).to be false
      end

      it 'creates user with vendor role' do
        vendor_params = valid_register_params.deep_dup
        vendor_params[:auth][:role] = 'vendor'
        
        post :register, params: vendor_params, format: :json
        
        expect(response).to have_http_status(:created)
        
        json_response = JSON.parse(response.body)
        expect(json_response['user']['role']).to eq('vendor')
        
        created_user = User.find(json_response['user']['id'])
        expect(created_user.vendor_profile).to be_present
      end

      it 'creates user with customer role' do
        post :register, params: valid_register_params, format: :json
        
        expect(response).to have_http_status(:created)
        
        json_response = JSON.parse(response.body)
        created_user = User.find(json_response['user']['id'])
        expect(created_user.customer_profile).to be_present
      end

      it 'triggers confirmation email sending' do
        # Test that the confirmation instructions method is called
        expect_any_instance_of(User).to receive(:send_confirmation_instructions)
        
        post :register, params: valid_register_params, format: :json
        
        expect(response).to have_http_status(:created)
      end
    end

    context 'with invalid parameters' do
      it 'returns error for duplicate email' do
        duplicate_params = {
          auth: {
            email: user.email,
            password: 'password123',
            password_confirmation: 'password123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'customer'
          }
        }
        
        post :register, params: duplicate_params, format: :json
        
        expect(response).to have_http_status(:unprocessable_content)
        
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Registration failed')
        expect(json_response['details']).to include('Email has already been taken')
      end

      it 'returns error for password mismatch' do
        mismatch_params = {
          auth: {
            email: 'newuser@example.com',
            password: 'password123',
            password_confirmation: 'differentpassword',
            first_name: 'John',
            last_name: 'Doe',
            role: 'customer'
          }
        }
        
        post :register, params: mismatch_params, format: :json
        
        expect(response).to have_http_status(:unprocessable_content)
        
        json_response = JSON.parse(response.body)
        expect(json_response['details']).to include("Password confirmation doesn't match Password")
      end

      it 'returns error for short password' do
        short_password_params = {
          auth: {
            email: 'newuser@example.com',
            password: '123',
            password_confirmation: '123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'customer'
          }
        }
        
        post :register, params: short_password_params, format: :json
        
        expect(response).to have_http_status(:unprocessable_content)
        
        json_response = JSON.parse(response.body)
        expect(json_response['details']).to include('Password is too short (minimum is 8 characters)')
      end

      it 'returns error for missing required fields' do
        incomplete_params = {
          auth: {
            email: 'newuser@example.com',
            password: 'password123',
            password_confirmation: 'password123'
            # Missing first_name, last_name (role has default value)
          }
        }
        
        post :register, params: incomplete_params, format: :json
        
        expect(response).to have_http_status(:unprocessable_content)
        
        json_response = JSON.parse(response.body)
        expect(json_response['details']).to include("First name can't be blank")
        expect(json_response['details']).to include("Last name can't be blank")
        # Role has a default value, so it won't be blank
      end

      it 'returns error for invalid email format' do
        invalid_email_params = {
          auth: {
            email: 'invalid-email',
            password: 'password123',
            password_confirmation: 'password123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'customer'
          }
        }
        
        post :register, params: invalid_email_params, format: :json
        
        expect(response).to have_http_status(:unprocessable_content)
        
        json_response = JSON.parse(response.body)
        expect(json_response['details']).to include('Email is invalid')
      end
    end
  end

  describe 'DELETE #logout' do
    it 'returns success message' do
      delete :logout, format: :json
      
      expect(response).to have_http_status(:ok)
      
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Logout successful')
    end

    it 'does not require authentication' do
      # Logout should work even without a valid token
      request.headers['Authorization'] = 'Bearer invalid-token'
      
      delete :logout, format: :json
      
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'authentication requirements' do
    it 'skips authentication for login endpoint' do
      # This test ensures login doesn't require authentication
      params = {
        auth: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      }
      
      post :login, params: params, format: :json
      
      # Should return unauthorized due to wrong credentials, not missing token
      expect(response).to have_http_status(:unauthorized)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq(Message.invalid_credentials)
    end

    it 'skips authentication for register endpoint' do
      # This test ensures register doesn't require authentication
      params = {
        auth: {
          email: 'test@example.com',
          password: 'short', # Invalid password
          password_confirmation: 'short',
          first_name: 'Test',
          last_name: 'User',
          role: 'customer'
        }
      }
      
      post :register, params: params, format: :json
      
      # Should return unprocessable_content due to validation errors, not missing token
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end