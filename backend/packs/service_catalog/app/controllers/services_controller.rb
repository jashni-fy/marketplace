# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class ServicesController < ApiController
  before_action :authenticate_user!, except: %i[index show search]
  before_action :authenticate_user_optional, only: [:index]
  before_action :set_service, only: %i[show update destroy]
  before_action :ensure_vendor_user, only: %i[create update destroy]
  before_action :ensure_service_owner, only: %i[update destroy]

  # GET /services
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

  # GET /services/:id
  def show
    render json: {
      service: detailed_service_response(@service)
    }
  end

  # POST /services
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
      }, status: :unprocessable_content
    end
  end

  # PUT/PATCH /services/:id
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
      }, status: :unprocessable_content
    end
  end

  # DELETE /services/:id
  def destroy
    @service.destroy
    render json: {
      message: 'Service deleted successfully'
    }
  end

  # GET /services/search
  # rubocop:disable Metrics/MethodLength
  def search
    # rubocop:enable Metrics/MethodLength
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

  def authenticate_user_optional
    @current_user = begin
      AuthorizeApiRequest.new(request.headers).call[:user]
    rescue StandardError
      nil
    end
  end

  def set_service
    @service = Service.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: 'Service not found'
    }, status: :not_found
  end

  def ensure_vendor_user
    return if current_user&.vendor?

    render json: {
      error: 'Only vendors can manage services'
    }, status: :forbidden
  end

  def ensure_service_owner
    return if @service.vendor_profile == current_user.vendor_profile

    render json: {
      error: 'You can only manage your own services'
    }, status: :forbidden
  end

  def service_params
    params.require(:service).permit(
      :name, :description, :service_category_id, :base_price,
      :pricing_type, :status, images: []
    )
  end

  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
  def apply_filters(services)
    # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
    # Filter by category
    services = services.where(service_category_id: params[:category_id]) if params[:category_id].present?

    # Filter by pricing type
    services = services.where(pricing_type: params[:pricing_type]) if params[:pricing_type].present?

    # Filter by status (only for vendor's own services)
    services = if params[:status].present? && current_user&.vendor?
                 services.joins(:vendor_profile).where(vendor_profiles: { user: current_user }, status: params[:status])
               elsif current_user&.vendor?
                 # For authenticated vendors without status filter, show all their services
                 services.joins(:vendor_profile).where(vendor_profiles: { user: current_user })
               else
                 # For non-vendors, only show active services
                 services.active
               end

    # Filter by price range
    services = services.where(base_price: (params[:min_price])..) if params[:min_price].present?

    services = services.where(base_price: ..(params[:max_price])) if params[:max_price].present?

    # Filter by vendor (for vendor's own services)
    if params[:vendor_id].present?
      services = services.joins(:vendor_profile).where(vendor_profiles: { id: params[:vendor_id] })
    end

    # Sort options
    case params[:sort]
    when 'name'
      services.order(:name)
    when 'price_low'
      services.order(:base_price)
    when 'price_high'
      services.order(base_price: :desc)
    when 'oldest'
      services.order(created_at: :asc)
    else
      # Default to newest
      services.order(created_at: :desc)
    end
  end

  # rubocop:disable Metrics/MethodLength
  def service_response(service)
    # rubocop:enable Metrics/MethodLength
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
      has_images: service.images?,
      primary_image_url: service.primary_service_image&.thumbnail_url,
      images_count: service.service_images_count,
      created_at: service.created_at,
      updated_at: service.updated_at
    }
  end

  # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
  def detailed_service_response(service)
    # rubocop:enable Metrics/AbcSize, Metrics/MethodLength
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
      has_images: service.images?,
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
# rubocop:enable Metrics/ClassLength
