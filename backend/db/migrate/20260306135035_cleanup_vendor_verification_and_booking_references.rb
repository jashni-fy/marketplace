class CleanupVendorVerificationAndBookingReferences < ActiveRecord::Migration[7.1]
  def up
    # 1. Consolidate verification status before removing is_verified
    # If is_verified was true but status wasn't 'verified', set it to 'verified'
    execute <<-SQL
      UPDATE vendor_profiles 
      SET verification_status = 2 
      WHERE is_verified = true AND verification_status != 2;
    SQL

    # 2. Remove redundant is_verified column
    remove_column :vendor_profiles, :is_verified, :boolean, default: false

    # 3. Update Bookings table to reference VendorProfile instead of User
    # Add vendor_profile_id to bookings
    add_reference :bookings, :vendor_profile, foreign_key: true, index: true

    # Migrate data: Map user_id (vendor_id in bookings) to vendor_profiles.id
    execute <<-SQL
      UPDATE bookings b
      SET vendor_profile_id = vp.id
      FROM vendor_profiles vp
      WHERE b.vendor_id = vp.user_id;
    SQL

    # Change null constraint after migration
    change_column_null :bookings, :vendor_profile_id, false

    # Remove the old vendor_id (which pointed to users)
    remove_reference :bookings, :vendor, foreign_key: { to_table: :users }, index: true
  end

  def down
    # Re-add vendor_id reference to users
    add_reference :bookings, :vendor, foreign_key: { to_table: :users }, index: true

    # Restore data: Map vendor_profiles.user_id back to bookings.vendor_id
    execute <<-SQL
      UPDATE bookings b
      SET vendor_id = vp.user_id
      FROM vendor_profiles vp
      WHERE b.vendor_profile_id = vp.id;
    SQL

    change_column_null :bookings, :vendor_id, false

    # Remove vendor_profile_id
    remove_reference :bookings, :vendor_profile

    # Restore is_verified column
    add_column :vendor_profiles, :is_verified, :boolean, default: false

    # Restore data for is_verified
    execute <<-SQL
      UPDATE vendor_profiles 
      SET is_verified = true 
      WHERE verification_status = 2;
    SQL
  end
end
