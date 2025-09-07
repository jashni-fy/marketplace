# frozen_string_literal: true

class BookingCreationService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attr_accessor :customer
  attribute :service_id, :integer
  attribute :event_date, :datetime
  attribute :event_end_date, :datetime
  attribute :event_location, :string
  attribute :total_amount, :decimal
  attribute :requirements, :string
  attribute :special_instructions, :string
  attribute :event_duration, :string

  validates :customer, presence: true
  validates :service_id, presence: true
  validates :event_date, presence: true
  validates :event_location, presence: true
  validates :total_amount, presence: true, numericality: { greater_than: 0 }

  def initialize(attributes = {})
    super
    @errors = ActiveModel::Errors.new(self)
  end

  def call
    return false unless valid?

    ActiveRecord::Base.transaction do
      create_booking
      check_availability
      prevent_double_booking
      
      if @booking.save
        # Send notification to vendor about new booking
        NotificationJob.perform_later('booking_created', @vendor.id, { 'booking_id' => @booking.id })
        true
      else
        @booking.errors.full_messages.each do |message|
          @errors.add(:base, message)
        end
        false
      end
    end
  rescue ActiveRecord::RecordInvalid => e
    @errors.add(:base, e.message)
    false
  end

  def booking
    @booking
  end

  def errors
    @errors
  end

  private

  def create_booking
    @service = Service.find(service_id)
    @vendor = @service.vendor_profile.user

    @booking = Booking.new(
      customer: customer,
      vendor: @vendor,
      service: @service,
      event_date: event_date,
      event_end_date: event_end_date,
      event_location: event_location,
      total_amount: total_amount,
      requirements: requirements,
      special_instructions: special_instructions,
      event_duration: event_duration,
      status: :pending
    )
  end

  def check_availability
    availability_checker = AvailabilityCheckerService.new(
      vendor_profile: @vendor.vendor_profile,
      date: event_date.to_date,
      start_time: event_date.strftime('%H:%M'),
      end_time: (event_end_date || event_date + 2.hours).strftime('%H:%M')
    )

    unless availability_checker.available?
      @errors.add(:event_date, 'is not available for this vendor')
      raise ActiveRecord::RecordInvalid.new(@booking)
    end
  end

  def prevent_double_booking
    conflict_resolver = ConflictResolutionService.new(
      vendor: @vendor,
      event_date: event_date,
      event_end_date: event_end_date || event_date + 2.hours,
      exclude_booking_id: nil
    )

    if conflict_resolver.has_conflict?
      @errors.add(:event_date, 'conflicts with another booking')
      raise ActiveRecord::RecordInvalid.new(@booking)
    end
  end
end