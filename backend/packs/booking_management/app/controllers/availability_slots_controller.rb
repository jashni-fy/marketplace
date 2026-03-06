# frozen_string_literal: true

class AvailabilitySlotsController < ApiController
  include BookingManagement::AvailabilitySlotActions

  before_action :authenticate_user!
  before_action :ensure_vendor!

  private

  def ensure_vendor!
    return if current_user.vendor?

    render json: { error: 'Access denied. Vendor account required.' }, status: :forbidden
  end
end
