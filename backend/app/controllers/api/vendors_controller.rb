class Api::VendorsController < ApiController
  # Public endpoints don't require authentication
  before_action :set_vendor_profile, only: [:show, :services, :availability, :portfolio, :reviews]

  # GET /api/vendors
  def index
    @vendors = VendorProfile.includes(:user, :services)
                           .joins(:user)
                           .where.not(users: { confirmed_at: nil })

    # Apply filters
    if params[:location].present?
      @vendors = @vendors.where('location ILIKE ?', "%#{params[:location]}%")
    end

    if params[:service_category].present?
      # Simplified approach - filter by service category name in service_categories text field
      # This is a temporary solution until the complex join issue is resolved
      @vendors = @vendors.where('service_categories ILIKE ?', "%#{params[:service_category]}%")
    end

    # Apply pagination
    page = params[:page]&.to_i || 1
    per_page = [params[:per_page]&.to_i || 20, 100].min
    
    total_count = @vendors.count
    total_pages = (total_count.to_f / per_page).ceil
    offset = (page - 1) * per_page
    
    @vendors = @vendors.limit(per_page).offset(offset)

    render json: {
      vendors: @vendors.map { |vendor| vendor_response(vendor) },
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_count: total_count,
        per_page: per_page
      }
    }
  end

  # GET /api/vendors/:id
  def show
    render json: { vendor: detailed_vendor_response(@vendor_profile) }
  end

  # GET /api/vendors/:id/services
  def services
    @services = @vendor_profile.services.active.includes(:service_category)

    render json: {
      services: @services.map { |service| service_response(service) }
    }
  end

  # GET /api/vendors/:id/availability
  def availability
    start_date = params[:start_date]&.to_date || Date.current
    end_date = params[:end_date]&.to_date || 1.month.from_now.to_date

    @availability_slots = @vendor_profile.availability_slots
                                        .where(date: start_date..end_date)
                                        .where(is_available: true)
                                        .order(:date, :start_time)

    render json: {
      availability_slots: @availability_slots.map { |slot| availability_slot_response(slot) }
    }
  end

  # GET /api/vendors/:id/portfolio
  def portfolio
    @portfolio_items = @vendor_profile.portfolio_items.includes(images_attachments: :blob).ordered

    # Filter by category if specified
    if params[:category].present?
      @portfolio_items = @portfolio_items.by_category(params[:category])
    end

    # Filter featured items if specified
    if params[:featured] == 'true'
      @portfolio_items = @portfolio_items.featured
    end

    render json: {
      portfolio_items: @portfolio_items.map { |item| portfolio_item_response(item) },
      categories: @vendor_profile.portfolio_items.categories_for_vendor(@vendor_profile),
      total_count: @portfolio_items.count
    }
  end

  # GET /api/vendors/:id/reviews
  def reviews
    # For now, return placeholder data since reviews aren't implemented yet
    # This will be updated when the review system is implemented
    render json: {
      reviews: [],
      average_rating: @vendor_profile.average_rating,
      total_reviews: @vendor_profile.total_reviews,
      rating_breakdown: {
        5 => 0,
        4 => 0,
        3 => 0,
        2 => 0,
        1 => 0
      }
    }
  end

  private

  def set_vendor_profile
    @vendor_profile = VendorProfile.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor not found' }, status: :not_found
  end

  def vendor_response(vendor)
    {
      id: vendor.id,
      business_name: vendor.business_name,
      description: vendor.description&.truncate(200),
      location: vendor.location,
      service_categories: vendor.service_categories_list,
      years_experience: vendor.years_experience,
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      is_verified: vendor.is_verified,
      services_count: vendor.services.active.count,
      created_at: vendor.created_at
    }
  end

  def detailed_vendor_response(vendor)
    # Include featured portfolio items in the main vendor response
    featured_portfolio = vendor.portfolio_items.featured.includes(images_attachments: :blob).limit(6)
    
    {
      id: vendor.id,
      business_name: vendor.business_name,
      description: vendor.description,
      location: vendor.location,
      phone: vendor.phone,
      website: vendor.website,
      service_categories: vendor.service_categories_list,
      business_license: vendor.business_license,
      years_experience: vendor.years_experience,
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      is_verified: vendor.is_verified,
      profile_complete: vendor.profile_complete?,
      services_count: vendor.services.active.count,
      portfolio_items_count: vendor.portfolio_items.count,
      featured_portfolio: featured_portfolio.map { |item| portfolio_item_response(item) },
      portfolio_categories: vendor.portfolio_items.categories_for_vendor(vendor),
      coordinates: {
        latitude: vendor.latitude,
        longitude: vendor.longitude
      },
      user: {
        id: vendor.user.id,
        first_name: vendor.user.first_name,
        last_name: vendor.user.last_name,
        email: vendor.user.email
      },
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    }
  end

  def service_response(service)
    {
      id: service.id,
      name: service.name,
      description: service.description&.truncate(200),
      base_price: service.base_price,
      formatted_price: service.formatted_base_price,
      pricing_type: service.pricing_type,
      category: {
        id: service.service_category.id,
        name: service.service_category.name,
        slug: service.service_category.slug
      },
      has_images: service.has_images?,
      primary_image_url: service.primary_service_image&.thumbnail_url,
      created_at: service.created_at
    }
  end

  def availability_slot_response(slot)
    {
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time.strftime('%H:%M'),
      end_time: slot.end_time.strftime('%H:%M'),
      time_range: slot.time_range,
      duration_hours: slot.duration_hours
    }
  end

  def portfolio_item_response(item)
    {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      display_order: item.display_order,
      is_featured: item.is_featured,
      image_count: item.image_count,
      images: item.images.attached? ? item.images.map { |image| image_response(image) } : [],
      primary_image_url: item.primary_image&.url,
      created_at: item.created_at
    }
  end

  def image_response(image)
    {
      id: image.id,
      filename: image.filename.to_s,
      content_type: image.content_type,
      byte_size: image.byte_size,
      url: image.url,
      thumbnail_url: image.variant(resize_to_limit: [300, 300]).url,
      medium_url: image.variant(resize_to_limit: [800, 600]).url
    }
  end
end