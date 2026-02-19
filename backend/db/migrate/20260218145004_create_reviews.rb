class CreateReviews < ActiveRecord::Migration[7.1]
  def change
    create_table :reviews do |t|
      t.references :booking, null: false, foreign_key: true, index: { unique: true }
      t.references :customer, null: false, foreign_key: { to_table: :users }
      t.references :vendor_profile, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true
      t.integer :rating, null: false
      t.integer :quality_rating
      t.integer :communication_rating
      t.integer :value_rating
      t.integer :punctuality_rating
      t.text :comment
      t.integer :status, default: 0 # 0: published, 1: hidden

      t.timestamps
    end

    add_index :reviews, :rating
    add_index :reviews, :status
    add_index :reviews, [:vendor_profile_id, :status]
    add_index :reviews, [:service_id, :status]
  end
end
