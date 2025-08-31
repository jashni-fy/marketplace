require 'rails_helper'

RSpec.describe Api::V1::PortfolioItemsController, type: :controller do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:other_vendor) { create(:user, :vendor) }
  let(:other_vendor_profile) { other_vendor.vendor_profile }

  let!(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile) }
  let!(:featured_item) { create(:portfolio_item, :featured, vendor_profile: vendor_profile) }
  let!(:other_vendor_item) { create(:portfolio_item, vendor_profile: other_vendor_profile) }

  describe 'GET #index' do
    context 'when accessing public vendor portfolio' do
      before { sign_in customer_user }

      it 'returns portfolio items for specified vendor' do
        get :index, params: { vendor_profile_id: vendor_profile.id }
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items'].length).to eq(2)
        expect(json_response['categories']).to be_present
      end

      it 'filters by category when specified' do
        photography_item = create(:portfolio_item, :photography, vendor_profile: vendor_profile)
        
        get :index, params: { vendor_profile_id: vendor_profile.id, category: 'photography' }
        
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items'].length).to eq(1)
        expect(json_response['portfolio_items'].first['category']).to eq('photography')
      end

      it 'filters featured items when specified' do
        get :index, params: { vendor_profile_id: vendor_profile.id, featured: 'true' }
        
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items'].length).to eq(1)
        expect(json_response['portfolio_items'].first['is_featured']).to be true
      end

      it 'returns 404 for non-existent vendor' do
        get :index, params: { vendor_profile_id: 99999 }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Vendor profile not found')
      end
    end

    context 'when vendor accessing own portfolio' do
      before { sign_in vendor_user }

      it 'returns vendor\'s own portfolio items' do
        get :index
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items'].length).to eq(2)
        
        # Should not include other vendor's items
        item_ids = json_response['portfolio_items'].map { |item| item['id'] }
        expect(item_ids).not_to include(other_vendor_item.id)
      end
    end

    context 'when customer tries to access without vendor_profile_id' do
      before { sign_in customer_user }

      it 'returns forbidden error' do
        get :index
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Vendor access required')
      end
    end
  end

  describe 'GET #show' do
    before { sign_in customer_user }

    it 'returns portfolio item details' do
      get :show, params: { id: portfolio_item.id }
      
      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response['portfolio_item']['id']).to eq(portfolio_item.id)
      expect(json_response['portfolio_item']['title']).to eq(portfolio_item.title)
    end

    it 'returns 404 for non-existent portfolio item' do
      get :show, params: { id: 99999 }
      
      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to include('Portfolio item not found')
    end
  end

  describe 'POST #create' do
    let(:valid_params) do
      {
        portfolio_item: {
          title: 'New Portfolio Item',
          description: 'A great portfolio piece',
          category: 'photography',
          display_order: 1,
          is_featured: true
        }
      }
    end

    context 'when vendor is signed in' do
      before { sign_in vendor_user }

      it 'creates a new portfolio item' do
        expect {
          post :create, params: valid_params
        }.to change(PortfolioItem, :count).by(1)
        
        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_item']['title']).to eq('New Portfolio Item')
        expect(json_response['message']).to eq('Portfolio item created successfully')
      end

      it 'returns errors for invalid params' do
        invalid_params = { portfolio_item: { title: '' } }
        
        post :create, params: invalid_params
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to be_present
      end
    end

    context 'when customer is signed in' do
      before { sign_in customer_user }

      it 'returns forbidden error' do
        post :create, params: valid_params
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Vendor access required')
      end
    end

    context 'when not signed in' do
      it 'returns unauthorized error' do
        post :create, params: valid_params
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH #update' do
    let(:update_params) do
      {
        id: portfolio_item.id,
        portfolio_item: {
          title: 'Updated Title',
          is_featured: true
        }
      }
    end

    context 'when vendor owns the portfolio item' do
      before { sign_in vendor_user }

      it 'updates the portfolio item' do
        patch :update, params: update_params
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_item']['title']).to eq('Updated Title')
        expect(json_response['portfolio_item']['is_featured']).to be true
        expect(json_response['message']).to eq('Portfolio item updated successfully')
      end

      it 'returns errors for invalid params' do
        invalid_params = { id: portfolio_item.id, portfolio_item: { title: '' } }
        
        patch :update, params: invalid_params
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to be_present
      end
    end

    context 'when vendor does not own the portfolio item' do
      before { sign_in other_vendor }

      it 'returns forbidden error' do
        patch :update, params: update_params
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Access denied')
      end
    end

    context 'when customer is signed in' do
      before { sign_in customer_user }

      it 'returns forbidden error' do
        patch :update, params: update_params
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Access denied')
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when vendor owns the portfolio item' do
      before { sign_in vendor_user }

      it 'deletes the portfolio item' do
        expect {
          delete :destroy, params: { id: portfolio_item.id }
        }.to change(PortfolioItem, :count).by(-1)
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Portfolio item deleted successfully')
      end
    end

    context 'when vendor does not own the portfolio item' do
      before { sign_in other_vendor }

      it 'returns forbidden error' do
        delete :destroy, params: { id: portfolio_item.id }
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Access denied')
      end
    end
  end

  describe 'POST #upload_images' do
    let(:image_file) { fixture_file_upload('spec/fixtures/files/test_image.jpg', 'image/jpeg') }
    
    context 'when vendor owns the portfolio item' do
      before { sign_in vendor_user }

      it 'uploads images to portfolio item' do
        # Mock the image attachment
        allow_any_instance_of(PortfolioItem).to receive(:save).and_return(true)
        
        post :upload_images, params: { id: portfolio_item.id, images: [image_file] }
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Images uploaded successfully')
      end

      it 'returns error when no images provided' do
        post :upload_images, params: { id: portfolio_item.id }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('No images provided')
      end
    end

    context 'when vendor does not own the portfolio item' do
      before { sign_in other_vendor }

      it 'returns forbidden error' do
        post :upload_images, params: { id: portfolio_item.id, images: [image_file] }
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Access denied')
      end
    end
  end

  describe 'DELETE #remove_image' do
    let(:image_id) { 1 }
    
    context 'when vendor owns the portfolio item' do
      before { sign_in vendor_user }

      it 'removes image from portfolio item' do
        # Mock image finding and purging
        image_double = double('image')
        allow(portfolio_item.images).to receive(:find).with(image_id.to_s).and_return(image_double)
        allow(image_double).to receive(:purge)
        
        delete :remove_image, params: { id: portfolio_item.id, image_id: image_id }
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Image removed successfully')
      end

      it 'returns 404 when image not found' do
        allow(portfolio_item.images).to receive(:find).and_raise(ActiveRecord::RecordNotFound)
        
        delete :remove_image, params: { id: portfolio_item.id, image_id: 99999 }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Image not found')
      end
    end
  end
end