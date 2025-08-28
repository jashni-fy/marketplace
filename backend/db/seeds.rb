# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Seed service categories
puts "Seeding service categories..."
ServiceCategory.seed_predefined_categories
puts "Service categories seeded: #{ServiceCategory.count} categories"

# Create admin user for development
if Rails.env.development?
  User.find_or_create_by!(email: 'admin@example.com') do |user|
    user.first_name = 'Admin'
    user.last_name = 'User'
    user.password = 'password123'
    user.password_confirmation = 'password123'
    user.role = :admin
    user.confirmed_at = Time.current
  end
  
  AdminUser.find_or_create_by!(email: 'admin@example.com') do |admin|
    admin.password = 'password'
    admin.password_confirmation = 'password'
  end
end