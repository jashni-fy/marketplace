# frozen_string_literal: true

class AddVendorProfileIdToServices < ActiveRecord::Migration[8.0]
  def change
    add_column :services, :vendor_profile_id, :bigint, null: true
    add_foreign_key :services, :vendor_profiles, column: :vendor_profile_id
    add_index :services, :vendor_profile_id
    add_index :services, [:vendor_profile_id, :status]

    # Data migration: Backfill service vendor_profile_id from vendor_services join table
    # Delete any orphaned services that have no vendor association
    reversible do |dir|
      dir.up do
        # First, backfill services that have vendors
        execute <<~SQL
          UPDATE services
          SET vendor_profile_id = vs.vendor_profile_id
          FROM vendor_services vs
          WHERE services.id = vs.service_id
          AND services.vendor_profile_id IS NULL
        SQL

        # Then delete associated bookings and reviews for orphaned services
        execute <<~SQL
          DELETE FROM booking_messages
          WHERE booking_id IN (
            SELECT id FROM bookings WHERE service_id IN (
              SELECT id FROM services WHERE vendor_profile_id IS NULL
            )
          )
        SQL

        execute <<~SQL
          DELETE FROM reviews
          WHERE service_id IN (
            SELECT id FROM services WHERE vendor_profile_id IS NULL
          )
        SQL

        execute <<~SQL
          DELETE FROM bookings
          WHERE service_id IN (
            SELECT id FROM services WHERE vendor_profile_id IS NULL
          )
        SQL

        # Finally delete orphaned services (with no vendor)
        execute <<~SQL
          DELETE FROM services
          WHERE vendor_profile_id IS NULL
        SQL
      end
    end

    # After backfill, make the column non-nullable
    change_column_null :services, :vendor_profile_id, false
  end
end
