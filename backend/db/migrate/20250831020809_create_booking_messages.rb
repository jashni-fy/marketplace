class CreateBookingMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :booking_messages do |t|
      t.references :booking, null: false, foreign_key: true
      t.references :sender, null: false, foreign_key: { to_table: :users }
      t.text :message, null: false
      t.datetime :sent_at, null: false

      t.timestamps
    end

    add_index :booking_messages, [:booking_id, :sent_at]
  end
end
