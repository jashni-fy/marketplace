class RemoveAncestryFromServiceCategories < ActiveRecord::Migration[7.1]
  def change
    remove_index :service_categories, :ancestry, if_exists: true
    remove_column :service_categories, :ancestry, :string
  end
end
