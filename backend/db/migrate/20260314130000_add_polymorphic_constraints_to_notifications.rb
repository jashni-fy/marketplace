# frozen_string_literal: true

class AddPolymorphicConstraintsToNotifications < ActiveRecord::Migration[8.0]
  def change
    # Add CHECK constraint for valid polymorphic types
    add_check_constraint(
      :in_app_notifications,
      "related_type IS NULL OR related_type IN ('Booking', 'Review', 'BookingMessage')",
      name: 'check_notification_related_type_valid'
    )

    # Add composite index for efficient polymorphic lookups
    add_index(
      :in_app_notifications,
      [:related_type, :related_id],
      name: 'index_notifications_on_polymorphic'
    )

    # Improve the user + read status query pattern
    add_index(
      :in_app_notifications,
      [:user_id, :is_read, :created_at],
      name: 'idx_notifications_user_read_date'
    )
  end
end
