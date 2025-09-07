class Api::VendorsController < ApiController
  # Public endpoints don't require authentication
  before_action :set_vendor_profile, only: [:show, :services, :availability, :portfolio, :reviews]

  def index
    @vendors = VendorProfile.includes(:user, :services)
    
    # Apply filters
    @vendors = @vendors.by_location(params[:location]) if params[:location].present?
    @vendors = @vendors.with_rating_above(params[:min_rating].to_f) if params[:min_rating].present?
    @vendors = @vendors.by_experience(params[:min_experience].to_i) if params[:min_experience].present?
    @vendors = @vendors.verified if params[:verified] == 'true'
    
    # Location-based search
    if params[:latitude].present? && params[:longitude].present?
      radius = params[:radius]&.to_f || 50 # Default 50km radius
      @vendors = @vendors.within_radius(params[:latitude].to_f, params[:longitude].to_f, radius)
    end
    
    # Pagination
    page = params[:page]&.to_i || 1
    per_page = [params[:per_page]&.to_i || 20, 50].min # Max 50 per page
    
    @vendors = @vendors.offset((page - 1) * per_page).limit(per_page)
    
    render json: {
      vendors: @vendors.map { |vendor| vendor_summary_json(vendor) },
      pagination: {
        current_page: page,
        per_page: per_page,
        total_count: @vendors.count
      }
    }
  end

  def show
    render json: { vendor: vendor_detail_json(@vendor_profile) }
  end

  def services
    services = @vendor_profile.services.active.includes(:service_category, :service_images)
    
    render json: {
      services: services.map { |service| service_json(service) }
    }
  end

  def availability
    # Get availability for the next 30 days by default
    start_date = params[:start_date]&.to_date || Date.current
    end_date = params[:end_date]&.to_date || start_date + 30.days
    
    availability_slots = @vendor_profile.availability_slots
                                       .where(date: start_date..end_date)
                                       .where(is_available: true)
                                       .order(:date, :start_time)
    
    render json: {
      availability: availability_slots.map { |slot| availability_slot_json(slot) },
      date_range: {
        start_date: start_date,
        end_date: end_date
      }
    }
  end

  def portfolio
    portfolio_items = @vendor_profile.portfolio_items.ordered
    portfolio_items = portfolio_items.by_category(params[:category]) if params[:category].present?
    portfolio_items = portfolio_items.featured if params[:featured] == 'true'
    
    render json: {
      portfolio_items: portfolio_items.map { |item| portfolio_item_json(item) },
      categories: @vendor_profile.portfolio_categories
    }
  end

  def reviews
    # This will be implemented in a later task when reviews are added
    render json: {
      reviews: [],
      average_rating: @vendor_profile.average_rating,
      total_reviews: @vendor_profile.total_reviews
    }
  end

  private

  def set_vendor_profile
    @vendor_profile = VendorProfile.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor not found' }, status: :not_found
  end

  def vendor_summary_json(vendor)
    {
      id: vendor.id,
      business_name: vendor.business_name,
      location: vendor.location,
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      years_experience: vendor.years_experience,
      is_verified: vendor.is_verified,
      service_categories: vendor.service_categories_list,
      featured_portfolio: vendor.featured_portfolio_items.limit(3).map { |item| portfolio_item_json(item) }
    }
  end

  def vendor_detail_json(vendor)
    {
      id: vendor.id,
      business_name: vendor.business_name,
      description: vendor.description,
      location: vendor.location,
      phone: vendor.phone,
      website: vendor.website,
      years_experience: vendor.years_experience,
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      is_verified: vendor.is_verified,
      service_categories: vendor.service_categories_list,
      coordinates: vendor.coordinates,
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    }
  end

  def service_json(service)
    {
      id: service.id,
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      pricing_type: service.pricing_type,
      category: service.service_category.name,
      images: service.service_images.limit(3).map { |img| image_json(img) }
    }
  end

  def portfolio_item_json(item)
    {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      is_featured: item.is_featured,
      images: item.images.attached? ? item.images.limit(1).map { |image| image_json(image) } : []
    }
  end

  def availability_slot_json(slot)
    {
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available
    }
  end

  def image_json(image)
    {
      id: image.id,
      filename: image.filename.to_s,
      url: url_for(image),
      thumbnail_url: url_for(image.variant(resize_to_limit: [300, 300]))
    }
  end
end