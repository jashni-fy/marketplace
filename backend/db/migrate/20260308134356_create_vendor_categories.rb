class CreateVendorCategories < ActiveRecord::Migration[8.0]
  def change
    # Remove existing foreign keys and columns from services
    remove_index :services, :service_category_id, if_exists: true
    remove_index :services, [:vendor_profile_id, :status], if_exists: true
    remove_index :services, [:service_category_id, :status], if_exists: true
    remove_column :services, :service_category_id, :bigint
    remove_column :services, :vendor_profile_id, :bigint

    # Create vendor_services join table
    create_table :vendor_services do |t|
      t.references :vendor_profile, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true
      t.timestamps
    end

    add_index :vendor_services, [:vendor_profile_id, :service_id], unique: true
  end
end
