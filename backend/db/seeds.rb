# frozen_string_literal: true

# This file contains mock data for Jashnify to showcase frontend features.
# It is idempotent and can be run multiple times.

puts "🚀 Starting database seeding..."

# 1. Seed Service Categories
puts "--- Seeding Service Categories ---"
ServiceCategory.seed_predefined_categories
puts "Total categories: #{ServiceCategory.count}"

# 2. Create Admin
puts "--- Creating Admin ---"
admin = User.find_or_create_by!(email: 'admin@example.com') do |u|
  u.first_name = 'Jashnify'
  u.last_name = 'Admin'
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.role = :admin
  u.confirmed_at = Time.current
end
AdminUser.find_or_create_by!(email: 'admin@example.com') do |au|
  au.password = 'password'
  au.password_confirmation = 'password'
end

# 3. Create Customers
puts "--- Creating Customers ---"
customers = []
['Rahul Sharma', 'Anjali Gupta', 'Vikram Singh'].each_with_index do |name, i|
  first, last = name.split(' ')
  customer = User.find_or_create_by!(email: "customer#{i+1}@example.com") do |u|
    u.first_name = first
    u.last_name = last
    u.password = 'password123'
    u.password_confirmation = 'password123'
    u.role = :customer
    u.confirmed_at = Time.current
  end
  customers << customer
end

# 4. Create Vendors (Photographers)
puts "--- Creating Photographers ---"
vendor_data = [
  {
    name: 'Arjun Mehra',
    business: 'Arjun Mehra Photography',
    location: 'Mumbai, Maharashtra',
    verified: true,
    experience: 8,
    description: 'Specializing in cinematic wedding photography and candid moments. Capturing your special day with a timeless touch.'
  },
  {
    name: 'Priya Iyer',
    business: 'Pixel Perfect Studios',
    location: 'Bangalore, Karnataka',
    verified: true,
    experience: 5,
    description: 'Expert in high-end fashion and commercial photography. We bring your vision to life with precision and creativity.'
  },
  {
    name: 'Siddharth Roy',
    business: 'Sid Visuals',
    location: 'Delhi, NCR',
    verified: false,
    experience: 3,
    description: 'New age photographer focused on street style and contemporary portraits. Let\'s make something cool together.'
  }
]

photography_cat = ServiceCategory.find_by(slug: 'photography')
videography_cat = ServiceCategory.find_by(slug: 'videography')

vendors = []
vendor_data.each_with_index do |data, i|
  first, last = data[:name].split(' ')
  user = User.find_or_create_by!(email: "vendor#{i+1}@example.com") do |u|
    u.first_name = first
    u.last_name = last
    u.password = 'password123'
    u.password_confirmation = 'password123'
    u.role = :vendor
    u.confirmed_at = Time.current
  end

  profile = user.vendor_profile
  profile.update!(
    business_name: data[:business],
    location: data[:location],
    description: data[:description],
    years_experience: data[:experience],
    verification_status: data[:verified] ? :verified : :unverified,
    is_verified: data[:verified],
    verified_at: data[:verified] ? Time.current : nil,
    phone: "+91 98765 4321#{i}",
    website: "https://www.#{data[:business].parameterize}.com"
  )
  vendors << profile
end

# 4.5 Create Availability Slots
puts "--- Creating Availability Slots ---"
vendors.each do |vendor|
  # Create availability for the next 30 days
  (0..30).each do |day|
    AvailabilitySlot.find_or_create_by!(
      vendor_profile: vendor,
      date: Date.current + day.days
    ) do |slot|
      slot.start_time = "09:00"
      slot.end_time = "21:00"
      slot.is_available = true
    end
  end
end

# 5. Create Services
puts "--- Creating Services ---"
vendors.each do |vendor|
  # Service 1
  Service.find_or_create_by!(name: "Wedding Essentials Package", vendor_profile: vendor) do |s|
    s.description = "Full day coverage including 2 photographers, cinematic highlights video, and 300+ edited high-resolution images."
    s.service_category = photography_cat
    s.base_price = 75000
    s.pricing_type = :package
    s.status = :active
  end

  # Service 2
  Service.find_or_create_by!(name: "Pre-Wedding Shoot", vendor_profile: vendor) do |s|
    s.description = "A 4-hour creative shoot at your preferred location. Includes 2 outfit changes and 50 edited digital copies."
    s.service_category = photography_cat
    s.base_price = 25000
    s.pricing_type = :package
    s.status = :active
  end
end

# 6. Create Portfolio Items
puts "--- Creating Portfolio Items ---"
vendors.each do |vendor|
  ['Weddings', 'Portraits', 'Events'].each_with_index do |cat, i|
    PortfolioItem.find_or_create_by!(title: "#{cat} Showcase #{i+1}", vendor_profile: vendor) do |p|
      p.category = cat
      p.description = "A selection of my best work in #{cat} photography."
      p.is_featured = (i == 0)
      p.display_order = i
    end
  end
end

# 7. Create Bookings & Reviews
puts "--- Creating Bookings & Reviews ---"
# Arjun (Vendor 0) has a few completed bookings from Rahul (Customer 0)
arjun = vendors[0]
priya = vendors[1]
sid = vendors[2]

booking_data = [
  { customer: customers[0], vendor: arjun, service: arjun.services.first, status: :completed, rating: 5, comment: "Arjun was absolutely amazing! The photos exceeded our expectations. Highly recommend." },
  { customer: customers[1], vendor: arjun, service: arjun.services.first, status: :completed, rating: 4, comment: "Great experience, very professional. Quality was top notch." },
  { customer: customers[2], vendor: priya, service: priya.services.first, status: :completed, rating: 5, comment: "Priya is a true professional. Her eye for detail is unmatched." },
  { customer: customers[0], vendor: sid, service: sid.services.first, status: :completed, rating: 3, comment: "Decent work, but communication could have been better." }
]

booking_data.each do |data|
  booking = Booking.new(
    customer: data[:customer],
    vendor: data[:vendor].user,
    service: data[:service],
    event_date: 1.month.ago,
    event_location: 'Mumbai',
    total_amount: data[:service].base_price,
    status: data[:status]
  )
  booking.save!(validate: false)

  if data[:status] == :completed
    Review.create!(
      booking: booking,
      customer: data[:customer],
      vendor_profile: data[:vendor],
      service: data[:service],
      rating: data[:rating],
      quality_rating: data[:rating],
      communication_rating: [data[:rating]-1, 1].max,
      value_rating: data[:rating],
      punctuality_rating: 5,
      comment: data[:comment]
    )
  end
end

# Add some pending bookings for the dashboard
Booking.create!(
  customer: customers[1],
  vendor: arjun.user,
  service: arjun.services.first,
  event_date: 1.week.from_now,
  event_location: 'Goa',
  total_amount: arjun.services.first.base_price,
  status: :pending
)

puts "✅ Seeding complete!"
puts "Summary:"
puts "- Users: #{User.count}"
puts "- Vendor Profiles: #{VendorProfile.count}"
puts "- Services: #{Service.count}"
puts "- Bookings: #{Booking.count}"
puts "- Reviews: #{Review.count}"
