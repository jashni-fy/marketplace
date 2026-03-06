# frozen_string_literal: true

class Api::BookingsController < ApiController
  include BookingManagement::BookingActions

  before_action :authenticate_user!
  before_action :ensure_vendor!
  before_action :set_booking, only: %i[show update destroy respond messages send_message]

  def show
    super
  end

  def update
    super
  end

  def destroy
    super
  end

  def respond
    super
  end

  def messages
    super
  end

  def send_message
    super
  end

  private

  def ensure_vendor!
    return if current_user.vendor?

    render json: { error: 'Access denied. Vendor account required.' }, status: :forbidden
  end
end
