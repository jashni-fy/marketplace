class CreateServiceImages < ActiveRecord::Migration[7.1]
  def change
    create_table :service_images do |t|
      t.references :service, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.string :alt_text
      t.integer :display_order, default: 0
      t.boolean :is_primary, default: false

      t.timestamps
    end

    add_index :service_images, [:service_id, :display_order]
    add_index :service_images, [:service_id, :is_primary]
  end
end
