class CreateServiceCategoryAssociations < ActiveRecord::Migration[8.0]
  def change
    create_table :service_categories do |t|
      t.references :service, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.timestamps
    end

    add_index :service_categories, [:service_id, :category_id], unique: true
  end
end
