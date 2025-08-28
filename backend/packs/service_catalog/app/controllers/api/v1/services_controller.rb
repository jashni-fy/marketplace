class Api::V1::ServicesController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :show, :search]
  before_action :authenticate_request_optional, only: [:index]
  before_action :set_service, only: [:show, :update, :destroy]
  before_action :ensure_vendor_user, only: [:create, :update, :destroy]
  before_action :ensure_service_owner, only: [:update, :destroy]

  # GET /api/v1/services
  def index
    @services = Service.includes(:vendor_profile, :service_category)
    
    # Apply filters
    @services = apply_filters(@services)
    
    # Apply pagination
    page = params[:page]&.to_i || 1
    per_page = [params[:per_page]&.to_i || 20, 100].min # Max 100 per page
    
    @services = @services.page(page).per(per_page)
    
    render json: {
      services: @services.map { |service| service_response(service) },
      pagination: {
        current_page: @services.current_page,
        total_pages: @services.total_pages,
        total_count: @services.total_count,
        per_page: per_page
      }
    }
  end

  # GET /api/v1/services/:id
  def show
    render json: {
      service: detailed_service_response(@service)
    }
  end

  # POST /api/v1/services
  def create
    @service = current_user.vendor_profile.services.build(service_params)
    
    if @service.save
      render json: {
        message: 'Service created successfully',
        service: detailed_service_response(@service)
      }, status: :created
    else
      render json: {
        error: 'Service creation failed',
        details: @service.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # PUT/PATCH /api/v1/services/:id
  def update
    if @service.update(service_params)
      render json: {
        message: 'Service updated successfully',
        service: detailed_service_response(@service)
      }
    else
      render json: {
        error: 'Service update failed',
        details: @service.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/services/:id
  def destroy
    @service.destroy
    render json: {
      message: 'Service deleted successfully'
    }
  end

  # GET /api/v1/services/search
  def search
    query = params[:q]
    
    if query.blank?
      render json: {
        error: 'Search query is required'
      }, status: :bad_request
      return
    end
    
    @services = Service.includes(:vendor_profile, :service_category)
                      .active
                      .search(query)
    
    # Apply additional filters
    @services = apply_filters(@services)
    
    # Apply pagination
    page = params[:page]&.to_i || 1
    per_page = [params[:per_page]&.to_i || 20, 100].min
    
    @services = @services.page(page).per(per_page)
    
    render json: {
      query: query,
      services: @services.map { |service| service_response(service) },
      pagination: {
        current_page: @services.current_page,
        total_pages: @services.total_pages,
        total_count: @services.total_count,
        per_page: per_page
      }
    }
  end

  private

  def authenticate_request_optional
    @current_user = (AuthorizeApiRequest.new(request.headers).call)[:user] rescue nil
  end

  def set_service
    @service = Service.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: 'Service not found'
    }, status: :not_found
  end

  def ensure_vendor_user
    unless current_user&.vendor?
      render json: {
        error: 'Only vendors can manage services'
      }, status: :forbidden
    end
  end

  def ensure_service_owner
    unless @service.vendor_profile == current_user.vendor_profile
      render json: {
        error: 'You can only manage your own services'
      }, status: :forbidden
    end
  end

  def service_params
    params.require(:service).permit(
      :name, :description, :service_category_id, :base_price, 
      :pricing_type, :status, images: []
    )
  end

  def apply_filters(services)
    # Filter by category
    if params[:category_id].present?
      services = services.where(service_category_id: params[:category_id])
    end
    
    # Filter by pricing type
    if params[:pricing_type].present?
      services = services.where(pricing_type: params[:pricing_type])
    end
    
    # Filter by status (only for vendor's own services)
    if params[:status].present? && current_user&.vendor?
      services = services.joins(:vendor_profile).where(vendor_profiles: { user: current_user }, status: params[:status])
    elsif current_user&.vendor?
      # For authenticated vendors without status filter, show all their services
      services = services.joins(:vendor_profile).where(vendor_profiles: { user: current_user })
    else
      # For non-vendors, only show active services
      services = services.active
    end
    
    # Filter by price range
    if params[:min_price].present?
      services = services.where('base_price >= ?', params[:min_price])
    end
    
    if params[:max_price].present?
      services = services.where('base_price <= ?', params[:max_price])
    end
    
    # Filter by vendor (for vendor's own services)
    if params[:vendor_id].present?
      services = services.joins(:vendor_profile).where(vendor_profiles: { id: params[:vendor_id] })
    end
    
    # Sort options
    case params[:sort]
    when 'name'
      services = services.order(:name)
    when 'price_low'
      services = services.order(:base_price)
    when 'price_high'
      services = services.order(base_price: :desc)
    when 'newest'
      services = services.order(created_at: :desc)
    when 'oldest'
      services = services.order(created_at: :asc)
    else
      services = services.order(created_at: :desc)
    end
    
    services
  end

  def service_response(service)
    {
      id: service.id,
      name: service.name,
      description: service.short_description,
      base_price: service.base_price,
      formatted_price: service.formatted_base_price,
      pricing_type: service.pricing_type,
      status: service.status,
      category: {
        id: service.service_category.id,
        name: service.service_category.name,
        slug: service.service_category.slug
      },
      vendor: {
        id: service.vendor_profile.id,
        business_name: service.vendor_profile.business_name,
        location: service.vendor_profile.location,
        average_rating: service.vendor_profile.average_rating,
        total_reviews: service.vendor_profile.total_reviews
      },
      has_images: service.has_images?,
      primary_image_url: service.primary_service_image&.thumbnail_url,
      images_count: service.service_images_count,
      created_at: service.created_at,
      updated_at: service.updated_at
    }
  end

  def detailed_service_response(service)
    {
      id: service.id,
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      formatted_price: service.formatted_base_price,
      pricing_type: service.pricing_type,
      status: service.status,
      category: {
        id: service.service_category.id,
        name: service.service_category.name,
        slug: service.service_category.slug,
        description: service.service_category.description
      },
      vendor: {
        id: service.vendor_profile.id,
        business_name: service.vendor_profile.business_name,
        description: service.vendor_profile.description,
        location: service.vendor_profile.location,
        phone: service.vendor_profile.phone,
        website: service.vendor_profile.website,
        years_experience: service.vendor_profile.years_experience,
        average_rating: service.vendor_profile.average_rating,
        total_reviews: service.vendor_profile.total_reviews,
        is_verified: service.vendor_profile.is_verified
      },
      has_images: service.has_images?,
      images_count: service.service_images_count,
      service_images: service.ordered_service_images.limit(5).map do |img|
        {
          id: img.id,
          thumbnail_url: img.thumbnail_url,
          medium_url: img.medium_url,
          is_primary: img.is_primary,
          alt_text: img.alt_text
        }
      end,
      bookings_count: service.bookings_count,
      can_be_booked: service.can_be_booked?,
      created_at: service.created_at,
      updated_at: service.updated_at
    }
  end
end