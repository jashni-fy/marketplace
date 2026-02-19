class ServiceSearchService
  include ActiveModel::Model
  include ActiveModel::Attributes
  include Callable

  # Search parameters
  attribute :query, :string
  attribute :category_id, :integer
  attribute :location, :string
  attribute :min_price, :decimal
  attribute :max_price, :decimal
  attribute :pricing_type, :string
  attribute :vendor_id, :integer
  attribute :page, :integer, default: 1
  attribute :per_page, :integer, default: 20
  attribute :sort_by, :string, default: 'created_at'
  attribute :sort_direction, :string, default: 'desc'

  # Constants
  MAX_PER_PAGE = 100
  VALID_SORT_FIELDS = %w[name base_price created_at updated_at].freeze
  VALID_SORT_DIRECTIONS = %w[asc desc].freeze

  def initialize(params = {})
    super(params)
    normalize_attributes
  end

  def call
    {
      services: paginated_services,
      pagination: pagination_info,
      filters: applied_filters,
      total_count: total_count
    }
  end

  private

  def base_scope
    Service.includes(:vendor_profile, :service_category, :service_images)
           .active
           .joins(vendor_profile: :user)
           .where(users: { role: 'vendor' })
  end

  def filtered_services
    scope = base_scope

    # Text search
    if query.present?
      scope = scope.where(
        'services.name ILIKE ? OR services.description ILIKE ? OR vendor_profiles.business_name ILIKE ?',
        "%#{query}%", "%#{query}%", "%#{query}%"
      )
    end

    # Category filter
    if category_id.present?
      scope = scope.where(service_category_id: category_id)
    end

    # Location filter
    if location.present?
      scope = scope.where('vendor_profiles.location ILIKE ?', "%#{location}%")
    end

    # Price range filter
    if min_price.present?
      scope = scope.where('services.base_price >= ?', min_price)
    end

    if max_price.present?
      scope = scope.where('services.base_price <= ?', max_price)
    end

    # Pricing type filter
    if pricing_type.present? && Service.pricing_types.key?(pricing_type)
      scope = scope.where(pricing_type: pricing_type)
    end

    # Vendor filter
    if vendor_id.present?
      scope = scope.where(vendor_profile_id: vendor_id)
    end

    scope
  end

  def sorted_services
    return filtered_services unless VALID_SORT_FIELDS.include?(sort_by)

    case sort_by
    when 'name'
      filtered_services.order("services.name #{sort_direction}")
    when 'base_price'
      # Handle custom pricing by putting them at the end
      filtered_services.order(
        Arel.sql("CASE WHEN services.pricing_type = #{Service.pricing_types['custom']} THEN 1 ELSE 0 END"),
        "services.base_price #{sort_direction}"
      )
    when 'created_at'
      filtered_services.order("services.created_at #{sort_direction}")
    when 'updated_at'
      filtered_services.order("services.updated_at #{sort_direction}")
    else
      filtered_services.order("services.created_at #{sort_direction}")
    end
  end

  def paginated_services
    sorted_services.limit(per_page).offset((page - 1) * per_page)
  end

  def total_count
    @total_count ||= filtered_services.count
  end

  def pagination_info
    {
      current_page: page,
      per_page: per_page,
      total_pages: (total_count.to_f / per_page).ceil,
      total_count: total_count,
      has_next_page: page < (total_count.to_f / per_page).ceil,
      has_prev_page: page > 1
    }
  end

  def applied_filters
    filters = {}
    filters[:query] = query if query.present?
    filters[:category_id] = category_id if category_id.present?
    filters[:location] = location if location.present?
    filters[:min_price] = min_price if min_price.present?
    filters[:max_price] = max_price if max_price.present?
    filters[:pricing_type] = pricing_type if pricing_type.present?
    filters[:vendor_id] = vendor_id if vendor_id.present?
    filters
  end

  def normalize_attributes
    # Ensure page is at least 1
    self.page = [page.to_i, 1].max

    # Limit per_page to maximum allowed
    self.per_page = [[per_page.to_i, 1].max, MAX_PER_PAGE].min

    # Validate sort direction
    self.sort_direction = 'desc' unless VALID_SORT_DIRECTIONS.include?(sort_direction)

    # Validate sort field
    self.sort_by = 'created_at' unless VALID_SORT_FIELDS.include?(sort_by)

    # Clean up string parameters
    self.query = query&.strip
    self.location = location&.strip
    self.pricing_type = pricing_type&.strip
  end
end