# frozen_string_literal: true

class BookingCreationService
  include ActiveModel::Model
  include ActiveModel::Attributes
  include Callable

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
  validates :total_amount, numericality: { greater_than: 0 }
  # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
  def call
    return { success: false, errors: errors.full_messages } unless valid?

    ActiveRecord::Base.transaction do
      create_booking
      check_availability
      prevent_double_booking

      if @booking.save
        # Send notification to vendor about new booking
        begin
          if defined?(NotificationJob)
            NotificationJob.perform_later('booking_created', @vendor_profile.user_id, { 'booking_id' => @booking.id })
          end
        rescue Redis::ConnectionError, Errno::ECONNREFUSED => e
          Rails.logger.warn("Failed to send booking notification: #{e.message}")
          # Don't fail the booking creation if notification fails
        end
        { success: true, booking: @booking }
      else
        @booking.errors.full_messages.each do |message|
          errors.add(:base, message)
        end
        { success: false, errors: errors.full_messages }
      end
    end
  rescue StandardError => e
    errors.add(:base, e.message)
    { success: false, errors: errors.full_messages }
  end
  # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

  attr_reader :booking

  private

  def create_booking
    @service = Service.find(service_id)
    @vendor_profile = @service.vendor_profiles.first

    @booking = Booking.new(
      customer: customer,
      vendor_profile: @vendor_profile,
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
      vendor_profile: @vendor_profile,
      date: event_date.to_date,
      start_time: event_date.strftime('%H:%M'),
      end_time: (event_end_date || (event_date + 2.hours)).strftime('%H:%M')
    )

    return if availability_checker.available?

    errors.add(:event_date, 'is not available for this vendor')
    raise ActiveRecord::RecordInvalid, @booking
  end

  def prevent_double_booking
    conflict_resolver = ConflictResolutionService.new(
      vendor_profile: @vendor_profile,
      event_date: event_date,
      event_end_date: event_end_date || (event_date + 2.hours),
      exclude_booking_id: nil
    )

    return unless conflict_resolver.conflict?

    errors.add(:event_date, 'conflicts with another booking')
    raise ActiveRecord::RecordInvalid, @booking
  end
end
