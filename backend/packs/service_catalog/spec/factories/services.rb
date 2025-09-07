FactoryBot.define do
  factory :service do
    sequence(:name) { |n| "Service #{n}" }
    description { "This is a comprehensive description of the service that provides detailed information about what is offered and meets the minimum length requirement for validation." }
    association :service_category
    base_price { 150.00 }
    pricing_type { :hourly }
    status { :active }
    
    # Create vendor_profile through association
    transient do
      vendor_user { nil }
    end
    
    vendor_profile do
      if vendor_user
        vendor_user.vendor_profile
      else
        association :vendor_profile
      end
    end

    trait :draft do
      status { :draft }
    end

    trait :inactive do
      status { :inactive }
    end

    trait :archived do
      status { :archived }
    end

    trait :package_pricing do
      pricing_type { :package }
      base_price { 500.00 }
    end

    trait :custom_pricing do
      pricing_type { :custom }
      base_price { nil }
    end

    trait :photography do
      name { 'Wedding Photography' }
      description { 'Professional wedding photography service capturing your special moments with artistic flair and attention to detail. Includes pre-wedding consultation, full day coverage, and edited high-resolution images.' }
      association :service_category, :photography
      base_price { 1200.00 }
      pricing_type { :package }
    end

    trait :videography do
      name { 'Event Videography' }
      description { 'Complete event videography service including multi-camera setup, professional audio recording, and post-production editing to create a memorable video of your special event.' }
      association :service_category, :videography
      base_price { 80.00 }
      pricing_type { :hourly }
    end

    trait :expensive do
      base_price { 2000.00 }
    end

    trait :cheap do
      base_price { 50.00 }
    end
  end
end
