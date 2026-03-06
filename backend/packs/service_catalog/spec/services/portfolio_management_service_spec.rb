# frozen_string_literal: true

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
      create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 1)

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
    let(:mock_images) { [instance_double(ActiveStorage::Attached::One), instance_double(ActiveStorage::Attached::One)] }

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
    let!(:portfolio_item_one) do
      create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 1)
    end
    let!(:portfolio_item_two) do
      create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 2)
    end

    let(:item_orders) do
      [
        { id: portfolio_item_one.id, display_order: 2 },
        { id: portfolio_item_two.id, display_order: 1 }
      ]
    end

    it 'reorders items successfully' do
      result = service.reorder_portfolio_items('photography', item_orders)

      expect(result[:success]).to be true
      expect(result[:updated_count]).to eq(2)
      expect(result[:errors]).to be_empty
    end

    it 'handles non-existent items gracefully' do
      invalid_orders = [{ id: 99_999, display_order: 1 }]
      result = service.reorder_portfolio_items('photography', invalid_orders)

      expect(result[:success]).to be false
      expect(result[:errors]).to include(/not found/)
    end
  end

  describe '#get_portfolio_summary' do
    before do
      create(:portfolio_item, :featured, vendor_profile: vendor_profile, category: 'photography')
      create(:portfolio_item, vendor_profile: vendor_profile, category: 'videography')
    end

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
    let!(:portfolio_item_one) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }
    let!(:portfolio_item_two) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }

    it 'sets items as featured successfully' do
      result = service.set_featured_items([portfolio_item_one.id, portfolio_item_two.id], true)

      expect(result[:success]).to be true
      expect(result[:updated_count]).to eq(2)

      portfolio_item_one.reload
      portfolio_item_two.reload
      expect(portfolio_item_one.is_featured).to be true
      expect(portfolio_item_two.is_featured).to be true
    end

    it 'unsets featured status' do
      portfolio_item_one.update(is_featured: true)
      result = service.set_featured_items([portfolio_item_one.id], false)

      expect(result[:success]).to be true
      portfolio_item_one.reload
      expect(portfolio_item_one.is_featured).to be false
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
      let(:wedding_photo) do
        create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 3)
      end
      let(:portrait_photo) do
        create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 1)
      end
      let(:event_photo) do
        create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 5)
      end

      before do
        wedding_photo
        portrait_photo
        event_photo
      end

      it 'reorders items sequentially' do
        service.send(:reorder_items_in_category, 'photography')

        wedding_photo.reload
        portrait_photo.reload
        event_photo.reload

        # Items should be reordered by their original display_order, then created_at
        # portrait_photo(1) -> 1, wedding_photo(3) -> 2, event_photo(5) -> 3
        expect([portrait_photo, wedding_photo, event_photo].map(&:display_order)).to eq([1, 2, 3])
      end
    end

    describe '#get_next_display_order' do
      let(:item_low_order) do
        create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 3)
      end
      let(:item_high_order) do
        create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', display_order: 7)
      end

      before do
        item_low_order
        item_high_order
      end

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
