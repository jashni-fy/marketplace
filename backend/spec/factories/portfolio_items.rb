# frozen_string_literal: true

# == Schema Information
#
# Table name: portfolio_items
#
#  id                :bigint           not null, primary key
#  category          :string           not null
#  description       :text
#  display_order     :integer          default(0), not null
#  is_featured       :boolean          default(FALSE), not null
#  title             :string           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  vendor_profile_id :bigint           not null
#
# Indexes
#
#  index_portfolio_items_on_category             (category)
#  index_portfolio_items_on_vendor_and_category  (vendor_profile_id,category)
#  index_portfolio_items_on_vendor_and_featured  (vendor_profile_id,is_featured)
#  index_portfolio_items_on_vendor_and_order     (vendor_profile_id,display_order)
#  index_portfolio_items_on_vendor_profile_id    (vendor_profile_id)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
FactoryBot.define do
  factory :portfolio_item do
    vendor_profile
    title { Faker::Lorem.words(number: 3).join(' ').titleize }
    description { Faker::Lorem.paragraph(sentence_count: 3) }
    category { %w[photography videography event_planning catering music].sample }
    display_order { rand(0..10) }
    is_featured { [true, false].sample }

    trait :featured do
      is_featured { true }
      category { 'event_planning' }
      title { 'Featured Event Planning' }
      description { 'Premium event planning services' }
    end

    trait :photography do
      category { 'photography' }
      title { 'Wedding Photography Session' }
      description { 'Beautiful wedding photography capturing your special moments' }
    end

    trait :videography do
      category { 'videography' }
      title { 'Event Videography' }
      description { 'Professional event videography services' }
    end

    trait :with_images do
      after(:create) do |portfolio_item|
        # In a real test environment, you would attach actual test images
        # For now, we'll just mock the attachment
        allow(portfolio_item.images).to receive(:attached?).and_return(true)
        allow(portfolio_item.images).to receive(:count).and_return(3)
      end
    end
  end
end
