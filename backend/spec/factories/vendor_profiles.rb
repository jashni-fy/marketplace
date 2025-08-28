FactoryBot.define do
  factory :vendor_profile do
    association :user, factory: [:user, :vendor]
    
    business_name { Faker::Company.name }
    description { Faker::Lorem.paragraph(sentence_count: 5) }
    location { "#{Faker::Address.city}, #{Faker::Address.state}" }
    phone { '+1-555-123-4567' }
    website { Faker::Internet.url }
    service_categories { ['Photography', 'Videography'].sample(2).join(', ') }
    business_license { Faker::Alphanumeric.alphanumeric(number: 10).upcase }
    years_experience { rand(0..20) }
    is_verified { false }
    average_rating { 0.0 }
    total_reviews { 0 }

    trait :verified do
      is_verified { true }
    end

    trait :with_reviews do
      average_rating { rand(3.0..5.0).round(1) }
      total_reviews { rand(5..50) }
    end

    trait :experienced do
      years_experience { rand(10..25) }
    end

    trait :complete_profile do
      description { Faker::Lorem.paragraph(sentence_count: 8) }
      phone { '+1-555-123-4567' }
      website { 'https://example.com' }
      service_categories { 'Photography, Event Planning, Videography' }
    end
  end
end