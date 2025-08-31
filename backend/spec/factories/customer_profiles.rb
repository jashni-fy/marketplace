# == Schema Information
#
# Table name: customer_profiles
#
#  id             :bigint           not null, primary key
#  budget_range   :string
#  company_name   :string
#  event_types    :text
#  location       :string
#  phone          :string
#  preferences    :text
#  total_bookings :integer          default(0)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  user_id        :bigint           not null
#
# Indexes
#
#  index_customer_profiles_on_budget_range  (budget_range)
#  index_customer_profiles_on_location      (location)
#  index_customer_profiles_on_user_id       (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
FactoryBot.define do
  factory :customer_profile do
    # Don't create a user here - let the User model handle profile creation
    # or use the existing profile created by the User callback
    
    phone { '+1-555-987-6543' }
    preferences { Faker::Lorem.paragraph(sentence_count: 3) }
    event_types { ['Wedding', 'Corporate Event', 'Birthday Party'].sample(2).join(', ') }
    budget_range { CustomerProfile.budget_ranges.keys.sample }
    location { "#{Faker::Address.city}, #{Faker::Address.state}" }
    company_name { [Faker::Company.name, nil].sample }
    total_bookings { 0 }

    trait :with_company do
      company_name { Faker::Company.name }
    end

    trait :frequent_customer do
      total_bookings { rand(5..20) }
    end

    trait :high_budget do
      budget_range { 'over_5000' }
    end

    trait :complete_profile do
      phone { '+1-555-987-6543' }
      preferences { 'I prefer vendors with excellent reviews and professional portfolios.' }
      event_types { 'Wedding, Anniversary, Corporate Event' }
      location { 'New York, NY' }
    end
  end
end
