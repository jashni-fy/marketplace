# frozen_string_literal: true

class AddBookingReminderSentAtToBookings < ActiveRecord::Migration[8.0]
  def change
    add_column :bookings, :booking_reminder_sent_at, :datetime
    add_index :bookings, :booking_reminder_sent_at
  end
end
