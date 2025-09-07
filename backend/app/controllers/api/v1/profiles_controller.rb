class Api::V1::ProfilesController < ApiController
  before_action :authenticate_user!, except: [:service_categories]
  before_action :set_profile, only: [:show, :update, :destroy]
  before_action :ensure_vendor_role, only: [:me, :create, :update, :destroy]
  before_action :ensure_own_profile, only: [:update, :destroy]

  def show
    if params[:id]
      @profile = VendorProfile.find(params[:id])
      render json: profile_response(@profile)
    else
      render json: { error: 'Profile not found' }, status: :not_found
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor profile not found' }, status: :not_found
  end

  def me
    if current_user.vendor_profile
      render json: profile_response(current_user.vendor_profile)
    else
      render json: { error: 'No profile found' }, status: :not_found
    end
  end

  def create
    if current_user.vendor_profile.present?
      render json: { error: 'Profile already exists' }, status: :unprocessable_entity
      return
    end

    @profile = VendorProfile.new(profile_params)
    @profile.user = current_user

    if @profile.save
      render json: profile_response(@profile), status: :created
    else
      render json: {
        error: 'Profile creation failed',
        details: @profile.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    if @profile.update(profile_params)
      render json: profile_response(@profile)
    else
      render json: {
        error: 'Profile update failed',
        details: @profile.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @profile.destroy
    head :no_content
  end

  def service_categories
    categories = ServiceCategory.where(active: true)
    render json: { 
      service_categories: categories.map { |cat| { id: cat.id, name: cat.name, description: cat.description } }
    }
  end

  private

  def set_profile
    if params[:id]
      @profile = VendorProfile.find(params[:id])
    else
      @profile = current_user.vendor_profile
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor profile not found' }, status: :not_found
  end

  def ensure_vendor_role
    unless current_user.vendor?
      render json: { error: 'Access denied. Vendor role required.' }, status: :forbidden
    end
  end

  def ensure_own_profile
    unless @profile.user == current_user
      render json: { error: 'Access denied. You can only manage your own profile.' }, status: :forbidden
    end
  end

  def profile_params
    params.require(:vendor_profile).permit(:business_name, :description, :location, :phone, :website, :years_experience, service_categories_list: [])
  end

  def profile_response(profile)
    {
      id: profile.id,
      user_id: profile.user_id,
      business_name: profile.business_name,
      description: profile.description,
      location: profile.location,
      phone: profile.phone,
      website: profile.website,
      years_experience: profile.years_experience,
      service_categories: profile.service_categories_list || [],
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }
  end
end