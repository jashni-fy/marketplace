class Api::AuthController < ApiController
  before_action :validate_auth_params, only: [:login, :register]

  def login
    return render_missing_params_error unless auth_params[:email].present? && auth_params[:password].present?
    
    user = User.find_by(email: auth_params[:email])
    
    if user&.valid_password?(auth_params[:password])
      if user.confirmed?
        token = generate_jwt_token(user)
        render json: {
          message: 'Login successful',
          token: token,
          user: user_response(user)
        }, status: :ok
      else
        render json: { error: 'Please confirm your email address before logging in' }, status: :unauthorized
      end
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def register
    user = User.new(auth_params)
    
    if user.save
      render json: {
        message: 'Registration successful. Please check your email to confirm your account.',
        user: user_response(user)
      }, status: :created
    else
      render json: {
        error: 'Registration failed',
        details: user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def logout
    # JWT tokens are stateless, so logout is handled client-side
    render json: { message: 'Logout successful' }, status: :ok
  end

  private

  def validate_auth_params
    return if params[:auth].present?
    render json: { error: 'Authentication parameters are required' }, status: :bad_request
  end

  def render_missing_params_error
    render json: { error: 'Email and password are required' }, status: :bad_request
  end

  def auth_params
    permitted_params = params.require(:auth).permit(:email, :password, :password_confirmation, :first_name, :last_name, :role)
    permitted_params
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

  def generate_jwt_token(user)
    JwtService.encode(user_id: user.id, email: user.email, role: user.role)
  end
end