# frozen_string_literal: true

# == Schema Information
#
# Table name: service_categories
#
#  id          :bigint           not null, primary key
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  category_id :bigint           not null
#  service_id  :bigint           not null
#
# Indexes
#
#  index_service_categories_on_category_id                 (category_id)
#  index_service_categories_on_service_id                  (service_id)
#  index_service_categories_on_service_id_and_category_id  (service_id,category_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (category_id => categories.id)
#  fk_rails_...  (service_id => services.id)
#
require 'rails_helper'

RSpec.describe ServiceCategory do
  describe 'associations' do
    it { is_expected.to have_many(:services).dependent(:destroy) }
  end

  describe 'validations' do
    subject { build(:service_category) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_least(2).is_at_most(50) }

    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_length_of(:description).is_at_least(10).is_at_most(500) }

    # NOTE: slug presence is ensured by the callback, not direct validation
    it { is_expected.to validate_uniqueness_of(:slug) }
    it { is_expected.to allow_value('photography').for(:slug) }
    it { is_expected.to allow_value('event-management').for(:slug) }
    it { is_expected.to allow_value('makeup_beauty').for(:slug) }
    it { is_expected.not_to allow_value('Photography').for(:slug) }
    it { is_expected.not_to allow_value('event management').for(:slug) }
    it { is_expected.not_to allow_value('event@management').for(:slug) }
  end

  describe 'scopes' do
    let!(:active_category) { create(:service_category, active: true) }
    let!(:inactive_category) { create(:service_category, active: false) }

    describe '.active' do
      it 'returns only active categories' do
        expect(described_class.active).to include(active_category)
        expect(described_class.active).not_to include(inactive_category)
      end
    end

    describe '.inactive' do
      it 'returns only inactive categories' do
        expect(described_class.inactive).to include(inactive_category)
        expect(described_class.inactive).not_to include(active_category)
      end
    end

    describe '.ordered' do
      before do
        create(:service_category, name: 'Z Category')
        create(:service_category, name: 'A Category')
      end

      it 'returns categories ordered by name' do
        ordered_categories = described_class.ordered
        expect(ordered_categories.first.name).to eq('A Category')
        expect(ordered_categories.last.name).to eq('Z Category')
      end
    end
  end

  describe 'callbacks' do
    describe 'before_validation :generate_slug' do
      it 'generates slug from name when slug is blank' do
        category = build(:service_category, name: 'Event Management', slug: nil)
        category.valid?
        expect(category.slug).to eq('event-management')
      end

      it 'does not override existing slug' do
        category = build(:service_category, name: 'Event Management', slug: 'custom-slug')
        category.valid?
        expect(category.slug).to eq('custom-slug')
      end

      it 'handles special characters in name' do
        category = build(:service_category, name: 'DJ & Music Services!', slug: nil)
        category.valid?
        expect(category.slug).to eq('dj-music-services')
      end
    end
  end

  describe 'class methods' do
    describe '.seed_predefined_categories' do
      it 'creates all predefined categories' do
        expect { described_class.seed_predefined_categories }.to change(described_class, :count).by(10)
      end

      it 'does not create duplicates when run multiple times' do
        described_class.seed_predefined_categories
        expect { described_class.seed_predefined_categories }.not_to change(described_class, :count)
      end

      it 'creates categories with correct attributes' do
        described_class.seed_predefined_categories
        photography = described_class.find_by(slug: 'photography')

        expect(photography.name).to eq('Photography')
        expect(photography.description).to include('Professional photography services')
        expect(photography.active).to be true
      end
    end

    describe '.active_categories' do
      let!(:active_category) { create(:service_category, active: true, name: 'B Category') }
      let!(:inactive_category) { create(:service_category, active: false, name: 'A Category') }
      let!(:another_active) { create(:service_category, active: true, name: 'A Active') }

      it 'returns only active categories ordered by name' do
        result = described_class.active_categories
        expect(result).to include(active_category, another_active)
        expect(result).not_to include(inactive_category)
        expect(result.first.name).to eq('A Active')
      end
    end
  end

  describe 'instance methods' do
    let(:category) { create(:service_category) }

    describe '#active?' do
      it 'returns true when category is active' do
        category.active = true
        expect(category.active?).to be true
      end

      it 'returns false when category is inactive' do
        category.active = false
        expect(category.active?).to be false
      end
    end

    describe '#services_count' do
      it 'returns the number of associated services' do
        test_category = create(:service_category, name: 'Test Count Category', slug: 'test-count-category')

        # Create services with different vendor profiles
        3.times do |i|
          vendor_user = create(:user, role: :vendor, email: "vendor#{i}@example.com")
          # Use the vendor_profile created by the User callback
          create(:service, service_category: test_category, vendor_profile: vendor_user.vendor_profile)
        end

        expect(test_category.services_count).to eq(3)
      end
    end

    describe '#to_param' do
      it 'returns the slug for URL generation' do
        category.slug = 'photography'
        expect(category.to_param).to eq('photography')
      end
    end
  end

  describe 'constants' do
    describe 'PREDEFINED_CATEGORIES' do
      it 'contains expected categories' do
        expect(ServiceCategory::PREDEFINED_CATEGORIES).to be_an(Array)
        expect(ServiceCategory::PREDEFINED_CATEGORIES.length).to eq(10)

        category_names = ServiceCategory::PREDEFINED_CATEGORIES.pluck(:name)
        expect(category_names).to include('Photography', 'Videography', 'Event Management')
      end

      it 'has valid structure for each category' do
        ServiceCategory::PREDEFINED_CATEGORIES.each do |category|
          expect(category).to have_key(:name)
          expect(category).to have_key(:description)
          expect(category).to have_key(:slug)
          expect(category[:name]).to be_present
          expect(category[:description]).to be_present
          expect(category[:slug]).to be_present
        end
      end
    end
  end
end
