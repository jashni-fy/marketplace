class Api::V1::AuthController < ApplicationController
  # Skip authentication for these endpoints
  skip_before_action :authenticate_request, only: [:login, :register, :logout]
  # Skip CSRF protection for API endpoints
  skip_before_action :verify_authenticity_token

  def login
    # Handle missing parameters gracefully
    email = login_params[:email]&.downcase
    password = login_params[:password]
    
    if email.blank? || password.blank?
      render json: {
        error: 'Email and password are required'
      }, status: :bad_request
      return
    end
    
    user = User.find_by(email: email)
    
    if user&.valid_password?(password)
      if user.confirmed?
        token = JwtService.encode(user_id: user.id)
        render json: {
          message: 'Login successful',
          token: token,
          user: user_response(user)
        }, status: :ok
      else
        render json: {
          error: 'Please confirm your email address before logging in'
        }, status: :unauthorized
      end
    else
      render json: {
        error: 'Invalid email or password'
      }, status: :unauthorized
    end
  end

  def register
    user = User.new(register_params)
    
    if user.save
      # Send confirmation email (handled by Devise)
      render json: {
        message: 'Registration successful. Please check your email to confirm your account.',
        user: user_response(user)
      }, status: :created
    else
      render json: {
        error: 'Registration failed',
        details: user.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  def logout
    # For JWT, logout is handled client-side by removing the token
    # In a more sophisticated setup, we might maintain a blacklist of tokens
    render json: {
      message: 'Logout successful'
    }, status: :ok
  end

  private

  def login_params
    params[:auth] || {}
  end

  def register_params
    params.require(:auth).permit(:email, :password, :password_confirmation, :first_name, :last_name, :role)
  end

  def user_response(user)
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      confirmed: user.confirmed?,
      created_at: user.created_at
    }
  end
end