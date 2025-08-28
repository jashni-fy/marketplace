FactoryBot.define do
  factory :service_category do
    sequence(:name) { |n| "Category #{n}" }
    description { "This is a detailed description of the service category that meets the minimum length requirement." }
    sequence(:slug) { |n| "category-#{n}" }
    active { true }

    trait :inactive do
      active { false }
    end

    trait :photography do
      name { 'Photography' }
      description { 'Professional photography services for events, portraits, and commercial needs' }
      slug { 'photography' }
    end

    trait :videography do
      name { 'Videography' }
      description { 'Video production and filming services for events, marketing, and entertainment' }
      slug { 'videography' }
    end

    trait :event_management do
      name { 'Event Management' }
      description { 'Complete event planning and coordination services for all types of occasions' }
      slug { 'event-management' }
    end
  end
end
