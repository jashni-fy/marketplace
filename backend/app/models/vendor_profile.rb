# == Schema Information
#
# Table name: vendor_profiles
#
#  id                 :bigint           not null, primary key
#  average_rating     :decimal(3, 2)    default(0.0)
#  business_license   :string
#  business_name      :string           not null
#  description        :text
#  is_verified        :boolean          default(FALSE)
#  latitude           :decimal(10, 6)
#  location           :string
#  longitude          :decimal(10, 6)
#  phone              :string
#  service_categories :text
#  total_reviews      :integer          default(0)
#  website            :string
#  years_experience   :integer          default(0)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  user_id            :bigint           not null
#
# Indexes
#
#  index_vendor_profiles_on_business_name  (business_name)
#  index_vendor_profiles_on_coordinates    (latitude,longitude)
#  index_vendor_profiles_on_is_verified    (is_verified)
#  index_vendor_profiles_on_location       (location)
#  index_vendor_profiles_on_user_id        (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class VendorProfile < ApplicationRecord
  belongs_to :user
  
  # Service associations
  has_many :services, dependent: :destroy
  has_many :portfolio_items, dependent: :destroy
  has_many :availability_slots, dependent: :destroy
  has_many :bookings, through: :user, source: :vendor_bookings
  # Future associations (will be added in later tasks)
  # has_many :reviews, through: :services

  # Validations
  validates :user_id, presence: true, uniqueness: true
  validates :business_name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :description, length: { minimum: 50, maximum: 2000 }, allow_blank: true
  validates :location, presence: true, length: { maximum: 255 }
  validates :phone, format: { with: /\A[\+]?[\d\s\-\(\)]{7,15}\z/ }, allow_blank: true
  validate :website_format, if: -> { website.present? }
  validates :years_experience, numericality: { greater_than_or_equal_to: 0, less_than: 100 }
  validates :average_rating, numericality: { greater_than_or_equal_to: 0.0, less_than_or_equal_to: 5.0 }
  validates :total_reviews, numericality: { greater_than_or_equal_to: 0 }
  validates :latitude, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }, allow_nil: true
  validates :longitude, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }, allow_nil: true

  # Scopes
  scope :verified, -> { where(is_verified: true) }
  scope :unverified, -> { where(is_verified: false) }
  scope :by_location, ->(location) { where('location ILIKE ?', "%#{location}%") }
  scope :with_rating_above, ->(rating) { where('average_rating >= ?', rating) }
  scope :by_experience, ->(min_years) { where('years_experience >= ?', min_years) }
  scope :with_coordinates, -> { where.not(latitude: nil, longitude: nil) }
  scope :within_radius, ->(lat, lng, radius_km) {
    where('latitude IS NOT NULL AND longitude IS NOT NULL')
      .where(
        "6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))) <= ?",
        lat, lng, lat, radius_km
      )
  }

  # Instance methods
  def verified?
    is_verified
  end

  def has_description?
    description.present? && description.length >= 50
  end

  def service_categories_list
    return [] if service_categories.blank?
    service_categories.split(',').map(&:strip)
  end

  def service_categories_list=(categories)
    self.service_categories = categories.is_a?(Array) ? categories.join(', ') : categories
  end

  def profile_complete?
    business_name.present? && 
    description.present? && 
    location.present? && 
    has_description?
  end

  def display_name
    business_name.presence || user.full_name
  end

  def rating_display
    return 'No ratings yet' if total_reviews.zero?
    "#{average_rating.round(1)} (#{total_reviews} #{'review'.pluralize(total_reviews)})"
  end

  def featured_portfolio_items
    portfolio_items.featured.ordered.limit(6)
  end

  def portfolio_categories
    portfolio_items.categories_for_vendor(self)
  end

  def has_portfolio?
    portfolio_items.exists?
  end

  def has_coordinates?
    latitude.present? && longitude.present?
  end

  def coordinates
    return nil unless has_coordinates?
    [latitude.to_f, longitude.to_f]
  end

  def distance_to(lat, lng)
    return nil unless has_coordinates?
    
    # Haversine formula for calculating distance between two points
    rad_per_deg = Math::PI / 180
    rkm = 6371 # Earth radius in kilometers
    rm = rkm * 1000 # Earth radius in meters

    dlat_rad = (lat - latitude) * rad_per_deg
    dlon_rad = (lng - longitude) * rad_per_deg

    lat1_rad = latitude * rad_per_deg
    lat2_rad = lat * rad_per_deg

    a = Math.sin(dlat_rad / 2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad / 2)**2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    rm * c # Distance in meters
  end

  # Class methods
  def self.search_by_name_or_location(query)
    return all if query.blank?
    
    where(
      'business_name ILIKE ? OR location ILIKE ? OR description ILIKE ?',
      "%#{query}%", "%#{query}%", "%#{query}%"
    )
  end

  # Callbacks
  before_save :normalize_website

  private

  def normalize_website
    return if website.blank?
    
    unless website.match?(/\Ahttps?:\/\//)
      self.website = "https://#{website}"
    end
  end

  def website_format
    return if website.blank?
    
    # Normalize first
    normalize_website
    
    # Then validate
    begin
      uri = URI.parse(website)
      unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
        errors.add(:website, 'is not a valid URL')
      end
      
      # Additional validation for domain format
      unless website.match?(/\A(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?\z/i)
        errors.add(:website, 'is not a valid URL')
      end
    rescue URI::InvalidURIError
      errors.add(:website, 'is not a valid URL')
    end
  end
end
