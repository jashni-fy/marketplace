# frozen_string_literal: true

module Mutations
  class ToggleFavorite < Mutations::BaseMutation
    argument :vendor_profile_id, ID, required: true

    field :errors, [String], null: false
    field :is_favorited, Boolean, null: false
    field :vendor_profile, Types::VendorProfileType, null: true

    def resolve(vendor_profile_id:)
      result = Favorites::ToggleFavorite.call(
        user: context[:current_user],
        vendor_profile_id: vendor_profile_id.to_i
      )

      if result[:success]
        vendor_profile = VendorProfile.find(vendor_profile_id)
        {
          is_favorited: result[:is_favorited],
          vendor_profile: vendor_profile,
          errors: []
        }
      else
        {
          is_favorited: false,
          vendor_profile: nil,
          errors: Array(result[:error])
        }
      end
    rescue StandardError => e
      {
        is_favorited: false,
        vendor_profile: nil,
        errors: [e.message]
      }
    end
  end
end
