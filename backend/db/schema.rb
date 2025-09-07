# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_09_07_062356) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "availability_slots", force: :cascade do |t|
    t.bigint "vendor_profile_id", null: false
    t.date "date", null: false
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.boolean "is_available", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["date", "is_available"], name: "index_availability_slots_on_date_and_is_available"
    t.index ["vendor_profile_id", "date"], name: "index_availability_slots_on_vendor_profile_id_and_date"
    t.index ["vendor_profile_id"], name: "index_availability_slots_on_vendor_profile_id"
  end

  create_table "booking_messages", force: :cascade do |t|
    t.bigint "booking_id", null: false
    t.bigint "sender_id", null: false
    t.text "message", null: false
    t.datetime "sent_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id", "sent_at"], name: "index_booking_messages_on_booking_id_and_sent_at"
    t.index ["booking_id"], name: "index_booking_messages_on_booking_id"
    t.index ["sender_id"], name: "index_booking_messages_on_sender_id"
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "customer_id", null: false
    t.bigint "vendor_id", null: false
    t.bigint "service_id", null: false
    t.datetime "event_date", null: false
    t.string "event_location", null: false
    t.decimal "total_amount", precision: 10, scale: 2, null: false
    t.integer "status", default: 0, null: false
    t.text "requirements"
    t.text "special_instructions"
    t.datetime "event_end_date"
    t.string "event_duration"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id", "status"], name: "index_bookings_on_customer_id_and_status"
    t.index ["customer_id"], name: "index_bookings_on_customer_id"
    t.index ["event_date"], name: "index_bookings_on_event_date"
    t.index ["service_id", "status"], name: "index_bookings_on_service_id_and_status"
    t.index ["service_id"], name: "index_bookings_on_service_id"
    t.index ["vendor_id", "status"], name: "index_bookings_on_vendor_id_and_status"
    t.index ["vendor_id"], name: "index_bookings_on_vendor_id"
  end

  create_table "customer_profiles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "phone"
    t.text "preferences"
    t.text "event_types"
    t.string "budget_range"
    t.string "location"
    t.string "company_name"
    t.integer "total_bookings", default: 0
    t.index ["budget_range"], name: "index_customer_profiles_on_budget_range"
    t.index ["location"], name: "index_customer_profiles_on_location"
    t.index ["user_id"], name: "index_customer_profiles_on_user_id"
  end

  create_table "portfolio_items", force: :cascade do |t|
    t.bigint "vendor_profile_id", null: false
    t.string "title", null: false
    t.text "description"
    t.string "category", null: false
    t.integer "display_order", default: 0, null: false
    t.boolean "is_featured", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_portfolio_items_on_category"
    t.index ["vendor_profile_id", "category"], name: "index_portfolio_items_on_vendor_and_category"
    t.index ["vendor_profile_id", "display_order"], name: "index_portfolio_items_on_vendor_and_order"
    t.index ["vendor_profile_id", "is_featured"], name: "index_portfolio_items_on_vendor_and_featured"
    t.index ["vendor_profile_id"], name: "index_portfolio_items_on_vendor_profile_id"
  end

  create_table "service_categories", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "slug"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_service_categories_on_slug", unique: true
  end

  create_table "service_images", force: :cascade do |t|
    t.bigint "service_id", null: false
    t.string "title"
    t.text "description"
    t.string "alt_text"
    t.integer "display_order", default: 0
    t.boolean "is_primary", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_id", "display_order"], name: "index_service_images_on_service_id_and_display_order"
    t.index ["service_id", "is_primary"], name: "index_service_images_on_service_id_and_is_primary"
    t.index ["service_id"], name: "index_service_images_on_service_id"
  end

  create_table "services", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "vendor_profile_id", null: false
    t.bigint "service_category_id", null: false
    t.decimal "base_price", precision: 10, scale: 2
    t.integer "pricing_type", default: 0
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_category_id", "status"], name: "index_services_on_service_category_id_and_status"
    t.index ["service_category_id"], name: "index_services_on_service_category_id"
    t.index ["status"], name: "index_services_on_status"
    t.index ["vendor_profile_id", "status"], name: "index_services_on_vendor_profile_id_and_status"
    t.index ["vendor_profile_id"], name: "index_services_on_vendor_profile_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "role", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "vendor_profiles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "business_name", null: false
    t.text "description"
    t.string "location"
    t.string "phone"
    t.string "website"
    t.text "service_categories"
    t.string "business_license"
    t.integer "years_experience", default: 0
    t.boolean "is_verified", default: false
    t.decimal "average_rating", precision: 3, scale: 2, default: "0.0"
    t.integer "total_reviews", default: 0
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.index ["business_name"], name: "index_vendor_profiles_on_business_name"
    t.index ["is_verified"], name: "index_vendor_profiles_on_is_verified"
    t.index ["latitude", "longitude"], name: "index_vendor_profiles_on_coordinates"
    t.index ["location"], name: "index_vendor_profiles_on_location"
    t.index ["user_id"], name: "index_vendor_profiles_on_user_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "availability_slots", "vendor_profiles"
  add_foreign_key "booking_messages", "bookings"
  add_foreign_key "booking_messages", "users", column: "sender_id"
  add_foreign_key "bookings", "services"
  add_foreign_key "bookings", "users", column: "customer_id"
  add_foreign_key "bookings", "users", column: "vendor_id"
  add_foreign_key "customer_profiles", "users"
  add_foreign_key "portfolio_items", "vendor_profiles"
  add_foreign_key "service_images", "services"
  add_foreign_key "services", "service_categories"
  add_foreign_key "services", "vendor_profiles"
  add_foreign_key "vendor_profiles", "users"
end
