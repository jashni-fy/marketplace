class AddCoordinatesToVendorProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :vendor_profiles, :latitude, :decimal, precision: 10, scale: 6
    add_column :vendor_profiles, :longitude, :decimal, precision: 10, scale: 6
    
    # Add index for geospatial queries
    add_index :vendor_profiles, [:latitude, :longitude], name: 'index_vendor_profiles_on_coordinates'
  end
end
