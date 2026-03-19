class AddTrustMetricsIndexes < ActiveRecord::Migration[8.0]
  def change
    # Index for sorting/filtering reviews by helpful votes
    add_index :reviews, [:vendor_profile_id, :helpful_votes], order: { helpful_votes: :desc }

    # Index for common filtering pattern: vendor + status + helpful votes
    add_index :reviews, [:vendor_profile_id, :status, :helpful_votes],
              order: { helpful_votes: :desc },
              name: 'index_reviews_helpful_by_vendor_and_status'

    # Index for vendor response queries
    add_index :reviews, [:vendor_profile_id, :vendor_responded_at]

    # Index for response rate calculation (vendors with responses within 48h)
    add_index :bookings, [:vendor_profile_id, :vendor_first_response_at, :created_at],
              name: 'index_bookings_vendor_response_time'
  end
end
