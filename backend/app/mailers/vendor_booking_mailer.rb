class VendorBookingMailer < ApplicationMailer
  def new_booking_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service
    
    mail(
      to: @vendor.user.email,
      subject: "New Booking Request - #{@service.name}"
    )
  end
  
  def booking_cancelled_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service
    
    mail(
      to: @vendor.user.email,
      subject: "Booking Cancelled - #{@service.name}"
    )
  end
  
  def booking_modified_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service
    
    mail(
      to: @vendor.user.email,
      subject: "Booking Modified - #{@service.name}"
    )
  end
end