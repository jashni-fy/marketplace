# frozen_string_literal: true

class CreateInAppNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :in_app_notifications do |t|
      t.references :user, null: false, foreign_key: true, index: true

      t.string :title, null: false, limit: 255
      t.text :message, null: false
      t.string :notification_type, null: false, limit: 50
      t.string :related_type, limit: 50
      t.bigint :related_id

      t.boolean :is_read, default: false, null: false

      t.timestamps
    end

    add_index :in_app_notifications, :notification_type
    add_index :in_app_notifications, :is_read
    add_index :in_app_notifications, %i[user_id is_read created_at]
  end
end
