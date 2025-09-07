# frozen_string_literal: true

class Booking < ApplicationRecord
  belongs_to :customer, class_name: 'User'
  belongs_to :vendor, class_name: 'User'
  belongs_to :service
  has_many :booking_messages, dependent: :destroy

  enum status: {
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

  validate :event_date_in_future, on: :create
  validate :vendor_availability, on: :create

  scope :upcoming, -> { where('event_date > ?', Time.current) }
  scope :for_vendor, ->(vendor) { where(vendor: vendor) }
  scope :for_customer, ->(customer) { where(customer: customer) }
  scope :by_status, ->(status) { where(status: status) }

  def duration_hours
    return nil unless event_end_date && event_date
    ((event_end_date - event_date) / 1.hour).round(2)
  end

  def can_be_modified?
    pending? && event_date > 24.hours.from_now
  end

  def can_be_cancelled?
    (pending? || accepted?) && event_date > 24.hours.from_now
  end

  def can_be_modified?
    pending? && event_date > 24.hours.from_now
  end

  def vendor_profile
    vendor&.vendor_profile
  end

  def customer_profile
    customer&.customer_profile
  end

  private

  def event_date_in_future
    return unless event_date

    errors.add(:event_date, 'must be in the future') if event_date <= Time.current
  end

  def vendor_availability
    return unless vendor && event_date

    # Check if vendor has availability for this date
    availability = AvailabilitySlot.find_by(
      vendor_profile: vendor.vendor_profile,
      date: event_date.to_date,
      is_available: true
    )

    unless availability
      errors.add(:event_date, 'is not available for this vendor')
    end

    # Check for conflicting bookings
    conflicting_booking = Booking.where(
      vendor: vendor,
      status: [:pending, :accepted]
    ).where(
      '(event_date <= ? AND event_end_date >= ?) OR (event_date <= ? AND event_end_date >= ?)',
      event_date, event_date,
      event_end_date || event_date + 2.hours, event_end_date || event_date + 2.hours
    ).where.not(id: id).exists?

    if conflicting_booking
      errors.add(:event_date, 'conflicts with another booking')
    end
  end
end