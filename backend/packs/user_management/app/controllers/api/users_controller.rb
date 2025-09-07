class Api::UsersController < ApiController
  before_action :authenticate_user!
  before_action :set_user, only: [:show, :update, :upload_avatar]

  def show
    render json: user_response(@user)
  end

  def update
    if @user.update(user_params)
      render json: {
        message: 'Profile updated successfully',
        user: user_response(@user)
      }
    else
      render json: {
        error: 'Update failed',
        details: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def upload_avatar
    if params[:avatar].present?
      @user.avatar.attach(params[:avatar])
      render json: {
        message: 'Avatar uploaded successfully',
        avatar_url: @user.avatar.attached? ? url_for(@user.avatar) : nil
      }
    else
      render json: { error: 'No avatar file provided' }, status: :bad_request
    end
  end

  private

  def set_user
    @user = current_user
  end

  def user_params
    params.require(:user).permit(:first_name, :last_name, :phone, :bio)
  end

  def user_response(user)
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      bio: user.bio,
      role: user.role,
      confirmed: user.confirmed?,
      avatar_url: user.avatar.attached? ? url_for(user.avatar) : nil,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  end
end