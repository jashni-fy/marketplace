class ServiceCategory < ApplicationRecord
  # Associations
  has_many :services, dependent: :destroy

  # Validations
  validates :name, presence: true, uniqueness: true, length: { minimum: 2, maximum: 50 }
  validates :description, presence: true, length: { minimum: 10, maximum: 500 }
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9\-_]+\z/, message: "only allows lowercase letters, numbers, hyphens, and underscores" }

  # Scopes
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :ordered, -> { order(:name) }

  # Callbacks
  before_validation :generate_slug, if: -> { name.present? && slug.blank? }

  # Predefined categories
  PREDEFINED_CATEGORIES = [
    {
      name: 'Photography',
      description: 'Professional photography services for events, portraits, and commercial needs',
      slug: 'photography'
    },
    {
      name: 'Videography',
      description: 'Video production and filming services for events, marketing, and entertainment',
      slug: 'videography'
    },
    {
      name: 'Event Management',
      description: 'Complete event planning and coordination services for all types of occasions',
      slug: 'event-management'
    },
    {
      name: 'Wedding Planning',
      description: 'Specialized wedding planning and coordination services',
      slug: 'wedding-planning'
    },
    {
      name: 'Catering',
      description: 'Food and beverage services for events and special occasions',
      slug: 'catering'
    },
    {
      name: 'DJ Services',
      description: 'Music and entertainment services for parties and events',
      slug: 'dj-services'
    },
    {
      name: 'Floral Design',
      description: 'Flower arrangements and decorative services for events',
      slug: 'floral-design'
    },
    {
      name: 'Makeup & Beauty',
      description: 'Professional makeup and beauty services for special occasions',
      slug: 'makeup-beauty'
    },
    {
      name: 'Transportation',
      description: 'Vehicle rental and transportation services for events',
      slug: 'transportation'
    },
    {
      name: 'Venue Rental',
      description: 'Event space and venue rental services',
      slug: 'venue-rental'
    }
  ].freeze

  # Class methods
  def self.seed_predefined_categories
    PREDEFINED_CATEGORIES.each do |category_data|
      find_or_create_by(slug: category_data[:slug]) do |category|
        category.name = category_data[:name]
        category.description = category_data[:description]
        category.active = true
      end
    end
  end

  def self.active_categories
    active.ordered
  end

  # Instance methods
  def active?
    active
  end

  def services_count
    services.count
  end

  def to_param
    slug
  end

  private

  def generate_slug
    self.slug = name.downcase.gsub(/[^a-z0-9\s\-_]/, '').gsub(/\s+/, '-').strip
  end


end
