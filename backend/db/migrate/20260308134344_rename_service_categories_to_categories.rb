class RenameServiceCategoriesToCategories < ActiveRecord::Migration[8.0]
  def change
    rename_table :service_categories, :categories
  end
end
