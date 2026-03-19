# frozen_string_literal: true

class CreateCustomerFavorites < ActiveRecord::Migration[8.0]
  def change
    create_table :customer_favorites do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.references :vendor_profile, null: false, foreign_key: true, index: true

      t.timestamps
    end

    # Prevent duplicate favorites for same customer + vendor
    add_index :customer_favorites, %i[user_id vendor_profile_id], unique: true

    # Add counter cache to vendor_profiles
    add_column :vendor_profiles, :favorites_count, :integer, default: 0, null: false
    add_index :vendor_profiles, :favorites_count
  end
end
