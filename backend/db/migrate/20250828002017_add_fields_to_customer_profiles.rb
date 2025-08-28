class AddFieldsToCustomerProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :customer_profiles, :phone, :string
    add_column :customer_profiles, :preferences, :text
    add_column :customer_profiles, :event_types, :text
    add_column :customer_profiles, :budget_range, :string
    add_column :customer_profiles, :location, :string
    add_column :customer_profiles, :company_name, :string
    add_column :customer_profiles, :total_bookings, :integer, default: 0
    
    add_index :customer_profiles, :location
    add_index :customer_profiles, :budget_range
  end
end
