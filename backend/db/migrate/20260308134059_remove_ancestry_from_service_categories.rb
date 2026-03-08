class RemoveAncestryFromServiceCategories < ActiveRecord::Migration[8.0]
  def change
    remove_index :service_categories, :ancestry, if_exists: true
    remove_column :service_categories, :ancestry, :string
  end
end
