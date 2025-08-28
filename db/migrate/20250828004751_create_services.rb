class CreateServices < ActiveRecord::Migration[7.1]
  def change
    create_table :services do |t|
      t.string :name
      t.text :description
      t.references :vendor_profile, null: false, foreign_key: true
      t.references :service_category, null: false, foreign_key: true
      t.decimal :base_price, precision: 10, scale: 2
      t.integer :pricing_type, default: 0
      t.integer :status, default: 0

      t.timestamps
    end
    
    add_index :services, [:service_category_id, :status]
    add_index :services, [:vendor_profile_id, :status]
    add_index :services, :status
  end
end
