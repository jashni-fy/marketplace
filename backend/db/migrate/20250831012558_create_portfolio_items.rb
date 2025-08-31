class CreatePortfolioItems < ActiveRecord::Migration[7.1]
  def change
    create_table :portfolio_items do |t|
      t.references :vendor_profile, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.string :category, null: false
      t.integer :display_order, default: 0, null: false
      t.boolean :is_featured, default: false, null: false

      t.timestamps
    end

    add_index :portfolio_items, [:vendor_profile_id, :display_order], name: 'index_portfolio_items_on_vendor_and_order'
    add_index :portfolio_items, [:vendor_profile_id, :category], name: 'index_portfolio_items_on_vendor_and_category'
    add_index :portfolio_items, [:vendor_profile_id, :is_featured], name: 'index_portfolio_items_on_vendor_and_featured'
    add_index :portfolio_items, :category
  end
end
