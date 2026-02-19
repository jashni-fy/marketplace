class AddRatingStatsToServices < ActiveRecord::Migration[7.1]
  def change
    add_column :services, :average_rating, :decimal, precision: 3, scale: 2, default: 0.0
    add_column :services, :total_reviews, :integer, default: 0
    
    add_index :services, :average_rating
  end
end
