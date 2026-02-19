# == Schema Information
#
# Table name: vendor_profiles
#
#  id                  :bigint           not null, primary key
#  average_rating      :decimal(3, 2)    default(0.0)
#  business_license    :string
#  business_name       :string           not null
#  description         :text
#  is_verified         :boolean          default(FALSE)
#  latitude            :decimal(10, 6)
#  location            :string
#  longitude           :decimal(10, 6)
#  phone               :string
#  rejection_reason    :text
#  service_categories  :text
#  total_reviews       :integer          default(0)
#  verification_status :integer          default("unverified")
#  verified_at         :datetime
#  website             :string
#  years_experience    :integer          default(0)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  user_id             :bigint           not null
#
# Indexes
#
#  index_vendor_profiles_on_business_name        (business_name)
#  index_vendor_profiles_on_coordinates          (latitude,longitude)
#  index_vendor_profiles_on_is_verified          (is_verified)
#  index_vendor_profiles_on_location             (location)
#  index_vendor_profiles_on_user_id              (user_id)
#  index_vendor_profiles_on_verification_status  (verification_status)
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
  has_many :reviews, dependent: :destroy

  # Enums
  enum verification_status: {
    unverified: 0,
    pending_verification: 1,
    verified: 2,
    rejected: 3
  }

  # Validations
  validates :user_id, presence: true, uniqueness: true
  validates :business_name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :description, length: { minimum: 50, maximum: 2000 }, allow_blank: true
  validates :location, presence: true, length: { maximum: 255 }
  validates :phone, format: { with: /\A[+]?[-\d\s()]{7,15}\z/ }, allow_blank: true
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
    is_verified || verified_verification_status?
  end

  def request_verification!
    update(verification_status: :pending_verification)
  end

  def approve_verification!
    update(verification_status: :verified, is_verified: true, verified_at: Time.current, rejection_reason: nil)
  end

  def reject_verification!(reason)
    update(verification_status: :rejected, is_verified: false, rejection_reason: reason)
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

  def update_rating_stats!
    stats = reviews.published.pluck(
      'COUNT(id)', 
      'AVG(rating)',
      'AVG(quality_rating)',
      'AVG(communication_rating)',
      'AVG(value_rating)',
      'AVG(punctuality_rating)'
    ).first
    
    count = stats[0].to_i
    avg = stats[1].to_f.round(2)
    
    update_columns(average_rating: avg, total_reviews: count)
    
    # Return detailed stats for immediate use if needed
    {
      count: count,
      average: avg,
      quality: stats[2].to_f.round(2),
      communication: stats[3].to_f.round(2),
      value: stats[4].to_f.round(2),
      punctuality: stats[5].to_f.round(2)
    }
  end

  def rating_distribution
    dist = reviews.published.group(:rating).count
    {
      5 => dist[5] || 0,
      4 => dist[4] || 0,
      3 => dist[3] || 0,
      2 => dist[2] || 0,
      1 => dist[1] || 0
    }
  end

  def rating_breakdown
    stats = reviews.published.pluck(
      'AVG(quality_rating)',
      'AVG(communication_rating)',
      'AVG(value_rating)',
      'AVG(punctuality_rating)'
    ).first
    
    {
      quality: stats[0].to_f.round(2),
      communication: stats[1].to_f.round(2),
      value: stats[2].to_f.round(2),
      punctuality: stats[3].to_f.round(2)
    }
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

  # Calculates the distance from this vendor to the given latitude and longitude.
  # Params:
  # +lat+:: Latitude of the target point (Float)
  # +lng+:: Longitude of the target point (Float)
  # +unit+:: :meters (default) or :kilometers
  # Returns distance as Float (meters or kilometers), or nil if coordinates are missing/invalid.
  def distance_to(lat, lng, unit: :meters)
    return nil unless has_coordinates?
    return nil unless lat.is_a?(Numeric) && lng.is_a?(Numeric)
    return nil unless lat.between?(-90, 90) && lng.between?(-180, 180)

    lat1 = latitude.to_f
    lon1 = longitude.to_f
    lat2 = lat.to_f
    lon2 = lng.to_f

    return 0.0 if lat1 == lat2 && lon1 == lon2

    rad_per_deg = Math::PI / 180
    rkm = 6371.0 # Earth radius in kilometers
    dlat_rad = (lat2 - lat1) * rad_per_deg
    dlon_rad = (lon2 - lon1) * rad_per_deg
    lat1_rad = lat1 * rad_per_deg
    lat2_rad = lat2 * rad_per_deg

    a = Math.sin(dlat_rad / 2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad / 2)**2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    distance_km = rkm * c

    case unit
    when :meters
      (distance_km * 1000).round(2)
    when :kilometers
      distance_km.round(4)
    else
      distance_km * 1000 # default to meters if unknown unit
    end
  end

  # Class methods
  def self.search_by_name_or_location(query)
    return all if query.blank?
    
    where(
      'business_name ILIKE ? OR location ILIKE ? OR description ILIKE ?',
      "%#{query}%", "%#{query}%", "%#{query}%"
    )
  end

  # == Ransackable Associations ==
  # Explicitly allowlist safe associations for Ransack/ActiveAdmin
  def self.ransackable_associations(auth_object = nil)
    %w[user services portfolio_items availability_slots bookings]
  end

  # == Ransackable Attributes ==
  # Explicitly allowlist safe searchable fields for Ransack/ActiveAdmin
  def self.ransackable_attributes(auth_object = nil)
    %w[
      id business_name description location phone website service_categories business_license years_experience is_verified average_rating total_reviews latitude longitude created_at updated_at user_id
    ]
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
    normalize_website
    begin
      uri = URI.parse(website)
      unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
        errors.add(:website, 'is not a valid URL')
      end
      # Additional validation for domain format
      unless website.match?(/\A(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?\z/i)
        errors.add(:website, 'is not a valid URL')
      end
    rescue URI::InvalidURIError
      errors.add(:website, 'is not a valid URL')
    end
  end
end
