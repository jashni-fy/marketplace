FactoryBot.define do
  factory :service_image do
    association :service
    title { "Sample Service Image" }
    description { "A beautiful image showcasing our service quality and attention to detail." }
    alt_text { "Service portfolio image" }
    display_order { 0 }
    is_primary { false }

    # Attach a test image file
    after(:build) do |service_image|
      service_image.image.attach(
        io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'test_image.jpg')),
        filename: 'test_image.jpg',
        content_type: 'image/jpeg'
      )
    end

    trait :primary do
      is_primary { true }
    end

    trait :without_image do
      after(:build) do |service_image|
        service_image.image = nil
      end
    end

    trait :with_png_image do
      after(:build) do |service_image|
        service_image.image.attach(
          io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'test_image.png')),
          filename: 'test_image.png',
          content_type: 'image/png'
        )
      end
    end

    trait :large_image do
      after(:build) do |service_image|
        service_image.image.attach(
          io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'large_image.jpg')),
          filename: 'large_image.jpg',
          content_type: 'image/jpeg'
        )
      end
    end
  end
end
