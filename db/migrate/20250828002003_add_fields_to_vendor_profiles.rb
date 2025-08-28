class AddFieldsToVendorProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :vendor_profiles, :business_name, :string, null: false
    add_column :vendor_profiles, :description, :text
    add_column :vendor_profiles, :location, :string
    add_column :vendor_profiles, :phone, :string
    add_column :vendor_profiles, :website, :string
    add_column :vendor_profiles, :service_categories, :text
    add_column :vendor_profiles, :business_license, :string
    add_column :vendor_profiles, :years_experience, :integer, default: 0
    add_column :vendor_profiles, :is_verified, :boolean, default: false
    add_column :vendor_profiles, :average_rating, :decimal, precision: 3, scale: 2, default: 0.0
    add_column :vendor_profiles, :total_reviews, :integer, default: 0
    
    add_index :vendor_profiles, :business_name
    add_index :vendor_profiles, :location
    add_index :vendor_profiles, :is_verified
  end
end
