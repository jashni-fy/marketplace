class Api::V1::ProfilesController < ApiController
  skip_before_action :authenticate_request, only: [:service_categories]
  before_action :ensure_vendor_role, except: [:show, :service_categories]
  before_action :set_vendor_profile, only: [:show, :update, :destroy]
  before_action :ensure_profile_ownership, only: [:update, :destroy]

  # GET /api/v1/profiles/:id
  def show
    render json: profile_response(@vendor_profile), status: :ok
  end

  # POST /api/v1/profiles
  def create
    if current_user.vendor_profile.present?
      return render json: { 
        error: 'Profile already exists', 
        details: ['Vendor profile already exists for this user'] 
      }, status: :unprocessable_content
    end

    @vendor_profile = current_user.build_vendor_profile(vendor_profile_params)

    if @vendor_profile.save
      render json: profile_response(@vendor_profile), status: :created
    else
      render json: { 
        error: 'Profile creation failed', 
        details: @vendor_profile.errors.full_messages 
      }, status: :unprocessable_content
    end
  end

  # PUT/PATCH /api/v1/profiles/:id
  def update
    if @vendor_profile.update(vendor_profile_params)
      render json: profile_response(@vendor_profile), status: :ok
    else
      render json: { 
        error: 'Profile update failed', 
        details: @vendor_profile.errors.full_messages 
      }, status: :unprocessable_content
    end
  end

  # DELETE /api/v1/profiles/:id
  def destroy
    @vendor_profile.destroy
    head :no_content
  end

  # GET /api/v1/profiles/me
  def me
    vendor_profile = current_user.vendor_profile
    
    if vendor_profile
      render json: profile_response(vendor_profile), status: :ok
    else
      render json: { error: 'Vendor profile not found' }, status: :not_found
    end
  end

  # GET /api/v1/profiles/service_categories
  def service_categories
    categories = ServiceCategory.active.ordered.map do |category|
      {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      }
    end

    render json: { service_categories: categories }, status: :ok
  end

  private

  def set_vendor_profile
    @vendor_profile = VendorProfile.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor profile not found' }, status: :not_found
  end

  def ensure_vendor_role
    unless current_user.vendor?
      render json: { error: 'Access denied. Vendor role required.' }, status: :forbidden
    end
  end

  def ensure_profile_ownership
    unless @vendor_profile.user == current_user
      render json: { error: 'Access denied. You can only manage your own profile.' }, status: :forbidden
    end
  end

  def vendor_profile_params
    params.require(:vendor_profile).permit(
      :business_name,
      :description,
      :location,
      :phone,
      :website,
      :business_license,
      :years_experience,
      service_categories_list: []
    )
  end

  def profile_response(vendor_profile)
    {
      id: vendor_profile.id,
      user_id: vendor_profile.user_id,
      business_name: vendor_profile.business_name,
      description: vendor_profile.description,
      location: vendor_profile.location,
      phone: vendor_profile.phone,
      website: vendor_profile.website,
      service_categories: vendor_profile.service_categories_list,
      business_license: vendor_profile.business_license,
      years_experience: vendor_profile.years_experience,
      is_verified: vendor_profile.is_verified,
      average_rating: vendor_profile.average_rating,
      total_reviews: vendor_profile.total_reviews,
      profile_complete: vendor_profile.profile_complete?,
      created_at: vendor_profile.created_at,
      updated_at: vendor_profile.updated_at
    }
  end
end