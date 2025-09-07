#!/usr/bin/env ruby

require_relative 'config/environment'

# Create test data
customer = User.create!(
  email: 'customer@test.com',
  password: 'password123',
  first_name: 'Test',
  last_name: 'Customer',
  role: 'customer',
  confirmed_at: Time.current
)

vendor = User.create!(
  email: 'vendor@test.com',
  password: 'password123',
  first_name: 'Test',
  last_name: 'Vendor',
  role: 'vendor',
  confirmed_at: Time.current
)

service = Service.create!(
  vendor_profile: vendor.vendor_profile,
  name: 'Test Service',
  description: 'Test Description',
  base_price: 100.00,
  pricing_type: 'hourly',
  status: 'active'
)

event_date = 1.week.from_now.change(hour: 10, min: 0)

availability_slot = AvailabilitySlot.create!(
  vendor_profile: vendor.vendor_profile,
  date: event_date.to_date,
  start_time: '09:00',
  end_time: '17:00',
  is_available: true
)

puts "Created test data:"
puts "Customer: #{customer.id}"
puts "Vendor: #{vendor.id}"
puts "Service: #{service.id}"
puts "Availability Slot: #{availability_slot.id}"
puts "Event Date: #{event_date}"

# Test the service
booking_service = BookingCreationService.new(
  customer: customer,
  service_id: service.id,
  event_date: event_date,
  event_end_date: event_date + 2.hours,
  event_location: 'Test Location',
  total_amount: 500.00,
  requirements: 'Test requirements',
  special_instructions: 'Test instructions',
  event_duration: '2 hours'
)

puts "\nTesting BookingCreationService..."
puts "Valid? #{booking_service.valid?}"
puts "Errors: #{booking_service.errors.full_messages}"

result = booking_service.call
puts "Result: #{result}"
puts "Errors after call: #{booking_service.errors.full_messages}"

if booking_service.booking
  puts "Booking created: #{booking_service.booking.id}"
  puts "Booking errors: #{booking_service.booking.errors.full_messages}"
else
  puts "No booking created"
end