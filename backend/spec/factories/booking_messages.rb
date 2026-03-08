# frozen_string_literal: true

# == Schema Information
#
# Table name: booking_messages
#
#  id         :bigint           not null, primary key
#  message    :text             not null
#  sent_at    :datetime         not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  booking_id :bigint           not null
#  sender_id  :bigint           not null
#
# Indexes
#
#  index_booking_messages_on_booking_id              (booking_id)
#  index_booking_messages_on_booking_id_and_sent_at  (booking_id,sent_at)
#  index_booking_messages_on_sender_id               (sender_id)
#
# Foreign Keys
#
#  fk_rails_...  (booking_id => bookings.id)
#  fk_rails_...  (sender_id => users.id)
#
FactoryBot.define do
  factory :booking_message do
    booking
    sender factory: %i[user]

    message { Faker::Lorem.sentence(word_count: rand(5..50)) }
    sent_at { rand(1..24).hours.ago }

    trait :from_customer do
      sender factory: %i[user customer]
    end

    trait :from_vendor do
      sender factory: %i[user vendor]
    end

    trait :recent do
      sent_at { rand(1..60).minutes.ago }
    end

    trait :old do
      sent_at { rand(1..7).days.ago }
    end

    trait :long_message do
      message { Faker::Lorem.paragraph(sentence_count: rand(5..10)) }
    end

    trait :short_message do
      message { Faker::Lorem.sentence(word_count: rand(3..8)) }
    end

    trait :question do
      message { "#{Faker::Lorem.sentence.chomp('.')}?" }
    end

    trait :urgent do
      message { "URGENT: #{Faker::Lorem.sentence}" }
    end
  end
end
