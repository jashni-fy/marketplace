# frozen_string_literal: true

# == Schema Information
#
# Table name: vendor_services
#
#  id                :bigint           not null, primary key
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  service_id        :bigint           not null
#  vendor_profile_id :bigint           not null
#
# Indexes
#
#  index_vendor_services_on_service_id                        (service_id)
#  index_vendor_services_on_vendor_profile_id                 (vendor_profile_id)
#  index_vendor_services_on_vendor_profile_id_and_service_id  (vendor_profile_id,service_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
class VendorService < ApplicationRecord
  # Associations
  belongs_to :vendor_profile
  belongs_to :service

  # Validations
  validates :vendor_profile_id, uniqueness: { scope: :service_id }
end
