# frozen_string_literal: true

# == Schema Information
#
# Table name: service_categories
#
#  id          :bigint           not null, primary key
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  category_id :bigint           not null
#  service_id  :bigint           not null
#
# Indexes
#
#  index_service_categories_on_category_id                 (category_id)
#  index_service_categories_on_service_id                  (service_id)
#  index_service_categories_on_service_id_and_category_id  (service_id,category_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (category_id => categories.id)
#  fk_rails_...  (service_id => services.id)
#
FactoryBot.define do
  factory :service_category do
    service
    category
  end
end
