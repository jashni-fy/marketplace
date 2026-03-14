# frozen_string_literal: true

FactoryBot.define do
  factory :in_app_notification do
    user
    title { 'Test Notification' }
    message { 'This is a test notification message' }
    notification_type { 'booking_created' }
    is_read { false }

    trait :read do
      is_read { true }
    end

    trait :booking_created do
      notification_type { 'booking_created' }
    end

    trait :review_received do
      notification_type { 'review_received' }
    end

    trait :with_related do
      related_type { 'Booking' }
      related_id { 123 }
    end
  end
end
