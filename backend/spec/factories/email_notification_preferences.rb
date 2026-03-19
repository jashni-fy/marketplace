# frozen_string_literal: true

FactoryBot.define do
  factory :email_notification_preference do
    user
    booking_created { true }
    booking_accepted { true }
    booking_rejected { true }
    booking_cancelled { true }
    booking_reminder { true }
    new_message { true }
    review_received { true }
  end
end
