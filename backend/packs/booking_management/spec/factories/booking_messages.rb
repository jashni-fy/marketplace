# frozen_string_literal: true

FactoryBot.define do
  factory :booking_message do
    association :booking
    association :sender, factory: :user
    
    message { Faker::Lorem.sentence(word_count: rand(5..50)) }
    sent_at { rand(1..24).hours.ago }

    trait :from_customer do
      association :sender, factory: [:user, :customer]
    end

    trait :from_vendor do
      association :sender, factory: [:user, :vendor]
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