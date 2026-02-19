# == Schema Information
#
# Table name: vendor_profiles
#
#  id                  :bigint           not null, primary key
#  average_rating      :decimal(3, 2)    default(0.0)
#  business_license    :string
#  business_name       :string           not null
#  description         :text
#  is_verified         :boolean          default(FALSE)
#  latitude            :decimal(10, 6)
#  location            :string
#  longitude           :decimal(10, 6)
#  phone               :string
#  rejection_reason    :text
#  service_categories  :text
#  total_reviews       :integer          default(0)
#  verification_status :integer          default("unverified")
#  verified_at         :datetime
#  website             :string
#  years_experience    :integer          default(0)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  user_id             :bigint           not null
#
# Indexes
#
#  index_vendor_profiles_on_business_name        (business_name)
#  index_vendor_profiles_on_coordinates          (latitude,longitude)
#  index_vendor_profiles_on_is_verified          (is_verified)
#  index_vendor_profiles_on_location             (location)
#  index_vendor_profiles_on_user_id              (user_id)
#  index_vendor_profiles_on_verification_status  (verification_status)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
FactoryBot.define do
  factory :vendor_profile do
    # Use the auto-created vendor profile from User model
    initialize_with { create(:user, role: :vendor).vendor_profile }
    
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
