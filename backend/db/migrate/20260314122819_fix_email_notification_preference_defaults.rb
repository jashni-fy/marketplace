class FixEmailNotificationPreferenceDefaults < ActiveRecord::Migration[8.0]
  def change
    change_column_default :email_notification_preferences, :review_received, from: false, to: true
    # Update existing records that have review_received as false
    execute "UPDATE email_notification_preferences SET review_received = true WHERE review_received = false"
  end
end
