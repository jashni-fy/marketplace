# frozen_string_literal: true

class BookingMessage < ApplicationRecord
  belongs_to :booking
  belongs_to :sender, class_name: 'User'

  validates :message, presence: true, length: { minimum: 1, maximum: 1000 }
  validates :sent_at, presence: true

  before_validation :set_sent_at, on: :create

  scope :ordered, -> { order(:sent_at) }
  scope :recent, -> { order(sent_at: :desc) }

  def sender_name
    if sender.vendor?
      sender.vendor_profile&.business_name || "#{sender.first_name} #{sender.last_name}"
    else
      "#{sender.first_name} #{sender.last_name}"
    end
  end

  def sender_type
    sender.role
  end

  def formatted_sent_at
    sent_at.strftime('%m/%d/%Y at %I:%M %p')
  end

  private

  def set_sent_at
    self.sent_at ||= Time.current
  end
end