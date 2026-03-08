# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength, Rails/UniqueValidationWithoutIndex

# == Schema Information
#
# Table name: vendor_profiles
#
#  id                  :bigint           not null, primary key
#  average_rating      :decimal(3, 2)    default(0.0)
#  business_license    :string
#  business_name       :string           not null
#  description         :text
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
  has_many :vendor_services, dependent: :destroy
  has_many :services, through: :vendor_services
  has_many :categories, through: :services
  has_many :portfolio_items, dependent: :destroy
  has_many :availability_slots, dependent: :destroy
  has_many :bookings, dependent: :destroy # Updated to direct association
  has_many :reviews, dependent: :destroy

  # Enums
  enum :verification_status, {
    unverified: 0,
    pending_verification: 1,
    verified: 2,
    rejected: 3
  }, prefix: :verification

  # Validations
  validates :user_id, uniqueness: true, index: true
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
  scope :verified, -> { where(verification_status: :verified) } # Updated to use enum
  scope :unverified, -> { where.not(verification_status: :verified) } # Updated to use enum
  scope :by_location, ->(location) { where('location ILIKE ?', "%#{location}%") }
  scope :with_rating_above, ->(rating) { where(average_rating: rating..) }
  scope :by_experience, ->(min_years) { where(years_experience: min_years..) }
  scope :with_coordinates, -> { where('latitude IS NOT NULL AND longitude IS NOT NULL') }
  scope :within_radius, lambda { |lat, lng, radius_km|
    where('latitude IS NOT NULL AND longitude IS NOT NULL')
      .where(haversine_distance_sql, lat, lng, lat, radius_km)
  }

  # Instance methods
  def verified?
    verification_verified?
  end

  def request_verification!
    VendorProfiles::HandleVerification.call(vendor_profile: self, action: :request)
  end

  def approve_verification!
    VendorProfiles::HandleVerification.call(vendor_profile: self, action: :approve)
  end

  def reject_verification!(reason)
    VendorProfiles::HandleVerification.call(vendor_profile: self, action: :reject, reason: reason)
  end

  def description?
    description.present? && description.length >= 50
  end

  alias has_description? description?

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
      description?
  end

  def display_name
    business_name.presence || user.full_name
  end

  def update_rating_stats!
    VendorProfiles::UpdateRatingStats.call(vendor_profile: self)
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
    stats = reviews.published.pick(
      'AVG(quality_rating)',
      'AVG(communication_rating)',
      'AVG(value_rating)',
      'AVG(punctuality_rating)'
    )

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

  def portfolio?
    portfolio_items.exists?
  end

  alias has_portfolio? portfolio?

  def coordinates?
    latitude.present? && longitude.present?
  end

  alias has_coordinates? coordinates?

  def coordinates
    return nil unless coordinates?

    [latitude.to_f, longitude.to_f]
  end

  # Calculates distance from this vendor to given latitude/longitude
  def distance_to(lat, lng, unit: :meters)
    return nil unless valid_distance_params?(lat, lng, coordinates?)

    calculate_haversine_distance(latitude.to_f, longitude.to_f, lat.to_f, lng.to_f, unit)
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
  def self.ransackable_associations(_auth_object = nil)
    %w[user services portfolio_items availability_slots bookings]
  end

  # == Ransackable Attributes ==
  # Explicitly allowlist safe searchable fields for Ransack/ActiveAdmin
  def self.ransackable_attributes(_auth_object = nil)
    %w[
      id business_name description location phone website
      service_categories business_license years_experience average_rating
      total_reviews latitude longitude created_at updated_at user_id
    ]
  end

  # Callbacks
  before_save :normalize_website

  private

  def normalize_website
    return if website.blank?
    return if website.match?(%r{\Ahttps?://})

    self.website = "https://#{website}"
  end

  def website_format
    return if website.blank?

    normalize_website
    begin
      uri = URI.parse(website)
      validate_url_format(uri)
    rescue URI::InvalidURIError
      errors.add(:website, 'is not a valid URL')
    end
  end

  def validate_url_format(uri)
    valid_scheme = uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
    valid_domain = website.match?(%r{\A(https?://)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*/?\z}i)
    errors.add(:website, 'is not a valid URL') unless valid_scheme && valid_domain
  end

  def valid_distance_params?(lat, lng, has_coords)
    return false unless has_coords
    return false unless lat.is_a?(Numeric) && lng.is_a?(Numeric)

    lat.between?(-90, 90) && lng.between?(-180, 180)
  end

  def calculate_haversine_distance(lat1, lon1, lat2, lon2, unit)
    return 0.0 if lat1 == lat2 && lon1 == lon2

    rad_per_deg = Math::PI / 180
    dlat_rad = (lat2 - lat1) * rad_per_deg
    dlon_rad = (lon2 - lon1) * rad_per_deg
    lat1_rad = lat1 * rad_per_deg
    lat2_rad = lat2 * rad_per_deg

    a = haversine_formula(dlat_rad, dlon_rad, lat1_rad, lat2_rad)
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    distance_km = 6371.0 * c

    format_distance(distance_km, unit)
  end

  def haversine_formula(dlat_rad, dlon_rad, lat1_rad, lat2_rad)
    sin_dlat = Math.sin(dlat_rad / 2)**2
    sin_dlon = Math.sin(dlon_rad / 2)**2
    sin_dlat + (Math.cos(lat1_rad) * Math.cos(lat2_rad) * sin_dlon)
  end

  def format_distance(distance_km, unit)
    case unit
    when :meters
      (distance_km * 1000).round(2)
    when :kilometers
      distance_km.round(4)
    else
      distance_km * 1000
    end
  end

  class << self
    private

    def haversine_distance_sql
      '6371 * acos(cos(radians(?)) * cos(radians(latitude)) * ' \
        'cos(radians(longitude) - radians(?)) + sin(radians(?)) * ' \
        'sin(radians(latitude))) <= ?'
    end
  end
end
# rubocop:enable Metrics/ClassLength, Rails/UniqueValidationWithoutIndex
