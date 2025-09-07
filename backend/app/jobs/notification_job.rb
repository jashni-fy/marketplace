class NotificationJob < ApplicationJob
  queue_as :notifications
  
  # Don't retry if user doesn't exist
  discard_on ActiveRecord::RecordNotFound
  
  def perform(notification_type, recipient_id, data = {})
    recipient = User.find(recipient_id)
    
    case notification_type
    when 'booking_created'
      send_booking_created_notification(recipient, data)
    when 'booking_approved'
      send_booking_approved_notification(recipient, data)
    when 'booking_rejected'
      send_booking_rejected_notification(recipient, data)
    when 'booking_cancelled'
      send_booking_cancelled_notification(recipient, data)
    when 'booking_reminder'
      send_booking_reminder_notification(recipient, data)
    when 'new_message'
      send_new_message_notification(recipient, data)
    else
      Rails.logger.warn "Unknown notification type: #{notification_type}"
    end
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error "Notification job failed: #{e.message}"
    raise # Re-raise to trigger discard_on
  end
  
  private
  
  def send_booking_created_notification(recipient, data)
    booking = Booking.find(data['booking_id'])
    
    # Send email notification
    if recipient.vendor_profile.present?
      VendorBookingMailer.new_booking_notification(booking).deliver_now
    end
    
    # Create in-app notification
    create_in_app_notification(
      recipient: recipient,
      title: 'New Booking Request',
      message: build_booking_created_message(booking),
      notification_type: 'booking_created',
      related_id: booking.id,
      related_type: 'Booking'
    )
  end
  
  def send_booking_approved_notification(recipient, data)
    booking = Booking.find(data['booking_id'])
    
    # Send email notification
    CustomerBookingMailer.booking_approved_notification(booking).deliver_now
    
    # Create in-app notification
    create_in_app_notification(
      recipient: recipient,
      title: 'Booking Confirmed',
      message: "Your booking with #{booking.vendor_profile&.business_name || booking.vendor.name} has been confirmed",
      notification_type: 'booking_approved',
      related_id: booking.id,
      related_type: 'Booking'
    )
  end
  
  def send_booking_rejected_notification(recipient, data)
    booking = Booking.find(data['booking_id'])
    
    # Send email notification
    CustomerBookingMailer.booking_rejected_notification(booking).deliver_now
    
    # Create in-app notification
    create_in_app_notification(
      recipient: recipient,
      title: 'Booking Declined',
      message: "Your booking with #{booking.vendor_profile&.business_name || booking.vendor.name} has been declined",
      notification_type: 'booking_rejected',
      related_id: booking.id,
      related_type: 'Booking'
    )
  end
  
  def send_booking_cancelled_notification(recipient, data)
    booking = Booking.find(data['booking_id'])
    
    # Send email notification
    if recipient.vendor_profile.present?
      VendorBookingMailer.booking_cancelled_notification(booking).deliver_now
    else
      CustomerBookingMailer.booking_cancelled_notification(booking).deliver_now
    end
    
    # Create in-app notification
    create_in_app_notification(
      recipient: recipient,
      title: 'Booking Cancelled',
      message: build_booking_cancelled_message(booking, recipient),
      notification_type: 'booking_cancelled',
      related_id: booking.id,
      related_type: 'Booking'
    )
  end
  
  def send_booking_reminder_notification(recipient, data)
    booking = Booking.find(data['booking_id'])
    
    # Send email notification
    CustomerBookingMailer.booking_reminder(booking).deliver_now
    
    # Create in-app notification
    create_in_app_notification(
      recipient: recipient,
      title: 'Booking Reminder',
      message: "Your booking with #{booking.vendor_profile&.business_name || booking.vendor.name} is tomorrow",
      notification_type: 'booking_reminder',
      related_id: booking.id,
      related_type: 'Booking'
    )
  end
  
  def send_new_message_notification(recipient, data)
    message = BookingMessage.find(data['message_id'])
    
    # Send email notification
    MessageMailer.new_message_notification(message).deliver_now
    
    # Create in-app notification
    create_in_app_notification(
      recipient: recipient,
      title: 'New Message',
      message: "You have a new message about your booking",
      notification_type: 'new_message',
      related_id: message.booking.id,
      related_type: 'Booking'
    )
  end
  
  def create_in_app_notification(recipient:, title:, message:, notification_type:, related_id: nil, related_type: nil)
    # For now, we'll just log the in-app notification
    # In a real application, you might have a separate Notification model
    Rails.logger.info "In-app notification for user #{recipient.id}: #{title} - #{message}"
    
    # TODO: Implement proper in-app notification system
    # This could be done with a separate Notification model or using ActionCable for real-time notifications
  end
  
  def build_booking_created_message(booking)
    "You have a new booking request from #{booking.customer.full_name} for #{booking.service.name}"
  end
  
  def build_booking_cancelled_message(booking, recipient)
    if recipient.vendor_profile.present?
      "#{booking.customer.full_name} has cancelled their booking"
    else
      "Your booking with #{booking.vendor_profile&.business_name || booking.vendor.full_name} has been cancelled"
    end
  end
end