class CreateCustomerProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :customer_profiles do |t|
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
