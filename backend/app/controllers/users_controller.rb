# frozen_string_literal: true

class UsersController < ApiController
  before_action :authenticate_user!
  before_action :set_user, only: %i[show update upload_avatar]

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
      }, status: :unprocessable_content
    end
  end

  def upload_avatar
    render json: { error: 'Avatar upload not yet implemented' }, status: :not_implemented
  end

  private

  def set_user
    @user = current_user
  end

  def user_params
    params.expect(user: %i[first_name last_name])
  end

  def user_response(user)
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      confirmed: user.confirmed?,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  end
end
