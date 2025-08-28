require 'rails_helper'

RSpec.describe Service, type: :model do
  describe 'associations' do
    it { should belong_to(:vendor_profile) }
    it { should belong_to(:service_category) }
    # Future associations (will be tested when models are created)
    # it { should have_many(:bookings).dependent(:destroy) }
    # it { should have_many(:service_images).dependent(:destroy) }
  end

  describe 'enums' do
    it { should define_enum_for(:pricing_type).with_values(hourly: 0, package: 1, custom: 2) }
    it { should define_enum_for(:status).with_values(draft: 0, active: 1, inactive: 2, archived: 3) }
  end

  describe 'validations' do
    subject { build(:service) }

    it { should validate_presence_of(:name) }
    it { should validate_length_of(:name).is_at_least(3).is_at_most(100) }
    
    it { should validate_presence_of(:description) }
    it { should validate_length_of(:description).is_at_least(50).is_at_most(2000) }
    
    # Base price validation is handled by custom validation for non-custom pricing
    it { should validate_numericality_of(:base_price).is_greater_than(0).is_less_than(1_000_000) }
    
    it { should validate_presence_of(:pricing_type) }
    it { should validate_presence_of(:status) }
    it { should validate_presence_of(:vendor_profile_id) }
    it { should validate_presence_of(:service_category_id) }

    describe 'custom validations' do
      describe 'base_price_required_for_non_custom_pricing' do
        it 'allows nil base_price for custom pricing' do
          vendor_user = create(:user, role: :vendor)
          category = create(:service_category)
          service = build(:service, pricing_type: :custom, base_price: nil, vendor_profile: vendor_user.vendor_profile, service_category: category)
          expect(service).to be_valid
        end

        it 'requires base_price for hourly pricing' do
          vendor_user = create(:user, role: :vendor)
          category = create(:service_category)
          service = build(:service, pricing_type: :hourly, base_price: nil, vendor_profile: vendor_user.vendor_profile, service_category: category)
          expect(service).not_to be_valid
          expect(service.errors[:base_price]).to include('must be present and greater than 0 for non-custom pricing')
        end

        it 'requires base_price for package pricing' do
          vendor_user = create(:user, role: :vendor)
          category = create(:service_category)
          service = build(:service, pricing_type: :package, base_price: 0, vendor_profile: vendor_user.vendor_profile, service_category: category)
          expect(service).not_to be_valid
          expect(service.errors[:base_price]).to include('must be present and greater than 0 for non-custom pricing')
        end
      end

      describe 'vendor_profile_belongs_to_vendor_user' do
        it 'is valid when vendor_profile belongs to vendor user' do
          vendor_user = create(:user, role: :vendor)
          category = create(:service_category)
          service = build(:service, vendor_profile: vendor_user.vendor_profile, service_category: category)
          
          expect(service).to be_valid
        end

        it 'is invalid when vendor_profile belongs to customer user' do
          customer_user = create(:user, role: :customer)
          # Create a separate vendor profile for the customer user (this should fail validation)
          vendor_profile = build(:vendor_profile, user: customer_user)
          category = create(:service_category)
          service = build(:service, vendor_profile: vendor_profile, service_category: category)
          
          expect(service).not_to be_valid
          expect(service.errors[:vendor_profile]).to include('must belong to a vendor user')
        end
      end
    end
  end

  describe 'scopes' do
    let(:vendor_user) { create(:user, role: :vendor) }
    let(:vendor_profile) { vendor_user.vendor_profile }
    let(:category) { create(:service_category) }
    let!(:active_service) { create(:service, status: :active, vendor_profile: vendor_profile, service_category: category) }
    let!(:draft_service) { create(:service, status: :draft, vendor_profile: vendor_profile, service_category: category) }
    let!(:inactive_service) { create(:service, status: :inactive, vendor_profile: vendor_profile, service_category: category) }

    describe '.active' do
      it 'returns only active services' do
        expect(Service.active).to include(active_service)
        expect(Service.active).not_to include(draft_service, inactive_service)
      end
    end

    describe '.draft' do
      it 'returns only draft services' do
        expect(Service.draft).to include(draft_service)
        expect(Service.draft).not_to include(active_service, inactive_service)
      end
    end

    describe '.by_category' do
      let(:other_category) { create(:service_category, name: 'Other Category', slug: 'other-category') }
      let!(:other_service) { create(:service, service_category: other_category, vendor_profile: vendor_profile) }

      it 'returns services for specific category' do
        expect(Service.by_category(category)).to include(active_service, draft_service, inactive_service)
        expect(Service.by_category(category)).not_to include(other_service)
      end
    end

    describe '.price_range' do
      let!(:cheap_service) { create(:service, base_price: 50, vendor_profile: vendor_profile, service_category: category) }
      let!(:expensive_service) { create(:service, base_price: 500, vendor_profile: vendor_profile, service_category: category) }

      it 'returns services within price range' do
        result = Service.price_range(40, 100)
        expect(result).to include(cheap_service)
        expect(result).not_to include(expensive_service)
      end
    end

    describe '.search_by_name' do
      let!(:photo_service) { create(:service, name: 'Wedding Photography', vendor_profile: vendor_profile, service_category: category) }
      let!(:video_service) { create(:service, name: 'Event Videography', vendor_profile: vendor_profile, service_category: category) }

      it 'returns services matching name search' do
        result = Service.search_by_name('photo')
        expect(result).to include(photo_service)
        expect(result).not_to include(video_service)
      end
    end
  end

  describe 'delegations' do
    let(:vendor_user) { create(:user, role: :vendor) }
    let(:vendor_profile) { vendor_user.vendor_profile }
    let(:category) { create(:service_category, name: 'Photography', slug: 'photography-test') }
    let(:service) { create(:service, vendor_profile: vendor_profile, service_category: category) }
    
    before do
      vendor_profile.update!(business_name: 'Test Business', location: 'Test City')
    end

    it 'delegates vendor attributes' do
      expect(service.vendor_business_name).to eq('Test Business')
      expect(service.vendor_location).to eq('Test City')
    end

    it 'delegates category name' do
      expect(service.category_name).to eq('Photography')
    end
  end

  describe 'instance methods' do
    let(:vendor_user) { create(:user, role: :vendor) }
    let(:vendor_profile) { vendor_user.vendor_profile }
    let(:category) { create(:service_category) }
    let(:service) { create(:service, vendor_profile: vendor_profile, service_category: category) }

    describe 'status methods' do
      it 'returns correct status booleans' do
        service.status = :active
        expect(service.active?).to be true
        expect(service.draft?).to be false

        service.status = :draft
        expect(service.draft?).to be true
        expect(service.active?).to be false
      end
    end

    describe 'pricing type methods' do
      it 'returns correct pricing type booleans' do
        service.pricing_type = :hourly
        expect(service.hourly_pricing?).to be true
        expect(service.package_pricing?).to be false

        service.pricing_type = :custom
        expect(service.custom_pricing?).to be true
        expect(service.hourly_pricing?).to be false
      end
    end

    describe '#formatted_base_price' do
      it 'returns custom quote for custom pricing' do
        service.pricing_type = :custom
        expect(service.formatted_base_price).to eq('Custom Quote')
      end

      it 'returns hourly rate for hourly pricing' do
        service.pricing_type = :hourly
        service.base_price = 100
        expect(service.formatted_base_price).to eq('100.0/hour')
      end

      it 'returns base price for package pricing' do
        service.pricing_type = :package
        service.base_price = 500
        expect(service.formatted_base_price).to eq('500.0')
      end
    end

    describe '#can_be_booked?' do
      let(:test_vendor_user) { create(:user, role: :vendor) }
      let(:test_vendor_profile) { test_vendor_user.vendor_profile }
      let(:test_category) { create(:service_category) }

      it 'returns true for active service with valid vendor' do
        service = create(:service, status: :active, vendor_profile: test_vendor_profile, service_category: test_category)
        expect(service.can_be_booked?).to be true
      end

      it 'returns false for inactive service' do
        service = create(:service, status: :inactive, vendor_profile: test_vendor_profile, service_category: test_category)
        expect(service.can_be_booked?).to be false
      end
    end

    describe '#short_description' do
      it 'returns full description if under limit' do
        service.description = 'Short description'
        expect(service.short_description(50)).to eq('Short description')
      end

      it 'truncates long description' do
        service.description = 'A' * 150
        result = service.short_description(100)
        expect(result.length).to be <= 103 # 100 + '...'
        expect(result).to end_with('...')
      end
    end
  end

  describe 'class methods' do
    describe '.featured' do
      let(:verified_vendor_user) { create(:user, role: :vendor) }
      let(:unverified_vendor_user) { create(:user, role: :vendor) }
      let(:category) { create(:service_category) }
      let!(:featured_service) do
        verified_vendor_user.vendor_profile.update!(is_verified: true, average_rating: 4.5)
        create(:service, status: :active, vendor_profile: verified_vendor_user.vendor_profile, service_category: category)
      end
      let!(:unfeatured_service) do
        unverified_vendor_user.vendor_profile.update!(is_verified: false, average_rating: 5.0)
        create(:service, status: :active, vendor_profile: unverified_vendor_user.vendor_profile, service_category: category)
      end

      it 'returns services from verified vendors only' do
        result = Service.featured
        expect(result).to include(featured_service)
        expect(result).not_to include(unfeatured_service)
      end

      it 'limits results to specified number' do
        # Create additional verified vendor users and services
        10.times do |i|
          vendor_user = create(:user, role: :vendor, email: "vendor#{i}@example.com")
          vendor_user.vendor_profile.update!(is_verified: true, average_rating: 4.0)
          create(:service, status: :active, vendor_profile: vendor_user.vendor_profile, service_category: category)
        end
        expect(Service.featured(3).count).to eq(3)
      end
    end

    describe '.search' do
      let(:search_vendor_user) { create(:user, role: :vendor) }
      let(:search_category) { create(:service_category) }
      let!(:photo_service) { create(:service, name: 'Photography', description: 'Wedding photos and more details to meet minimum length requirement', vendor_profile: search_vendor_user.vendor_profile, service_category: search_category) }
      let!(:video_service) { create(:service, name: 'Videography', description: 'Event videos and more details to meet minimum length requirement', vendor_profile: search_vendor_user.vendor_profile, service_category: search_category) }

      it 'searches by name and description' do
        result = Service.search('photo')
        expect(result).to include(photo_service)
        expect(result).not_to include(video_service)

        result = Service.search('wedding')
        expect(result).to include(photo_service)
      end

      it 'returns all services for blank query' do
        expect(Service.search('')).to include(photo_service, video_service)
      end
    end

    describe '.available_pricing_types' do
      it 'returns humanized pricing types' do
        result = Service.available_pricing_types
        expect(result).to include(['Hourly', 'hourly'], ['Package', 'package'], ['Custom', 'custom'])
      end
    end
  end
end
