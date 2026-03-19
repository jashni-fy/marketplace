# frozen_string_literal: true

FactoryBot.define do
  factory :review_vote do
    review factory: %i[review]
    voter factory: %i[user customer]
  end
end
