# frozen_string_literal: true

# == Schema Information
#
# Table name: availability_slots
#
#  id                :bigint           not null, primary key
#  date              :date             not null
#  end_time          :time             not null
#  is_available      :boolean          default(TRUE), not null
#  start_time        :time             not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  vendor_profile_id :bigint           not null
#
# Indexes
#
#  index_availability_slots_on_date_and_is_available       (date,is_available)
#  index_availability_slots_on_vendor_profile_id           (vendor_profile_id)
#  index_availability_slots_on_vendor_profile_id_and_date  (vendor_profile_id,date)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
FactoryBot.define do
  factory :availability_slot do
    vendor_profile

    date { rand(1..30).days.from_now.to_date }
    start_time { '09:00' }
    end_time { '17:00' }
    is_available { true }

    trait :today do
      date { Date.current }
    end

    trait :tomorrow do
      date { Date.current + 1.day }
    end

    trait :next_week do
      date { 1.week.from_now.to_date }
    end

    trait :unavailable do
      is_available { false }
    end

    trait :morning do
      start_time { '08:00' }
      end_time { '12:00' }
    end

    trait :afternoon do
      start_time { '13:00' }
      end_time { '17:00' }
    end

    trait :evening do
      start_time { '18:00' }
      end_time { '22:00' }
    end

    trait :full_day do
      start_time { '08:00' }
      end_time { '20:00' }
    end

    trait :short_slot do
      start_time { '14:00' }
      end_time { '16:00' }
    end

    trait :overnight do
      start_time { '22:00' }
      end_time { '06:00' }
    end
  end
end
