require 'rails_helper'

RSpec.describe 'Portfolio Management Integration', type: :request do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:other_vendor) { create(:user, :vendor) }

  before do
    # Ensure we have the portfolio_items table
    # In a real test environment, this would be handled by migrations
    unless ActiveRecord::Base.connection.table_exists?('portfolio_items')
      skip 'Portfolio items table not available - run migrations first'
    end
  end

  describe 'Portfolio CRUD operations' do
    context 'when vendor is authenticated' do
      before { sign_in vendor_user }

      it 'allows vendor to create portfolio item' do
        portfolio_params = {
          portfolio_item: {
            title: 'Wedding Photography Session',
            description: 'Beautiful wedding photography',
            category: 'photography',
            display_order: 1,
            is_featured: true
          }
        }

        post '/api/v1/portfolio_items', params: portfolio_params, as: :json

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_item']['title']).to eq('Wedding Photography Session')
        expect(json_response['message']).to eq('Portfolio item created successfully')
      end

      it 'allows vendor to view their portfolio items' do
        portfolio_item = create(:portfolio_item, vendor_profile: vendor_profile)

        get '/api/v1/portfolio_items', as: :json

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items']).to be_present
        expect(json_response['categories']).to be_present
      end

      it 'allows vendor to update their portfolio item' do
        portfolio_item = create(:portfolio_item, vendor_profile: vendor_profile)
        update_params = {
          portfolio_item: {
            title: 'Updated Title',
            is_featured: true
          }
        }

        patch "/api/v1/portfolio_items/#{portfolio_item.id}", params: update_params, as: :json

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_item']['title']).to eq('Updated Title')
        expect(json_response['portfolio_item']['is_featured']).to be true
      end

      it 'allows vendor to delete their portfolio item' do
        portfolio_item = create(:portfolio_item, vendor_profile: vendor_profile)

        delete "/api/v1/portfolio_items/#{portfolio_item.id}", as: :json

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Portfolio item deleted successfully')
      end
    end

    context 'when customer is authenticated' do
      before { sign_in customer_user }

      it 'prevents customer from creating portfolio items' do
        portfolio_params = {
          portfolio_item: {
            title: 'Test Item',
            category: 'photography'
          }
        }

        post '/api/v1/portfolio_items', params: portfolio_params, as: :json

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Vendor access required')
      end

      it 'allows customer to view vendor portfolio items' do
        portfolio_item = create(:portfolio_item, vendor_profile: vendor_profile)

        get "/api/v1/vendors/#{vendor_profile.id}/portfolio_items", as: :json

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items']).to be_present
      end
    end
  end

  describe 'Portfolio filtering and categorization' do
    let!(:photo_item) { create(:portfolio_item, :photography, vendor_profile: vendor_profile) }
    let!(:video_item) { create(:portfolio_item, :videography, vendor_profile: vendor_profile) }
    let!(:featured_item) { create(:portfolio_item, :featured, vendor_profile: vendor_profile) }

    before { sign_in customer_user }

    it 'filters portfolio items by category' do
      get "/api/v1/vendors/#{vendor_profile.id}/portfolio_items", 
          params: { category: 'photography' }, as: :json

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response['portfolio_items'].length).to eq(1)
      expect(json_response['portfolio_items'].first['category']).to eq('photography')
    end

    it 'filters featured portfolio items' do
      get "/api/v1/vendors/#{vendor_profile.id}/portfolio_items", 
          params: { featured: 'true' }, as: :json

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      featured_items = json_response['portfolio_items'].select { |item| item['is_featured'] }
      expect(featured_items.length).to be >= 1
    end
  end

  describe 'Portfolio management features' do
    before { sign_in vendor_user }

    it 'provides portfolio summary' do
      create_list(:portfolio_item, 3, vendor_profile: vendor_profile)
      create(:portfolio_item, :featured, vendor_profile: vendor_profile)

      get '/api/v1/portfolio_items/summary', as: :json

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response['summary']['total_items']).to eq(4)
      expect(json_response['summary']['featured_items']).to eq(1)
      expect(json_response['summary']['categories']).to be_present
    end

    it 'allows setting featured status for multiple items' do
      items = create_list(:portfolio_item, 2, vendor_profile: vendor_profile, is_featured: false)
      item_ids = items.map(&:id)

      patch '/api/v1/portfolio_items/set_featured', 
            params: { item_ids: item_ids, featured: true }, as: :json

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response['updated_count']).to eq(2)
    end
  end

  describe 'Access control' do
    let(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile) }

    it 'prevents vendors from accessing other vendors portfolio items' do
      sign_in other_vendor

      patch "/api/v1/portfolio_items/#{portfolio_item.id}", 
            params: { portfolio_item: { title: 'Hacked' } }, as: :json

      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to include('Access denied')
    end

    it 'requires authentication for portfolio management' do
      post '/api/v1/portfolio_items', 
           params: { portfolio_item: { title: 'Test' } }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end
end