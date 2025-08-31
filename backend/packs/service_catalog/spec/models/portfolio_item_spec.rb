require 'rails_helper'

RSpec.describe PortfolioItem, type: :model do
  let(:vendor_profile) { create(:vendor_profile) }
  
  describe 'associations' do
    it { should belong_to(:vendor_profile) }
  end

  describe 'validations' do
    subject { build(:portfolio_item, vendor_profile: vendor_profile) }
    
    it { should validate_presence_of(:title) }
    it { should validate_length_of(:title).is_at_least(2).is_at_most(100) }
    it { should validate_length_of(:description).is_at_most(1000) }
    it { should validate_presence_of(:category) }
    it { should validate_length_of(:category).is_at_most(50) }
    it { should validate_presence_of(:display_order) }
    it { should validate_numericality_of(:display_order).is_greater_than_or_equal_to(0) }
    it { should validate_presence_of(:vendor_profile_id) }
  end

  describe 'scopes' do
    let!(:featured_item) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true) }
    let!(:regular_item) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }
    let!(:photography_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography') }
    let!(:videography_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'videography') }

    describe '.featured' do
      it 'returns only featured items' do
        expect(PortfolioItem.featured).to include(featured_item)
        expect(PortfolioItem.featured).not_to include(regular_item)
      end
    end

    describe '.by_category' do
      it 'returns items in specified category' do
        expect(PortfolioItem.by_category('photography')).to include(photography_item)
        expect(PortfolioItem.by_category('photography')).not_to include(videography_item)
      end
    end

    describe '.ordered' do
      let!(:first_item) { create(:portfolio_item, vendor_profile: vendor_profile, display_order: 1) }
      let!(:second_item) { create(:portfolio_item, vendor_profile: vendor_profile, display_order: 2) }

      it 'returns items ordered by display_order and created_at' do
        expect(PortfolioItem.ordered.first).to eq(first_item)
        expect(PortfolioItem.ordered.second).to eq(second_item)
      end
    end

    describe '.for_vendor' do
      let(:other_vendor) { create(:vendor_profile) }
      let!(:other_item) { create(:portfolio_item, vendor_profile: other_vendor) }

      it 'returns items for specified vendor only' do
        expect(PortfolioItem.for_vendor(vendor_profile)).to include(featured_item)
        expect(PortfolioItem.for_vendor(vendor_profile)).not_to include(other_item)
      end
    end
  end

  describe 'callbacks' do
    describe 'normalize_category' do
      it 'normalizes category to lowercase and strips whitespace' do
        item = create(:portfolio_item, vendor_profile: vendor_profile, category: '  PHOTOGRAPHY  ')
        expect(item.category).to eq('photography')
      end
    end
  end

  describe 'instance methods' do
    let(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile) }

    describe '#featured?' do
      it 'returns true when is_featured is true' do
        portfolio_item.update(is_featured: true)
        expect(portfolio_item.featured?).to be true
      end

      it 'returns false when is_featured is false' do
        portfolio_item.update(is_featured: false)
        expect(portfolio_item.featured?).to be false
      end
    end

    describe '#has_images?' do
      it 'returns true when images are attached' do
        # Mock image attachment
        allow(portfolio_item.images).to receive(:attached?).and_return(true)
        expect(portfolio_item.has_images?).to be true
      end

      it 'returns false when no images are attached' do
        expect(portfolio_item.has_images?).to be false
      end
    end

    describe '#image_count' do
      it 'returns the count of attached images' do
        allow(portfolio_item.images).to receive(:count).and_return(3)
        expect(portfolio_item.image_count).to eq(3)
      end
    end
  end

  describe 'class methods' do
    describe '.categories_for_vendor' do
      let!(:photo_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography') }
      let!(:video_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'videography') }
      let!(:duplicate_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography') }

      it 'returns unique categories for a vendor' do
        categories = PortfolioItem.categories_for_vendor(vendor_profile)
        expect(categories).to contain_exactly('photography', 'videography')
      end

      it 'returns sorted categories' do
        categories = PortfolioItem.categories_for_vendor(vendor_profile)
        expect(categories).to eq(['photography', 'videography'])
      end
    end

    describe '.featured_for_vendor' do
      let!(:featured_item1) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true, display_order: 2) }
      let!(:featured_item2) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true, display_order: 1) }
      let!(:regular_item) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }

      it 'returns only featured items for the vendor' do
        featured_items = PortfolioItem.featured_for_vendor(vendor_profile)
        expect(featured_items).to include(featured_item1, featured_item2)
        expect(featured_items).not_to include(regular_item)
      end

      it 'returns items in display order' do
        featured_items = PortfolioItem.featured_for_vendor(vendor_profile)
        expect(featured_items.first).to eq(featured_item2)
        expect(featured_items.second).to eq(featured_item1)
      end
    end
  end

  describe 'image validations' do
    let(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile) }

    describe 'images_count_limit' do
      it 'allows up to 10 images' do
        # Mock 10 images
        images = double('images', count: 10, attached?: true)
        allow(portfolio_item).to receive(:images).and_return(images)
        
        portfolio_item.valid?
        expect(portfolio_item.errors[:images]).to be_empty
      end

      it 'rejects more than 10 images' do
        # Mock 11 images
        images = double('images', count: 11, attached?: true)
        allow(portfolio_item).to receive(:images).and_return(images)
        
        portfolio_item.valid?
        expect(portfolio_item.errors[:images]).to include('cannot exceed 10 images per portfolio item')
      end
    end
  end
end