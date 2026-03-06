# frozen_string_literal: true

class BookingResponseService
  include Callable

  RESPONSE_STATUS = {
    'accept' => 'confirmed',
    'decline' => 'cancelled',
    'counter_offer' => 'requested_changes'
  }.freeze

  RESPONSE_NOTIFICATION = {
    'accept' => 'booking_approved',
    'decline' => 'booking_rejected',
    'counter_offer' => 'booking_changes_requested'
  }.freeze

  def initialize(booking, vendor, response_action, message = nil)
    @booking = booking
    @vendor = vendor
    @response_action = response_action
    @message = message
  end

  def call
    return { success: false, errors: ['Unauthorized'] } unless authorized?
    return { success: false, errors: ['Invalid response type'] } unless valid_response_type?
    return { success: false, errors: ['Booking cannot be modified'] } unless booking_modifiable?

    ActiveRecord::Base.transaction do
      update_booking_status
      create_response_message
      send_customer_notification
      log_status_change
    end

    { success: true, booking: @booking.reload }
  rescue StandardError => e
    { success: false, errors: [e.message] }
  end

  private

  def authorized?
    @booking.vendor == @vendor
  end

  def valid_response_type?
    RESPONSE_STATUS.key?(@response_action)
  end

  def booking_modifiable?
    %w[pending requested_changes].include?(@booking.status)
  end

  def update_booking_status
    new_status = RESPONSE_STATUS.fetch(@response_action)
    @booking.update!(status: new_status)
  end

  def create_response_message
    # Create a booking message for the response
    # This would need to be implemented based on your BookingMessage model
    Rails.logger.info "Vendor #{@vendor.id} responded to booking #{@booking.id} with #{@response_type}"
  end

  def send_customer_notification
    notification_type = RESPONSE_NOTIFICATION.fetch(@response_action)
    NotificationJob.perform_later(notification_type, @booking.customer.id, { 'booking_id' => @booking.id })
  end

  def log_status_change
    Rails.logger.info "Booking #{@booking.id} status changed to #{@booking.status} by vendor #{@vendor.id}"
  end
end
