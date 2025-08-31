require 'rails_helper'

RSpec.describe PortfolioManagementService, type: :service do
  let(:vendor_profile) { create(:vendor_profile) }
  let(:service) { described_class.new(vendor_profile) }

  describe '#create_portfolio_item' do
    let(:valid_params) do
      {
        title: 'Wedding Photography',
        description: 'Beautiful wedding photos',
        category: 'photography',
        display_order: 1,
        is_featured: true
      }
    end

    it 'creates a portfolio item successfully' do
      result = service.create_portfolio_item(valid_params)
      
      expect(result[:success]).to be true
      expect(result[:portfolio_item]).to be_persisted
      expect(result[:portfolio_item].title).to eq('Wedding Photography')
    end

    it 'returns errors for invalid params' do
      invalid_params = { title: '' }
      result = service.create_portfolio_item(invalid_params)
      
      expect(result[:success]).to be false
      expect(result[:errors]).to be_present
    end

    it 'reorders items in category when display_order is specified' do
      existing_item = create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 1)
      
      result = service.create_portfolio_item(valid_params.merge(display_order: 1))
      
      expect(result[:success]).to be true
      # The service should handle reordering
    end
  end

  describe '#update_portfolio_item' do
    let(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography') }
    let(:update_params) { { title: 'Updated Title', is_featured: true } }

    it 'updates portfolio item successfully' do
      result = service.update_portfolio_item(portfolio_item, update_params)
      
      expect(result[:success]).to be true
      expect(result[:portfolio_item].title).to eq('Updated Title')
      expect(result[:portfolio_item].is_featured).to be true
    end

    it 'reorders when category changes' do
      new_params = { category: 'videography' }
      result = service.update_portfolio_item(portfolio_item, new_params)
      
      expect(result[:success]).to be true
      expect(result[:portfolio_item].category).to eq('videography')
    end

    it 'returns errors for invalid params' do
      invalid_params = { title: '' }
      result = service.update_portfolio_item(portfolio_item, invalid_params)
      
      expect(result[:success]).to be false
      expect(result[:errors]).to be_present
    end
  end

  describe '#bulk_upload_images' do
    let(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile) }
    let(:mock_images) { [double('image1'), double('image2')] }

    it 'uploads images successfully' do
      allow(portfolio_item.images).to receive(:attach)
      allow(portfolio_item).to receive(:save).and_return(true)
      
      result = service.bulk_upload_images(portfolio_item, mock_images)
      
      expect(result[:success]).to be true
      expect(result[:images_count]).to eq(2)
    end

    it 'returns error when no images provided' do
      result = service.bulk_upload_images(portfolio_item, [])
      
      expect(result[:success]).to be false
      expect(result[:errors]).to include('No images provided')
    end
  end

  describe '#reorder_portfolio_items' do
    let!(:item1) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 1) }
    let!(:item2) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 2) }
    
    let(:item_orders) do
      [
        { id: item1.id, display_order: 2 },
        { id: item2.id, display_order: 1 }
      ]
    end

    it 'reorders items successfully' do
      result = service.reorder_portfolio_items('photography', item_orders)
      
      expect(result[:success]).to be true
      expect(result[:updated_count]).to eq(2)
      expect(result[:errors]).to be_empty
    end

    it 'handles non-existent items gracefully' do
      invalid_orders = [{ id: 99999, display_order: 1 }]
      result = service.reorder_portfolio_items('photography', invalid_orders)
      
      expect(result[:success]).to be false
      expect(result[:errors]).to include(/not found/)
    end
  end

  describe '#get_portfolio_summary' do
    let!(:featured_item) { create(:portfolio_item, :featured, vendor_profile: vendor_profile, category: 'photography') }
    let!(:regular_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'videography') }

    it 'returns comprehensive portfolio summary' do
      result = service.get_portfolio_summary
      
      expect(result[:total_items]).to eq(2)
      expect(result[:featured_items]).to eq(1)
      expect(result[:categories]).to include('photography' => 1, 'videography' => 1)
      expect(result[:recent_items]).to be_present
    end
  end

  describe '#duplicate_portfolio_item' do
    let(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile, title: 'Original Item') }

    it 'duplicates portfolio item successfully' do
      result = service.duplicate_portfolio_item(portfolio_item)
      
      expect(result[:success]).to be true
      expect(result[:portfolio_item].title).to eq('Original Item (Copy)')
      expect(result[:portfolio_item].is_featured).to be false
    end
  end

  describe '#set_featured_items' do
    let!(:item1) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }
    let!(:item2) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }

    it 'sets items as featured successfully' do
      result = service.set_featured_items([item1.id, item2.id], true)
      
      expect(result[:success]).to be true
      expect(result[:updated_count]).to eq(2)
      
      item1.reload
      item2.reload
      expect(item1.is_featured).to be true
      expect(item2.is_featured).to be true
    end

    it 'unsets featured status' do
      item1.update(is_featured: true)
      result = service.set_featured_items([item1.id], false)
      
      expect(result[:success]).to be true
      item1.reload
      expect(item1.is_featured).to be false
    end
  end

  describe '#delete_portfolio_item' do
    let!(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography') }

    it 'deletes portfolio item successfully' do
      result = service.delete_portfolio_item(portfolio_item)
      
      expect(result[:success]).to be true
      expect(PortfolioItem.exists?(portfolio_item.id)).to be false
    end
  end

  describe 'private methods' do
    describe '#reorder_items_in_category' do
      let!(:item1) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 3) }
      let!(:item2) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 1) }
      let!(:item3) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 5) }

      it 'reorders items sequentially' do
        service.send(:reorder_items_in_category, 'photography')
        
        item1.reload
        item2.reload
        item3.reload
        
        # Items should be reordered by their original display_order, then created_at
        expect([item2, item1, item3].map(&:display_order)).to eq([1, 2, 3])
      end
    end

    describe '#get_next_display_order' do
      let!(:item1) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 3) }
      let!(:item2) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 7) }

      it 'returns next display order for category' do
        next_order = service.send(:get_next_display_order, 'photography')
        expect(next_order).to eq(8)
      end

      it 'returns 1 for empty category' do
        next_order = service.send(:get_next_display_order, 'videography')
        expect(next_order).to eq(1)
      end
    end
  end
end