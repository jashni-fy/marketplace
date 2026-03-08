# frozen_string_literal: true

class BookingManagement::MessagePresenter
  attr_reader :message

  def initialize(message)
    @message = message
  end

  def as_json
    {
      id: message.id,
      message: message.message,
      sent_at: message.sent_at,
      formatted_sent_at: message.formatted_sent_at,
      sender: sender_hash
    }
  end

  private

  def sender_hash
    {
      id: message.sender.id,
      name: message.sender_name,
      type: message.sender_type
    }
  end
end
