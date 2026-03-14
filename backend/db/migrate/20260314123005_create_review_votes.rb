class CreateReviewVotes < ActiveRecord::Migration[8.0]
  def change
    create_table :review_votes do |t|
      t.references :review, null: false, foreign_key: true
      t.references :voter, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end

    # Prevent duplicate votes from same user on same review
    add_index :review_votes, [:review_id, :voter_id], unique: true

    # Index for finding votes by voter (for user's voting history)
    add_index :review_votes, [:voter_id, :created_at]
  end
end
