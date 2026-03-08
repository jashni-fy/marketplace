# frozen_string_literal: true

class Booking < ApplicationRecord
  belongs_to :customer, class_name: 'User'
  belongs_to :vendor_profile
  belongs_to :service
  has_many :booking_messages, dependent: :destroy
  has_one :review, dependent: :destroy

  enum :status, {
    pending: 0,
    accepted: 1,
    declined: 2,
    completed: 3,
    cancelled: 4,
    counter_offered: 5
  }

  validates :event_date, presence: true
  validates :event_location, presence: true
  validates :total_amount, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true

  # NOTE: Complex validation logic (vendor_availability) moved to BookingValidationService
  # Keep minimal validations in model - only data integrity constraints
  validate :event_date_in_future, on: :create

  scope :upcoming, -> { where('event_date > ?', Time.current) }
  scope :for_vendor_profile, ->(vendor_profile) { where(vendor_profile: vendor_profile) }
  scope :for_customer, ->(customer) { where(customer: customer) }
  scope :by_status, ->(status) { where(status: status) }

  # Domain scopes for state queries
  scope :active, -> { where(status: %i[pending accepted]) }
  scope :inactive, -> { where(status: %i[declined cancelled completed]) }
  scope :cancellable, -> { where(status: %i[pending accepted]).where('event_date > ?', 24.hours.from_now) }
  scope :modifiable, -> { where(status: :pending).where('event_date > ?', 24.hours.from_now) }

  # Time-based scopes
  scope :overlapping_period, lambda { |start_date, end_date|
    where('(event_date <= ? AND event_end_date >= ?) OR (event_date <= ? AND event_end_date >= ?)',
          end_date, start_date, start_date, end_date)
  }

  def duration_hours
    return nil unless event_end_date && event_date

    ((event_end_date - event_date) / 1.hour).round(2)
  end

  # State predicate methods
  def can_be_modified?
    modifiable?
  end

  def can_be_cancelled?
    cancellable?
  end

  def customer_profile
    customer&.customer_profile
  end

  def vendor
    vendor_profile&.user
  end

  # Convenience method for accessing vendor in concerns (already have vendor_profile.user)
  alias vendor_user vendor

  private

  def event_date_in_future
    return unless event_date

    errors.add(:event_date, 'must be in the future') if event_date <= Time.current
  end
end
