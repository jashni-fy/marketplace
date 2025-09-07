class CustomerBookingMailer < ApplicationMailer
  def booking_approved_notification(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service
    
    mail(
      to: @customer.user.email,
      subject: "Booking Confirmed - #{@service.name}"
    )
  end
  
  def booking_rejected_notification(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service
    
    mail(
      to: @customer.user.email,
      subject: "Booking Declined - #{@service.name}"
    )
  end
  
  def booking_cancelled_notification(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service
    
    mail(
      to: @customer.user.email,
      subject: "Booking Cancelled - #{@service.name}"
    )
  end
  
  def booking_reminder(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service
    
    mail(
      to: @customer.user.email,
      subject: "Booking Reminder - #{@service.name} Tomorrow"
    )
  end
  
  def booking_confirmation(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service
    
    mail(
      to: @customer.user.email,
      subject: "Booking Confirmation - #{@service.name}"
    )
  end
end