class AddTrustFieldsToReviews < ActiveRecord::Migration[8.0]
  def change
    add_column :reviews, :vendor_response, :text
    add_column :reviews, :vendor_responded_at, :datetime
    add_column :reviews, :helpful_votes, :integer, default: 0, null: false
  end
end
