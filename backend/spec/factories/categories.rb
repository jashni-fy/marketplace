# frozen_string_literal: true

# == Schema Information
#
# Table name: categories
#
#  id          :bigint           not null, primary key
#  active      :boolean          default(TRUE)
#  description :text
#  icon        :string
#  metadata    :jsonb
#  name        :string
#  slug        :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_categories_on_slug  (slug) UNIQUE
#
FactoryBot.define do
  factory :category do
    sequence(:name) { |n| "Category #{n}" }
    description { 'This is a detailed description of the category that meets the minimum length requirement.' }
    slug { nil }
    active { true }

    trait :inactive do
      active { false }
    end

    trait :photography do
      name { 'Photography' }
      description { 'Professional photography services for events, portraits, and commercial needs' }
    end

    trait :videography do
      name { 'Videography' }
      description { 'Video production and filming services for events, marketing, and entertainment' }
    end

    trait :event_management do
      name { 'Event Management' }
      description { 'Complete event planning and coordination services for all types of occasions' }
    end
  end
end
