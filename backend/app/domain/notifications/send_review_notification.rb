# frozen_string_literal: true

module Notifications
  class SendReviewNotification
    extend Dry::Initializer

    option :review, type: Types.Instance(Review)

    def self.call(**)
      new(**).call
    end

    def call
      # Notify vendor about new review
      SendNotification.call(
        user: review.vendor_profile.user,
        title: 'You Received a Review',
        message: "#{review.customer.full_name} left a #{review.rating}-star review: \"#{truncate_message(review.message)}\"",
        notification_type: 'review_received',
        related_type: 'Review',
        related_id: review.id
      )
      { success: true }
    rescue StandardError => e
      Rails.logger.error("Failed to send review notification: #{e.message}")
      { success: false, error: e.message }
    end

    private

    def truncate_message(message)
      return '' if message.blank?

      message.length > 100 ? "#{message[0...100]}..." : message
    end
  end
end
