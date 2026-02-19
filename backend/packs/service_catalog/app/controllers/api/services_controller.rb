class Api::ServicesController < ApiController
  before_action :authenticate_user!, except: [:index, :show, :search]
  before_action :set_service, only: [:show, :update, :destroy]
  before_action :ensure_vendor, only: [:create, :update, :destroy]
  before_action :ensure_service_owner, only: [:update, :destroy]

  def index
    search_params = {
      vendor_id: params[:vendor_id],
      category_id: params[:category_id],
      page: params[:page] || 1,
      per_page: params[:per_page] || 20,
      sort_by: params[:sort_by] || 'created_at',
      sort_direction: params[:sort_direction] || 'desc'
    }

    result = ServiceSearchService.call(search_params)
    
    render json: {
      services: result[:services].map { |service| service_response(service) },
      pagination: result[:pagination],
      filters: result[:filters]
    }
  end

  def show
    render json: service_response(@service, include_details: true)
  end

  def search
    search_params = {
      query: params[:q] || params[:query],
      location: params[:location],
      category_id: params[:category_id],
      min_price: params[:min_price],
      max_price: params[:max_price],
      pricing_type: params[:pricing_type],
      vendor_id: params[:vendor_id],
      page: params[:page] || 1,
      per_page: params[:per_page] || 20,
      sort_by: params[:sort_by] || 'created_at',
      sort_direction: params[:sort_direction] || 'desc'
    }

    result = ServiceSearchService.call(search_params)
    
    render json: {
      services: result[:services].map { |service| service_response(service) },
      pagination: result[:pagination],
      filters: result[:filters],
      total_count: result[:total_count]
    }
  end

  def create
    @service = current_user.vendor_profile.services.build(service_params)

    if @service.save
      render json: {
        message: 'Service created successfully',
        service: service_response(@service, include_details: true)
      }, status: :created
    else
      render json: {
        error: 'Service creation failed',
        details: @service.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    if @service.update(service_params)
      render json: {
        message: 'Service updated successfully',
        service: service_response(@service, include_details: true)
      }
    else
      render json: {
        error: 'Service update failed',
        details: @service.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @service.destroy
    render json: { message: 'Service deleted successfully' }
  end

  private

  def set_service
    @service = Service.find(params[:id])
  end

  def ensure_service_owner
    unless @service.vendor_profile.user == current_user
      render json: { error: 'You can only manage your own services' }, status: :forbidden
    end
  end

  def ensure_vendor
    unless current_user&.role == 'vendor'
      render json: { error: 'Only vendors can manage services' }, status: :forbidden
    end
  end

  def service_params
    params.require(:service).permit(:name, :description, :base_price, :pricing_type, :service_category_id, :status)
  end

  def service_response(service, include_details: false)
    response = {
      id: service.id,
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      pricing_type: service.pricing_type,
      formatted_price: service.formatted_base_price,
      status: service.status,
      vendor: {
        id: service.vendor_profile.id,
        business_name: service.vendor_profile.business_name,
        location: service.vendor_profile.location
      },
      category: service.service_category ? {
        id: service.service_category.id,
        name: service.service_category.name
      } : nil,
      images: service.service_images.map { |img| 
        {
          id: img.id,
          url: img.image.attached? ? url_for(img.image) : nil,
          is_primary: img.is_primary
        }
      },
      created_at: service.created_at,
      updated_at: service.updated_at
    }

    if include_details
      response[:vendor][:description] = service.vendor_profile.description
      response[:vendor][:years_experience] = service.vendor_profile.years_experience
      response[:vendor][:website] = service.vendor_profile.website
      response[:bookings_count] = service.bookings_count
      response[:can_be_booked] = service.can_be_booked?
    end

    response
  end
end