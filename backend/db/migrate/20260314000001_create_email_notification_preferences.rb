# frozen_string_literal: true

class CreateEmailNotificationPreferences < ActiveRecord::Migration[8.0]
  def change
    create_table :email_notification_preferences do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }

      # Notification types
      t.boolean :booking_created, default: true, null: false
      t.boolean :booking_accepted, default: true, null: false
      t.boolean :booking_rejected, default: true, null: false
      t.boolean :booking_cancelled, default: true, null: false
      t.boolean :booking_reminder, default: true, null: false
      t.boolean :new_message, default: true, null: false
      t.boolean :review_received, default: true, null: false

      t.timestamps
    end
  end
end
