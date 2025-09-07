class BookingResponseService
  def initialize(booking, vendor, response_type, message = nil)
    @booking = booking
    @vendor = vendor
    @response_type = response_type # 'approved', 'rejected', 'requested_changes'
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
    %w[approved rejected requested_changes].include?(@response_type)
  end
  
  def booking_modifiable?
    %w[pending requested_changes].include?(@booking.status)
  end
  
  def update_booking_status
    new_status = case @response_type
                when 'approved'
                  'confirmed'
                when 'rejected'
                  'cancelled'
                when 'requested_changes'
                  'requested_changes'
                end
    @booking.update!(status: new_status)
  end
  
  def create_response_message
    # Create a booking message for the response
    # This would need to be implemented based on your BookingMessage model
    Rails.logger.info "Vendor #{@vendor.id} responded to booking #{@booking.id} with #{@response_type}"
  end
  
  def send_customer_notification
    notification_type = case @response_type
                       when 'approved'
                         'booking_approved'
                       when 'rejected'
                         'booking_rejected'
                       when 'requested_changes'
                         'booking_changes_requested'
                       end
    
    NotificationJob.perform_later(notification_type, @booking.customer.id, { 'booking_id' => @booking.id })
  end
  
  def log_status_change
    Rails.logger.info "Booking #{@booking.id} status changed to #{@booking.status} by vendor #{@vendor.id}"
  end
end