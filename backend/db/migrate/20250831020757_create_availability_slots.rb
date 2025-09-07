class CreateAvailabilitySlots < ActiveRecord::Migration[7.1]
  def change
    create_table :availability_slots do |t|
      t.references :vendor_profile, null: false, foreign_key: true
      t.date :date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.boolean :is_available, default: true, null: false

      t.timestamps
    end

    add_index :availability_slots, [:vendor_profile_id, :date]
    add_index :availability_slots, [:date, :is_available]
  end
end
