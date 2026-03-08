# frozen_string_literal: true

# == Schema Information
#
# Table name: reviews
#
#  id                   :bigint           not null, primary key
#  comment              :text
#  communication_rating :integer
#  punctuality_rating   :integer
#  quality_rating       :integer
#  rating               :integer          not null
#  status               :integer          default("published")
#  value_rating         :integer
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  booking_id           :bigint           not null
#  customer_id          :bigint           not null
#  service_id           :bigint           not null
#  vendor_profile_id    :bigint           not null
#
# Indexes
#
#  index_reviews_on_booking_id                    (booking_id) UNIQUE
#  index_reviews_on_customer_id                   (customer_id)
#  index_reviews_on_rating                        (rating)
#  index_reviews_on_service_id                    (service_id)
#  index_reviews_on_service_id_and_status         (service_id,status)
#  index_reviews_on_status                        (status)
#  index_reviews_on_vendor_profile_id             (vendor_profile_id)
#  index_reviews_on_vendor_profile_id_and_status  (vendor_profile_id,status)
#
# Foreign Keys
#
#  fk_rails_...  (booking_id => bookings.id)
#  fk_rails_...  (customer_id => users.id)
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
class Review < ApplicationRecord
  # Associations
  belongs_to :booking
  belongs_to :customer, class_name: 'User'
  belongs_to :vendor_profile
  belongs_to :service

  # Enums
  enum :status, { published: 0, hidden: 1 }

  # Validations
  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :quality_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :communication_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :value_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :punctuality_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :comment, length: { maximum: 1000 }
  validates :booking_id, uniqueness: { message: :already_reviewed }
  validate :booking_must_be_completed
  validate :customer_must_own_booking

  after_destroy :update_all_rating_stats
  # Callbacks
  after_save :update_all_rating_stats

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_rating, ->(rating) { where(rating: rating) }

  private

  def booking_must_be_completed
    return unless booking

    return if booking.completed?

    errors.add(:booking, 'must be completed before it can be reviewed')
  end

  def customer_must_own_booking
    return unless booking && customer

    return if booking.customer_id == customer_id

    errors.add(:customer, 'must be the one who made the booking')
  end

  def update_all_rating_stats
    vendor_profile.update_rating_stats!
    service.presence&.update_rating_stats!
  end
end
