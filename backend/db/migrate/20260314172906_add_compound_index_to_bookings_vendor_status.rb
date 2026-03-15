# frozen_string_literal: true

class AddCompoundIndexToBookingsVendorStatus < ActiveRecord::Migration[8.0]
  def change
    # Compound index for vendor dashboard queries filtering by vendor, status, and date
    # Optimizes queries like: bookings.where(vendor_profile_id: vp, status: :completed)
    #                               .where('event_date > ?', date)
    add_index :bookings, %i[vendor_profile_id status event_date],
              name: 'index_bookings_vendor_status_date',
              if_not_exists: true,
              comment: 'Optimizes vendor dashboard filtering by status and event date'
  end
end
