class AddVendorFirstResponseAtToBookings < ActiveRecord::Migration[8.0]
  def change
    add_column :bookings, :vendor_first_response_at, :datetime
    add_index :bookings, :vendor_first_response_at
  end
end
