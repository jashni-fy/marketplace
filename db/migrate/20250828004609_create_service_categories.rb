class CreateServiceCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :service_categories do |t|
      t.string :name
      t.text :description
      t.string :slug
      t.boolean :active, default: true

      t.timestamps
    end
    add_index :service_categories, :slug, unique: true
  end
end
