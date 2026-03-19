class AddTrustMetricsConstraints < ActiveRecord::Migration[8.0]
  def up
    # Constraint: completion_rate must be between 0.0 and 1.0
    execute <<-SQL
      ALTER TABLE vendor_profiles
      ADD CONSTRAINT check_completion_rate_valid
        CHECK (completion_rate IS NULL OR (completion_rate >= 0 AND completion_rate <= 1.0));
    SQL

    # Constraint: response_time_hours must be non-negative
    execute <<-SQL
      ALTER TABLE vendor_profiles
      ADD CONSTRAINT check_response_time_non_negative
        CHECK (response_time_hours IS NULL OR response_time_hours >= 0);
    SQL

    # Constraint: helpful_votes must be non-negative
    execute <<-SQL
      ALTER TABLE reviews
      ADD CONSTRAINT check_helpful_votes_non_negative
        CHECK (helpful_votes >= 0);
    SQL

    # Constraint: vendor_first_response_at must be after booking creation
    execute <<-SQL
      ALTER TABLE bookings
      ADD CONSTRAINT check_vendor_response_after_creation
        CHECK (vendor_first_response_at IS NULL OR vendor_first_response_at >= created_at);
    SQL
  end

  def down
    execute "ALTER TABLE vendor_profiles DROP CONSTRAINT check_completion_rate_valid;"
    execute "ALTER TABLE vendor_profiles DROP CONSTRAINT check_response_time_non_negative;"
    execute "ALTER TABLE reviews DROP CONSTRAINT check_helpful_votes_non_negative;"
    execute "ALTER TABLE bookings DROP CONSTRAINT check_vendor_response_after_creation;"
  end
end
