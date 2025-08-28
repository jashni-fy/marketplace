FactoryBot.define do
  factory :user do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.unique.email }
    password { 'password123' }
    password_confirmation { 'password123' }
    role { :customer }
    confirmed_at { Time.current }

    trait :customer do
      role { :customer }
    end

    trait :vendor do
      role { :vendor }
    end

    trait :admin do
      role { :admin }
    end

    trait :unconfirmed do
      confirmed_at { nil }
    end

    trait :with_vendor_profile do
      role { :vendor }
      after(:create) do |user|
        create(:vendor_profile, user: user) unless user.vendor_profile
      end
    end

    trait :with_customer_profile do
      role { :customer }
      after(:create) do |user|
        create(:customer_profile, user: user) unless user.customer_profile
      end
    end
  end
end