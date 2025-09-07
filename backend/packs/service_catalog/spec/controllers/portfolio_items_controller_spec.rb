require 'rails_helper'

RSpec.describe PortfolioItemsController, type: :controller do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:other_vendor_user) { create(:user, :vendor) }
  let(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile) }

  describe 'GET #index' do
    context 'when accessing vendor specific portfolio' do
      let!(:portfolio_item1) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'weddings') }
      let!(:portfolio_item2) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'events') }

      it 'returns vendor portfolio items' do
        get :index, params: { vendor_profile_id: vendor_profile.id }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items'].length).to eq(2)
        expect(json_response['categories']).to be_an(Array)
      end

      it 'filters by category' do
        get :index, params: { vendor_profile_id: vendor_profile.id, category: 'weddings' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items'].length).to eq(1)
        expect(json_response['portfolio_items'].first['category']).to eq('weddings')
      end

      it 'filters by featured items' do
        featured_item = create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true)
        
        get :index, params: { vendor_profile_id: vendor_profile.id, featured: 'true' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items'].length).to eq(1)
        expect(json_response['portfolio_items'].first['is_featured']).to be true
      end
    end

    context 'when accessing own portfolio as vendor' do
      before { sign_in vendor_user }

      let!(:own_item) { create(:portfolio_item, vendor_profile: vendor_profile) }

      it 'returns own portfolio items' do
        get :index

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items'].length).to eq(1)
        expect(json_response['portfolio_items'].first['id']).to eq(own_item.id)
      end
    end

    context 'when vendor profile does not exist' do
      it 'returns not found' do
        get :index, params: { vendor_profile_id: 999999 }

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Vendor profile not found')
      end
    end
  end

  describe 'GET #show' do
    it 'returns the portfolio item' do
      get :show, params: { id: portfolio_item.id }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['portfolio_item']['id']).to eq(portfolio_item.id)
      expect(json_response['portfolio_item']['title']).to eq(portfolio_item.title)
    end

    context 'when portfolio item does not exist' do
      it 'returns not found' do
        get :show, params: { id: 999999 }

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Portfolio item not found')
      end
    end
  end

  describe 'POST #create' do
    context 'when authenticated as vendor' do
      before { sign_in vendor_user }

      let(:valid_params) do
        {
          portfolio_item: {
            title: 'New Portfolio Item',
            description: 'A beautiful portfolio piece',
            category: 'weddings',
            display_order: 1,
            is_featured: false
          }
        }
      end

      it 'creates a new portfolio item' do
        expect {
          post :create, params: valid_params
        }.to change(PortfolioItem, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Portfolio item created successfully')
        expect(json_response['portfolio_item']['title']).to eq('New Portfolio Item')
      end

      context 'with invalid parameters' do
        let(:invalid_params) do
          {
            portfolio_item: {
              title: '',
              description: 'Description without title'
            }
          }
        end

        it 'returns unprocessable entity' do
          expect {
            post :create, params: invalid_params
          }.not_to change(PortfolioItem, :count)

          expect(response).to have_http_status(:unprocessable_entity)
          json_response = JSON.parse(response.body)
          expect(json_response['errors']).to be_an(Array)
        end
      end
    end

    context 'when authenticated as customer' do
      before { sign_in customer_user }

      it 'returns forbidden' do
        post :create, params: { portfolio_item: { title: 'Test' } }

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Vendor access required')
      end
    end
  end

  describe 'PUT #update' do
    context 'when user owns the portfolio item' do
      before { sign_in vendor_user }

      let(:update_params) do
        {
          id: portfolio_item.id,
          portfolio_item: {
            title: 'Updated Title',
            description: 'Updated description'
          }
        }
      end

      it 'updates the portfolio item' do
        put :update, params: update_params

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Portfolio item updated successfully')
        expect(json_response['portfolio_item']['title']).to eq('Updated Title')
      end
    end

    context 'when user does not own the portfolio item' do
      before { sign_in other_vendor_user }

      it 'returns forbidden' do
        put :update, params: { 
          id: portfolio_item.id, 
          portfolio_item: { title: 'Hacked' } 
        }

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Access denied')
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when user owns the portfolio item' do
      before { sign_in vendor_user }

      it 'deletes the portfolio item' do
        item_to_delete = create(:portfolio_item, vendor_profile: vendor_profile)
        
        expect {
          delete :destroy, params: { id: item_to_delete.id }
        }.to change(PortfolioItem, :count).by(-1)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Portfolio item deleted successfully')
      end
    end

    context 'when user does not own the portfolio item' do
      before { sign_in other_vendor_user }

      it 'returns forbidden' do
        delete :destroy, params: { id: portfolio_item.id }

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Access denied')
      end
    end
  end

  describe 'POST #upload_images' do
    before { sign_in vendor_user }

    let(:image_params) do
      {
        images: [
          fixture_file_upload('spec/fixtures/files/test_image.jpg', 'image/jpeg'),
          fixture_file_upload('spec/fixtures/files/test_image2.jpg', 'image/jpeg')
        ]
      }
    end

    it 'uploads images to portfolio item' do
      post :upload_images, params: { id: portfolio_item.id }.merge(image_params)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Images uploaded successfully')
      expect(json_response['images_uploaded']).to eq(2)
    end
  end

  describe 'DELETE #remove_image' do
    before { sign_in vendor_user }

    let(:portfolio_item_with_image) do
      item = create(:portfolio_item, vendor_profile: vendor_profile)
      item.images.attach(
        io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'test_image.jpg')),
        filename: 'test_image.jpg',
        content_type: 'image/jpeg'
      )
      item
    end

    it 'removes image from portfolio item' do
      image_id = portfolio_item_with_image.images.first.id
      
      delete :remove_image, params: { 
        id: portfolio_item_with_image.id, 
        image_id: image_id 
      }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Image removed successfully')
    end

    context 'when image does not exist' do
      it 'returns not found' do
        delete :remove_image, params: { 
          id: portfolio_item.id, 
          image_id: 999999 
        }

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Image not found')
      end
    end
  end

  describe 'GET #summary' do
    before { sign_in vendor_user }

    it 'returns portfolio summary' do
      create_list(:portfolio_item, 3, vendor_profile: vendor_profile)
      
      get :summary

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['summary']).to be_a(Hash)
    end
  end

  describe 'POST #reorder' do
    before { sign_in vendor_user }

    let!(:item1) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'weddings', display_order: 0) }
    let!(:item2) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'weddings', display_order: 1) }

    it 'reorders portfolio items' do
      post :reorder, params: { 
        category: 'weddings',
        item_orders: [
          { id: item2.id, display_order: 0 },
          { id: item1.id, display_order: 1 }
        ]
      }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to include('Successfully reordered')
    end
  end

  describe 'POST #duplicate' do
    before { sign_in vendor_user }

    it 'duplicates a portfolio item' do
      expect {
        post :duplicate, params: { id: portfolio_item.id }
      }.to change(PortfolioItem, :count).by(1)

      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Portfolio item duplicated successfully')
    end
  end

  describe 'PATCH #set_featured' do
    before { sign_in vendor_user }

    let!(:item1) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }
    let!(:item2) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }

    it 'sets items as featured' do
      patch :set_featured, params: { 
        item_ids: [item1.id, item2.id],
        featured: true
      }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to include('Successfully updated')
      expect(item1.reload.is_featured).to be true
      expect(item2.reload.is_featured).to be true
    end
  end
end