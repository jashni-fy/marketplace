class Service < ApplicationRecord
  # Associations
  belongs_to :vendor_profile
  belongs_to :service_category
  # Future associations (will be added in later tasks)
  # has_many :bookings, dependent: :destroy
  # has_many :service_images, dependent: :destroy
  has_many_attached :images

  # Enums
  enum pricing_type: { 
    hourly: 0, 
    package: 1, 
    custom: 2 
  }
  
  enum status: { 
    draft: 0, 
    active: 1, 
    inactive: 2,
    archived: 3
  }

  # Validations
  validates :name, presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, presence: true, length: { minimum: 50, maximum: 2000 }
  validates :base_price, numericality: { greater_than: 0, less_than: 1_000_000 }, allow_nil: true
  validates :pricing_type, presence: true
  validates :status, presence: true
  validates :vendor_profile_id, presence: true
  validates :service_category_id, presence: true

  # Custom validations
  validate :base_price_required_for_non_custom_pricing
  validate :vendor_profile_belongs_to_vendor_user

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :inactive, -> { where(status: :inactive) }
  scope :draft, -> { where(status: :draft) }
  scope :archived, -> { where(status: :archived) }
  scope :by_category, ->(category) { where(service_category: category) }
  scope :by_vendor, ->(vendor_profile) { where(vendor_profile: vendor_profile) }
  scope :by_pricing_type, ->(pricing_type) { where(pricing_type: pricing_type) }
  scope :price_range, ->(min_price, max_price) { where(base_price: min_price..max_price) }
  scope :search_by_name, ->(query) { where('name ILIKE ?', "%#{query}%") if query.present? }
  scope :search_by_description, ->(query) { where('description ILIKE ?', "%#{query}%") if query.present? }
  scope :ordered_by_name, -> { order(:name) }
  scope :ordered_by_price, -> { order(:base_price) }
  scope :ordered_by_created, -> { order(created_at: :desc) }

  # Delegations
  delegate :business_name, :location, :average_rating, :total_reviews, to: :vendor_profile, prefix: :vendor
  delegate :name, to: :service_category, prefix: :category

  # Instance methods
  def active?
    status == 'active'
  end

  def draft?
    status == 'draft'
  end

  def inactive?
    status == 'inactive'
  end

  def archived?
    status == 'archived'
  end

  def hourly_pricing?
    pricing_type == 'hourly'
  end

  def package_pricing?
    pricing_type == 'package'
  end

  def custom_pricing?
    pricing_type == 'custom'
  end

  def formatted_base_price
    return 'Custom Quote' if custom_pricing?
    return "#{base_price}/hour" if hourly_pricing?
    "#{base_price}"
  end

  def can_be_booked?
    active? && vendor_profile.present? && vendor_profile.user.present?
  end

  def bookings_count
    # bookings.count # Will be implemented when bookings are added
    0
  end

  def has_images?
    images.attached?
  end

  def primary_image
    images.first if has_images?
  end

  def display_name
    name
  end

  def short_description(limit = 100)
    return description if description.length <= limit
    "#{description.truncate(limit)}..."
  end

  # Class methods
  def self.featured(limit = 6)
    active.joins(:vendor_profile)
          .where(vendor_profiles: { is_verified: true })
          .order('vendor_profiles.average_rating DESC, services.created_at DESC')
          .limit(limit)
  end

  def self.search(query)
    return all if query.blank?
    
    where(
      'services.name ILIKE ? OR services.description ILIKE ?',
      "%#{query}%", "%#{query}%"
    )
  end

  def self.filter_by_category(category_id)
    return all if category_id.blank?
    where(service_category_id: category_id)
  end

  def self.filter_by_price_range(min_price, max_price)
    return all if min_price.blank? && max_price.blank?
    
    scope = all
    scope = scope.where('base_price >= ?', min_price) if min_price.present?
    scope = scope.where('base_price <= ?', max_price) if max_price.present?
    scope
  end

  def self.available_pricing_types
    pricing_types.keys.map { |key| [key.humanize, key] }
  end

  def self.available_statuses
    statuses.keys.map { |key| [key.humanize, key] }
  end

  private

  def base_price_required_for_non_custom_pricing
    return if custom_pricing?
    return if base_price.present? && base_price > 0
    
    errors.add(:base_price, 'must be present and greater than 0 for non-custom pricing')
  end

  def vendor_profile_belongs_to_vendor_user
    return unless vendor_profile.present?
    
    unless vendor_profile.user&.vendor?
      errors.add(:vendor_profile, 'must belong to a vendor user')
    end
  end
end
