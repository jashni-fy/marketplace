FactoryBot.define do
  factory :portfolio_item do
    association :vendor_profile
    title { Faker::Lorem.words(number: 3).join(' ').titleize }
    description { Faker::Lorem.paragraph(sentence_count: 3) }
    category { ['photography', 'videography', 'event_planning', 'catering', 'music'].sample }
    display_order { rand(0..10) }
    is_featured { [true, false].sample }

    trait :featured do
      is_featured { true }
    end

    trait :photography do
      category { 'photography' }
      title { 'Wedding Photography Session' }
      description { 'Beautiful wedding photography capturing your special moments' }
    end

    trait :videography do
      category { 'videography' }
      title { 'Event Videography' }
      description { 'Professional event videography services' }
    end

    trait :with_images do
      after(:create) do |portfolio_item|
        # In a real test environment, you would attach actual test images
        # For now, we'll just mock the attachment
        allow(portfolio_item.images).to receive(:attached?).and_return(true)
        allow(portfolio_item.images).to receive(:count).and_return(3)
      end
    end
  end
end