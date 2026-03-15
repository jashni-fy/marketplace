# frozen_string_literal: true

class AddUniqueConstraintToVendorProfilesUserId < ActiveRecord::Migration[8.0]
  def change
    # Add database-level unique constraint to prevent race conditions
    # Rails validates_uniqueness_of is not sufficient; concurrent requests can bypass validation
    add_index :vendor_profiles, :user_id, unique: true, if_not_exists: true,
                                          comment: 'Ensures each user has at most one vendor profile'
  end
end
