class Api::AnalyticsController < ApiController
  before_action :authenticate_user!
  before_action :ensure_vendor

  def dashboard
    render json: VendorAnalyticsService.call(current_user.vendor_profile)
  end

  private

  def ensure_vendor
    unless current_user&.vendor? && current_user.vendor_profile
      render json: { error: 'Only vendors with profiles can access analytics' }, status: :forbidden
    end
  end
end
