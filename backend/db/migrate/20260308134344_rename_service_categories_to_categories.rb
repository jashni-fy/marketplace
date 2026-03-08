class RenameServiceCategoriesToCategories < ActiveRecord::Migration[7.1]
  def change
    rename_table :service_categories, :categories
  end
end
