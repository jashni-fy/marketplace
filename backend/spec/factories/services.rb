# frozen_string_literal: true

# == Schema Information
#
# Table name: services
#
#  id             :bigint           not null, primary key
#  average_rating :decimal(3, 2)    default(0.0)
#  base_price     :decimal(10, 2)
#  description    :text
#  name           :string
#  pricing_type   :integer          default("hourly")
#  status         :integer          default("draft")
#  total_reviews  :integer          default(0)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_services_on_average_rating  (average_rating)
#  index_services_on_status          (status)
#
FactoryBot.define do
  factory :service do
    sequence(:name) { |n| "Service #{n}" }
    description do
      'This is a comprehensive description of the service that provides detailed ' \
        'information about what is offered and meets the minimum length requirement for validation.'
    end
    service_category
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
      description do
        'Professional wedding photography service capturing your special moments with artistic flair ' \
          'and attention to detail. Includes pre-wedding consultation, full day coverage, ' \
          'and edited high-resolution images.'
      end
      service_category factory: %i[service_category photography]
      base_price { 1200.00 }
      pricing_type { :package }
    end

    trait :videography do
      name { 'Event Videography' }
      description do
        'Complete event videography service including multi-camera setup, professional audio recording, ' \
          'and post-production editing to create a memorable video of your special event.'
      end
      service_category factory: %i[service_category videography]
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
