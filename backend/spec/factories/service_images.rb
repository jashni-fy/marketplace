# frozen_string_literal: true

# == Schema Information
#
# Table name: service_images
#
#  id            :bigint           not null, primary key
#  alt_text      :string
#  description   :text
#  display_order :integer          default(0)
#  is_primary    :boolean          default(FALSE)
#  title         :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  service_id    :bigint           not null
#
# Indexes
#
#  index_service_images_on_service_id                    (service_id)
#  index_service_images_on_service_id_and_display_order  (service_id,display_order)
#  index_service_images_on_service_id_and_is_primary     (service_id,is_primary)
#
# Foreign Keys
#
#  fk_rails_...  (service_id => services.id)
#
FactoryBot.define do
  factory :service_image do
    service
    title { 'Sample Service Image' }
    description { 'A beautiful image showcasing our service quality and attention to detail.' }
    alt_text { 'Service portfolio image' }
    display_order { 0 }
    is_primary { false }

    # Attach a test image file
    after(:build) do |service_image|
      service_image.image.attach(
        io: Rails.root.join('spec/fixtures/files/test_image.jpg').open,
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
          io: Rails.root.join('spec/fixtures/files/test_image.png').open,
          filename: 'test_image.png',
          content_type: 'image/png'
        )
      end
    end

    trait :large_image do
      after(:build) do |service_image|
        service_image.image.attach(
          io: Rails.root.join('spec/fixtures/files/large_image.jpg').open,
          filename: 'large_image.jpg',
          content_type: 'image/jpeg'
        )
      end
    end
  end
end
