class AddTrustFieldsToVendorProfiles < ActiveRecord::Migration[8.0]
  def change
    add_column :vendor_profiles, :instagram_handle, :string
    add_column :vendor_profiles, :facebook_url, :string
    add_column :vendor_profiles, :cancellation_policy, :text
    add_column :vendor_profiles, :response_time_hours, :decimal, precision: 5, scale: 2
    add_column :vendor_profiles, :completion_rate, :decimal, precision: 5, scale: 4
  end
end
