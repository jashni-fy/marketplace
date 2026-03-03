class AddRobustFieldsToServiceCategories < ActiveRecord::Migration[7.1]
  def change
    add_column :service_categories, :icon, :string
    add_column :service_categories, :ancestry, :string
    add_index :service_categories, :ancestry
    add_column :service_categories, :metadata, :jsonb, default: {}
  end
end
