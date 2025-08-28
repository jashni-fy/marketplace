class ServiceImage < ApplicationRecord
  # Associations
  belongs_to :service
  has_one_attached :image

  # Validations
  validates :service_id, presence: true
  validates :display_order, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :title, length: { maximum: 255 }
  validates :description, length: { maximum: 1000 }
  validates :alt_text, length: { maximum: 255 }
  
  # Custom validations
  validate :image_attached
  validate :image_content_type
  validate :image_file_size
  validate :only_one_primary_per_service

  # Scopes
  scope :ordered, -> { order(:display_order, :created_at) }
  scope :primary, -> { where(is_primary: true) }
  scope :non_primary, -> { where(is_primary: false) }

  # Callbacks
  before_save :set_primary_if_first_image
  after_destroy :reassign_primary_if_needed

  # Instance methods
  def primary?
    is_primary
  end

  def image_url(variant = nil)
    return nil unless image.attached?
    
    if variant
      Rails.application.routes.url_helpers.rails_representation_url(
        image.variant(variant), only_path: true
      )
    else
      Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
    end
  end

  def thumbnail_url
    image_url(resize_to_limit: [300, 200])
  end

  def medium_url
    image_url(resize_to_limit: [800, 600])
  end

  def large_url
    image_url(resize_to_limit: [1200, 900])
  end

  def image_dimensions
    return nil unless image.attached?
    
    image.blob.metadata.slice('width', 'height')
  end

  def file_size_mb
    return 0 unless image.attached?
    
    (image.blob.byte_size / 1.megabyte.to_f).round(2)
  end

  # Class methods
  def self.reorder_for_service(service_id, image_ids)
    transaction do
      image_ids.each_with_index do |image_id, index|
        where(id: image_id, service_id: service_id).update_all(display_order: index)
      end
    end
  end

  def self.set_primary_for_service(service_id, image_id)
    transaction do
      where(service_id: service_id).update_all(is_primary: false)
      where(id: image_id, service_id: service_id).update_all(is_primary: true)
    end
  end

  private

  def image_attached
    return if image.attached?
    
    errors.add(:image, 'must be attached')
  end

  def image_content_type
    return unless image.attached?
    
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    unless allowed_types.include?(image.blob.content_type)
      errors.add(:image, 'must be a JPEG, PNG, or WebP file')
    end
  end

  def image_file_size
    return unless image.attached?
    
    max_size = 10.megabytes
    if image.blob.byte_size > max_size
      errors.add(:image, "must be less than #{max_size / 1.megabyte}MB")
    end
  end

  def only_one_primary_per_service
    return unless is_primary? && service_id.present?
    
    existing_primary = ServiceImage.where(service_id: service_id, is_primary: true)
    existing_primary = existing_primary.where.not(id: id) if persisted?
    
    if existing_primary.exists?
      errors.add(:is_primary, 'can only have one primary image per service')
    end
  end

  def set_primary_if_first_image
    return if service.blank?
    return if is_primary? # Don't change if already set as primary
    
    # If this is the first image for the service, make it primary
    existing_images_count = service.service_images.count
    existing_images_count -= 1 if persisted? # Don't count self if updating
    
    if existing_images_count == 0
      self.is_primary = true
    end
  end

  def reassign_primary_if_needed
    return unless was_primary_before_destroy?
    
    # If we deleted the primary image, make the first remaining image primary
    next_image = service.service_images.ordered.first
    next_image&.update(is_primary: true)
  end

  def was_primary_before_destroy?
    is_primary?
  end
end
