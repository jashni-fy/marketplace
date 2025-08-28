require 'rails_helper'

RSpec.describe CustomerProfile, type: :model do
  let(:customer_user) { create(:user, :customer) }
  let(:customer_profile) { customer_user.customer_profile }

  describe 'associations' do
    it { should belong_to(:user) }
  end

  describe 'validations' do
    subject { customer_profile }

    it { should validate_presence_of(:user_id) }
    it { should validate_uniqueness_of(:user_id) }
    it { should validate_length_of(:preferences).is_at_most(1000) }
    it { should validate_length_of(:location).is_at_most(255) }
    it { should validate_length_of(:company_name).is_at_most(100) }
    it { should validate_numericality_of(:total_bookings).is_greater_than_or_equal_to(0) }

    describe 'phone validation' do
      it 'accepts valid phone numbers' do
        valid_phones = ['+1-555-123-4567', '555-123-4567', '(555) 123-4567', '+44 20 7946 0958']
        valid_phones.each do |phone|
          customer_profile.phone = phone
          expect(customer_profile).to be_valid, "#{phone} should be valid"
        end
      end

      it 'rejects invalid phone numbers' do
        invalid_phones = ['123', 'abc-def-ghij', '555-12-34567890123456']
        invalid_phones.each do |phone|
          customer_profile.phone = phone
          expect(customer_profile).not_to be_valid, "#{phone} should be invalid"
        end
      end

      it 'allows blank phone numbers' do
        customer_profile.phone = ''
        expect(customer_profile).to be_valid
      end
    end
  end

  describe 'enums' do
    it 'defines budget_range enum' do
      expect(CustomerProfile.budget_ranges.keys).to include(
        'under_500', 'between_500_1000', 'between_1000_2500', 
        'between_2500_5000', 'over_5000', 'custom'
      )
    end

    it 'uses prefix for budget enum methods' do
      test_customer_profile = create(:user, :customer).customer_profile
      test_customer_profile.update!(budget_range: 'under_500')
      expect(test_customer_profile.budget_under_500?).to be true
      expect(test_customer_profile.budget_over_5000?).to be false
    end
  end

  describe 'scopes' do
    let!(:ny_customer) { create(:user, :customer).customer_profile.tap { |cp| cp.update!(location: 'New York, NY') } }
    let!(:la_customer) { create(:user, :customer).customer_profile.tap { |cp| cp.update!(location: 'Los Angeles, CA') } }
    let!(:high_budget_customer) { create(:user, :customer).customer_profile.tap { |cp| cp.update!(budget_range: 'over_5000') } }
    let!(:company_customer) { create(:user, :customer).customer_profile.tap { |cp| cp.update!(company_name: 'Test Company') } }
    let!(:frequent_customer) { create(:user, :customer).customer_profile.tap { |cp| cp.update!(total_bookings: 10) } }

    describe '.by_location' do
      it 'finds customers by location' do
        expect(CustomerProfile.by_location('New York')).to include(ny_customer)
        expect(CustomerProfile.by_location('New York')).not_to include(la_customer)
      end
    end

    describe '.by_budget_range' do
      it 'finds customers by budget range' do
        expect(CustomerProfile.by_budget_range('over_5000')).to include(high_budget_customer)
        expect(CustomerProfile.by_budget_range('under_500')).not_to include(high_budget_customer)
      end
    end

    describe '.with_company' do
      it 'returns customers with company names' do
        expect(CustomerProfile.with_company).to include(company_customer)
        expect(CustomerProfile.with_company).not_to include(ny_customer)
      end
    end

    describe '.frequent_customers' do
      it 'returns customers with 5 or more bookings' do
        expect(CustomerProfile.frequent_customers).to include(frequent_customer)
        expect(CustomerProfile.frequent_customers).not_to include(ny_customer)
      end
    end
  end

  describe 'instance methods' do
    let(:complete_customer_profile) do
      create(:user, :customer).customer_profile.tap do |cp|
        cp.update!(
          phone: '+1-555-987-6543',
          preferences: 'I prefer vendors with excellent reviews and professional portfolios.',
          event_types: 'Wedding, Anniversary, Corporate Event',
          location: 'New York, NY'
        )
      end
    end

    describe '#event_types_list' do
      it 'returns array of event types' do
        complete_customer_profile.update(event_types: 'Wedding, Corporate Event, Birthday Party')
        expect(complete_customer_profile.event_types_list).to eq(['Wedding', 'Corporate Event', 'Birthday Party'])
      end

      it 'returns empty array when no event types' do
        complete_customer_profile.update(event_types: '')
        expect(complete_customer_profile.event_types_list).to eq([])
      end
    end

    describe '#event_types_list=' do
      it 'sets event types from array' do
        complete_customer_profile.event_types_list = ['Wedding', 'Corporate Event']
        expect(complete_customer_profile.event_types).to eq('Wedding, Corporate Event')
      end

      it 'sets event types from string' do
        complete_customer_profile.event_types_list = 'Wedding, Corporate Event'
        expect(complete_customer_profile.event_types).to eq('Wedding, Corporate Event')
      end
    end

    describe '#budget_range_display' do
      it 'returns formatted budget range for under_500' do
        complete_customer_profile.update(budget_range: 'under_500')
        expect(complete_customer_profile.budget_range_display).to eq('Under $500')
      end

      it 'returns formatted budget range for 500_1000' do
        complete_customer_profile.update(budget_range: 'between_500_1000')
        expect(complete_customer_profile.budget_range_display).to eq('$500 - $1,000')
      end

      it 'returns formatted budget range for over_5000' do
        complete_customer_profile.update(budget_range: 'over_5000')
        expect(complete_customer_profile.budget_range_display).to eq('Over $5,000')
      end

      it 'returns not specified for nil budget range' do
        complete_customer_profile.update(budget_range: nil)
        expect(complete_customer_profile.budget_range_display).to eq('Not specified')
      end
    end

    describe '#profile_complete?' do
      it 'returns true when location and event_types are present' do
        expect(complete_customer_profile.profile_complete?).to be true
      end

      it 'returns false when location is missing' do
        complete_customer_profile.update(location: '')
        expect(complete_customer_profile.profile_complete?).to be false
      end

      it 'returns false when event_types is missing' do
        complete_customer_profile.update(event_types: '')
        expect(complete_customer_profile.profile_complete?).to be false
      end
    end

    describe '#display_name' do
      it 'returns company_name when present' do
        complete_customer_profile.update(company_name: 'Test Company')
        expect(complete_customer_profile.display_name).to eq('Test Company')
      end

      it 'returns user full_name when company_name is blank' do
        complete_customer_profile.update(company_name: '')
        expect(complete_customer_profile.display_name).to eq(complete_customer_profile.user.full_name)
      end
    end

    describe '#is_frequent_customer?' do
      it 'returns true for customers with 5 or more bookings' do
        complete_customer_profile.update(total_bookings: 5)
        expect(complete_customer_profile.is_frequent_customer?).to be true
      end

      it 'returns false for customers with less than 5 bookings' do
        complete_customer_profile.update(total_bookings: 3)
        expect(complete_customer_profile.is_frequent_customer?).to be false
      end
    end

    describe '#customer_tier' do
      it 'returns New Customer for 0 bookings' do
        complete_customer_profile.update(total_bookings: 0)
        expect(complete_customer_profile.customer_tier).to eq('New Customer')
      end

      it 'returns Regular Customer for 1-2 bookings' do
        complete_customer_profile.update(total_bookings: 2)
        expect(complete_customer_profile.customer_tier).to eq('Regular Customer')
      end

      it 'returns Valued Customer for 3-9 bookings' do
        complete_customer_profile.update(total_bookings: 5)
        expect(complete_customer_profile.customer_tier).to eq('Valued Customer')
      end

      it 'returns VIP Customer for 10+ bookings' do
        complete_customer_profile.update(total_bookings: 15)
        expect(complete_customer_profile.customer_tier).to eq('VIP Customer')
      end
    end
  end

  describe 'class methods' do
    describe '.search_by_name_or_location' do
      let!(:user1) { create(:user, :customer, first_name: 'John', last_name: 'Smith') }
      let!(:user2) { create(:user, :customer, first_name: 'Jane', last_name: 'Doe') }
      let!(:customer1) { user1.customer_profile.tap { |cp| cp.update!(location: 'New York', company_name: 'Smith Corp') } }
      let!(:customer2) { user2.customer_profile.tap { |cp| cp.update!(location: 'Los Angeles', company_name: '') } }

      it 'finds customers by first name' do
        results = CustomerProfile.search_by_name_or_location('John')
        expect(results).to include(customer1)
        expect(results).not_to include(customer2)
      end

      it 'finds customers by last name' do
        results = CustomerProfile.search_by_name_or_location('Doe')
        expect(results).to include(customer2)
        expect(results).not_to include(customer1)
      end

      it 'finds customers by company name' do
        results = CustomerProfile.search_by_name_or_location('Smith Corp')
        expect(results).to include(customer1)
        expect(results).not_to include(customer2)
      end

      it 'finds customers by location' do
        results = CustomerProfile.search_by_name_or_location('Los Angeles')
        expect(results).to include(customer2)
        expect(results).not_to include(customer1)
      end

      it 'returns all customers when query is blank' do
        results = CustomerProfile.search_by_name_or_location('')
        expect(results.count).to eq(2)
      end
    end
  end
end