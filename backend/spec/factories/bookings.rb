# frozen_string_literal: true

# == Schema Information
#
# Table name: bookings
#
#  id                   :bigint           not null, primary key
#  event_date           :datetime         not null
#  event_duration       :string
#  event_end_date       :datetime
#  event_location       :string           not null
#  requirements         :text
#  special_instructions :text
#  status               :integer          default("pending"), not null
#  total_amount         :decimal(10, 2)   not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  customer_id          :bigint           not null
#  service_id           :bigint           not null
#  vendor_profile_id    :bigint           not null
#
# Indexes
#
#  index_bookings_on_customer_id             (customer_id)
#  index_bookings_on_customer_id_and_status  (customer_id,status)
#  index_bookings_on_event_date              (event_date)
#  index_bookings_on_service_id              (service_id)
#  index_bookings_on_service_id_and_status   (service_id,status)
#  index_bookings_on_vendor_profile_id       (vendor_profile_id)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => users.id)
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
FactoryBot.define do
  factory :booking do
    customer factory: %i[user customer]
    vendor_profile factory: %i[vendor_profile]
    service { association :service, vendor_profile: vendor_profile }

    event_date { 1.week.from_now }
    event_location { Faker::Address.full_address }
    total_amount { Faker::Number.decimal(l_digits: 3, r_digits: 2) }
    status { :pending }
    requirements { Faker::Lorem.paragraph }
    special_instructions { Faker::Lorem.sentence }
    event_duration { "#{rand(2..8)} hours" }

    transient do
      vendor { nil }
    end

    after(:build) do |booking, evaluator|
      booking.vendor_profile = evaluator.vendor.vendor_profile if evaluator.vendor.present?
    end

    trait :with_end_date do
      event_end_date { event_date + rand(2..8).hours }
    end

    trait :pending do
      status { :pending }
    end

    trait :accepted do
      status { :accepted }
    end

    trait :declined do
      status { :declined }
    end

    trait :completed do
      status { :completed }
    end

    trait :cancelled do
      status { :cancelled }
    end

    trait :counter_offered do
      status { :counter_offered }
    end

    trait :upcoming do
      event_date { rand(1..30).days.from_now }
    end

    trait :past do
      event_date { rand(1..30).days.ago }
    end

    trait :today do
      event_date { Time.current.beginning_of_day + rand(8..18).hours }
    end

    trait :with_messages do
      after(:create) do |booking|
        create_list(:booking_message, 3, booking: booking, sender: booking.customer)
        create_list(:booking_message, 2, booking: booking, sender: booking.vendor)
      end
    end
  end
end
