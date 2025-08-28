class VendorProfile < ApplicationRecord
  belongs_to :user
  
  # Service associations
  has_many :services, dependent: :destroy
  
  # Future associations (will be added in later tasks)
  # has_many :portfolio_items, dependent: :destroy
  # has_many :availability_slots, dependent: :destroy
  # has_many :bookings, through: :services
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

  # Scopes
  scope :verified, -> { where(is_verified: true) }
  scope :unverified, -> { where(is_verified: false) }
  scope :by_location, ->(location) { where('location ILIKE ?', "%#{location}%") }
  scope :with_rating_above, ->(rating) { where('average_rating >= ?', rating) }
  scope :by_experience, ->(min_years) { where('years_experience >= ?', min_years) }

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