class MessageMailer < ApplicationMailer
  def new_message_notification(booking_message)
    @message = booking_message
    @booking = booking_message.booking
    @sender = booking_message.sender
    @recipient = booking_message.recipient
    
    mail(
      to: @recipient.email,
      subject: "New Message - #{@booking.service.name}"
    )
  end
end