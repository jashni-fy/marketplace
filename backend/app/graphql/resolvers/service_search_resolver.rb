module Resolvers
  class ServiceSearchResolver < Resolvers::BaseResolver
    type Types::ServiceSearchResultType, null: false
    
    argument :query, String, required: false, description: "Search query string"
    argument :filters, Types::ServiceFiltersInput, required: false, description: "Service filters"
    argument :location, Types::LocationInput, required: false, description: "Location-based filtering"
    argument :pagination, Types::PaginationInput, required: false, description: "Pagination options"
    
    def resolve(query: nil, filters: {}, location: {}, pagination: {})
      start_time = Time.current
      
      # Validate pagination
      pagination = validate_pagination(pagination)
      
      # Build the base query
      services = build_base_query(query)
      
      # Apply filters
      services = apply_filters(services, filters)
      services = apply_location_filter(services, location)
      
      # Apply sorting
      services = apply_sorting(services, pagination)
      
      # Get total count before pagination
      total_count = services.count
      
      # Apply pagination
      services = apply_pagination(services, pagination)
      
      # Calculate pagination metadata
      total_pages = (total_count.to_f / pagination[:per_page]).ceil
      current_page = pagination[:page]
      
      # Generate facets
      facets = generate_facets(query, filters, location)
      
      # Calculate search time
      search_time = Time.current - start_time
      
      {
        services: services.includes(:vendor_profile, :service_category, :service_images),
        total_count: total_count,
        current_page: current_page,
        per_page: pagination[:per_page],
        total_pages: total_pages,
        facets: facets,
        search_time: search_time
      }
    end
    
    private
    
    def validate_pagination(pagination)
      {
        page: [pagination[:page] || 1, 1].max,
        per_page: [[pagination[:per_page] || 20, 100].min, 1].max,
        sort_by: pagination[:sort_by] || 'created_at',
        sort_order: %w[asc desc].include?(pagination[:sort_order]) ? pagination[:sort_order] : 'desc'
      }
    end
    
    def build_base_query(query)
      services = Service.active.joins(:vendor_profile, :service_category)
      
      if query.present?
        services = services.where(
          'services.name ILIKE ? OR services.description ILIKE ? OR vendor_profiles.business_name ILIKE ?',
          "%#{query}%", "%#{query}%", "%#{query}%"
        )
      end
      
      services
    end
    
    def apply_filters(services, filters)
      return services if filters.blank?
      
      # Category filter
      if filters[:categories].present?
        services = services.where(service_category_id: filters[:categories])
      end
      
      # Price range filter
      if filters[:price_min].present?
        services = services.where('services.base_price >= ?', filters[:price_min])
      end
      
      if filters[:price_max].present?
        services = services.where('services.base_price <= ?', filters[:price_max])
      end
      
      # Pricing type filter
      if filters[:pricing_type].present?
        services = services.where(pricing_type: filters[:pricing_type])
      end
      
      # Vendor rating filter
      if filters[:vendor_rating].present?
        services = services.where('vendor_profiles.average_rating >= ?', filters[:vendor_rating])
      end
      
      # Verified vendors only
      if filters[:verified_vendors_only]
        services = services.where('vendor_profiles.is_verified = ?', true)
      end
      
      # Status filter
      if filters[:status].present?
        services = services.where(status: filters[:status])
      end
      
      services
    end
    
    def apply_location_filter(services, location)
      return services if location.blank?
      
      # Geospatial filtering with latitude/longitude and radius
      if location[:latitude].present? && location[:longitude].present? && location[:radius].present?
        services = services.joins(:vendor_profile)
          .where('vendor_profiles.latitude IS NOT NULL AND vendor_profiles.longitude IS NOT NULL')
        
        # Use Haversine formula for distance calculation (simpler than PostGIS)
        # This is a basic implementation - for production, consider using PostGIS
        lat = location[:latitude]
        lng = location[:longitude]
        radius_km = location[:radius]
        
        services = services.where(
          "6371 * acos(cos(radians(?)) * cos(radians(vendor_profiles.latitude)) * cos(radians(vendor_profiles.longitude) - radians(?)) + sin(radians(?)) * sin(radians(vendor_profiles.latitude))) <= ?",
          lat, lng, lat, radius_km
        )
      end
      
      # Text-based location filtering
      if location[:city].present?
        services = services.where('vendor_profiles.location ILIKE ?', "%#{location[:city]}%")
      end
      
      if location[:state].present?
        services = services.where('vendor_profiles.location ILIKE ?', "%#{location[:state]}%")
      end
      
      if location[:country].present?
        services = services.where('vendor_profiles.location ILIKE ?', "%#{location[:country]}%")
      end
      
      if location[:address].present?
        services = services.where('vendor_profiles.location ILIKE ?', "%#{location[:address]}%")
      end
      
      services
    end
    
    def apply_sorting(services, pagination)
      case pagination[:sort_by]
      when 'name'
        services.order("services.name #{pagination[:sort_order]}")
      when 'price'
        services.order("services.base_price #{pagination[:sort_order]} NULLS LAST")
      when 'rating'
        services.order("vendor_profiles.average_rating #{pagination[:sort_order]}")
      when 'created_at'
        services.order("services.created_at #{pagination[:sort_order]}")
      else
        services.order("services.created_at #{pagination[:sort_order]}")
      end
    end
    
    def apply_pagination(services, pagination)
      offset = (pagination[:page] - 1) * pagination[:per_page]
      services.limit(pagination[:per_page]).offset(offset)
    end
    
    def generate_facets(query, filters, location)
      # Build base query for facet generation (without pagination)
      base_services = build_base_query(query)
      base_services = apply_location_filter(base_services, location)
      
      {
        categories: generate_category_facets(base_services, filters),
        price_ranges: generate_price_range_facets(base_services, filters),
        locations: generate_location_facets(base_services, filters),
        pricing_types: generate_pricing_type_facets(base_services, filters),
        vendor_ratings: generate_rating_facets(base_services, filters)
      }
    end
    
    def generate_category_facets(services, filters)
      # Exclude category filter for facet generation
      facet_services = services
      if filters[:price_min].present? || filters[:price_max].present?
        facet_services = apply_price_filter(facet_services, filters)
      end
      
      facet_services
        .joins(:service_category)
        .group('service_categories.id', 'service_categories.name', 'service_categories.slug')
        .count
        .map do |(id, name, slug), count|
          {
            id: id,
            name: name,
            slug: slug,
            count: count
          }
        end
    end
    
    def generate_price_range_facets(services, filters)
      price_ranges = [
        { min: 0, max: 100, label: 'Under $100' },
        { min: 100, max: 500, label: '$100 - $500' },
        { min: 500, max: 1000, label: '$500 - $1,000' },
        { min: 1000, max: 5000, label: '$1,000 - $5,000' },
        { min: 5000, max: Float::INFINITY, label: 'Over $5,000' }
      ]
      
      # Exclude price filters for facet generation
      facet_services = services
      if filters[:categories].present?
        facet_services = facet_services.where(service_category_id: filters[:categories])
      end
      
      price_ranges.map do |range|
        count = facet_services
          .where('services.base_price >= ? AND services.base_price < ?', range[:min], range[:max])
          .count
          
        {
          min_price: range[:min],
          max_price: range[:max] == Float::INFINITY ? nil : range[:max],
          label: range[:label],
          count: count
        }
      end.select { |facet| facet[:count] > 0 }
    end
    
    def generate_location_facets(services, filters)
      services
        .joins(:vendor_profile)
        .group('vendor_profiles.location')
        .count
        .map do |location, count|
          {
            location: location,
            count: count
          }
        end
        .sort_by { |facet| -facet[:count] }
        .first(20) # Limit to top 20 locations
    end
    
    def generate_pricing_type_facets(services, filters)
      Service.pricing_types.map do |pricing_type, _|
        count = services.where(pricing_type: pricing_type).count
        
        {
          pricing_type: pricing_type,
          label: pricing_type.humanize,
          count: count
        }
      end.select { |facet| facet[:count] > 0 }
    end
    
    def generate_rating_facets(services, filters)
      rating_ranges = [
        { min: 4.5, max: 5.0, label: '4.5+ stars' },
        { min: 4.0, max: 4.5, label: '4.0 - 4.5 stars' },
        { min: 3.5, max: 4.0, label: '3.5 - 4.0 stars' },
        { min: 3.0, max: 3.5, label: '3.0 - 3.5 stars' },
        { min: 0.0, max: 3.0, label: 'Under 3.0 stars' }
      ]
      
      rating_ranges.map do |range|
        count = services
          .joins(:vendor_profile)
          .where('vendor_profiles.average_rating >= ? AND vendor_profiles.average_rating < ?', range[:min], range[:max])
          .count
          
        {
          min_rating: range[:min],
          max_rating: range[:max],
          label: range[:label],
          count: count
        }
      end.select { |facet| facet[:count] > 0 }
    end
    
    def apply_price_filter(services, filters)
      services = services.where('services.base_price >= ?', filters[:price_min]) if filters[:price_min].present?
      services = services.where('services.base_price <= ?', filters[:price_max]) if filters[:price_max].present?
      services
    end
  end
end