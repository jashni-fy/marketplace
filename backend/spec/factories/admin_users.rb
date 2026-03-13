# frozen_string_literal: true

FactoryBot.define do
  factory :admin_user do
    email { 'admin@example.com' }
    first_name { 'Admin' }
    last_name { 'User' }
    role { :admin }
  end
end
