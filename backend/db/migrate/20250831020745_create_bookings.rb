class CreateBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :bookings do |t|
      t.references :customer, null: false, foreign_key: { to_table: :users }
      t.references :vendor, null: false, foreign_key: { to_table: :users }
      t.references :service, null: false, foreign_key: true
      t.datetime :event_date, null: false
      t.string :event_location, null: false
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.integer :status, default: 0, null: false
      t.text :requirements
      t.text :special_instructions
      t.datetime :event_end_date
      t.string :event_duration

      t.timestamps
    end

    add_index :bookings, [:customer_id, :status]
    add_index :bookings, [:vendor_id, :status]
    add_index :bookings, [:service_id, :status]
    add_index :bookings, :event_date
  end
end
