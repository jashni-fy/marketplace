# frozen_string_literal: true

class Review < ApplicationRecord
  # Associations
  belongs_to :booking
  belongs_to :customer, class_name: 'User'
  belongs_to :vendor_profile
  belongs_to :service
  
  # Enums
  enum status: { published: 0, hidden: 1 }

  # Validations
  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :quality_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :communication_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :value_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :punctuality_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :comment, length: { maximum: 1000 }
  validates :booking_id, uniqueness: { message: "has already been reviewed" }
  validate :booking_must_be_completed
  validate :customer_must_own_booking

  # Callbacks
  after_save :update_all_rating_stats
  after_destroy :update_all_rating_stats

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_rating, ->(rating) { where(rating: rating) }

  private

  def booking_must_be_completed
    return unless booking
    unless booking.completed?
      errors.add(:booking, "must be completed before it can be reviewed")
    end
  end

  def customer_must_own_booking
    return unless booking && customer
    unless booking.customer_id == customer_id
      errors.add(:customer, "must be the one who made the booking")
    end
  end

  def update_all_rating_stats
    vendor_profile.update_rating_stats!
    service.update_rating_stats! if service.present?
  end
end
