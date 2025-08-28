require 'rails_helper'

RSpec.describe Api::V1::ServiceImagesController, type: :controller do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:service) { create(:service, vendor_profile: vendor_user.vendor_profile) }
  let(:other_service) { create(:service) }
  
  let(:valid_image_params) do
    {
      service_image: {
        image: fixture_file_upload('spec/fixtures/files/test_image.jpg', 'image/jpeg'),
        title: 'Test Image',
        description: 'A test image for our service',
        alt_text: 'Test image alt text',
        display_order: 0
      }
    }
  end

  let(:invalid_image_params) do
    {
      service_image: {
        title: 'Test Image without image file'
      }
    }
  end

  describe 'authentication and authorization' do
    context 'when not authenticated' do
      it 'returns unauthorized for all actions' do
        get :index, params: { service_id: service.id }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as customer' do
      before { sign_in_api_user(customer_user) }

      it 'returns forbidden for all actions' do
        get :index, params: { service_id: service.id }
        expect(response).to have_http_status(:forbidden)
        expect(json_response['error']).to eq('Only vendors can manage service images')
      end
    end

    context 'when authenticated as vendor but not service owner' do
      before { sign_in_api_user(vendor_user) }

      it 'returns not found for other vendor services' do
        get :index, params: { service_id: other_service.id }
        expect(response).to have_http_status(:not_found)
        expect(json_response['error']).to eq('Service not found')
      end
    end
  end

  describe 'GET #index' do
    before { sign_in_api_user(vendor_user) }
    
    let!(:image1) { create(:service_image, service: service, display_order: 1) }
    let!(:image2) { create(:service_image, service: service, display_order: 0) }

    it 'returns service images ordered by display_order' do
      get :index, params: { service_id: service.id }
      
      expect(response).to have_http_status(:ok)
      expect(json_response['service_images'].count).to eq(2)
      expect(json_response['service_images'].first['id']).to eq(image2.id)
      expect(json_response['service_images'].second['id']).to eq(image1.id)
    end

    it 'includes image URLs and metadata' do
      get :index, params: { service_id: service.id }
      
      image_data = json_response['service_images'].first
      expect(image_data).to include(
        'id', 'title', 'description', 'alt_text', 'display_order',
        'is_primary', 'thumbnail_url', 'medium_url', 'file_size_mb'
      )
    end
  end

  describe 'GET #show' do
    before { sign_in_api_user(vendor_user) }
    
    let!(:service_image) { create(:service_image, service: service) }

    it 'returns detailed service image information' do
      get :show, params: { service_id: service.id, id: service_image.id }
      
      expect(response).to have_http_status(:ok)
      image_data = json_response['service_image']
      expect(image_data).to include(
        'id', 'title', 'description', 'alt_text', 'display_order',
        'is_primary', 'thumbnail_url', 'medium_url', 'large_url',
        'original_url', 'dimensions', 'file_size_mb', 'content_type', 'filename'
      )
    end

    it 'returns not found for non-existent image' do
      get :show, params: { service_id: service.id, id: 999 }
      
      expect(response).to have_http_status(:not_found)
      expect(json_response['error']).to eq('Image not found')
    end
  end

  describe 'POST #create' do
    before { sign_in_api_user(vendor_user) }

    context 'with valid parameters' do
      it 'creates a new service image' do
        expect {
          post :create, params: { service_id: service.id }.merge(valid_image_params)
        }.to change(ServiceImage, :count).by(1)
        
        expect(response).to have_http_status(:created)
        expect(json_response['message']).to eq('Image uploaded successfully')
        expect(json_response['service_image']['title']).to eq('Test Image')
      end

      it 'enqueues image processing job' do
        expect(ImageProcessingJob).to receive(:perform_later).with(kind_of(Integer))
        post :create, params: { service_id: service.id }.merge(valid_image_params)
      end

      it 'sets first image as primary automatically' do
        post :create, params: { service_id: service.id }.merge(valid_image_params)
        
        service_image = ServiceImage.last
        expect(service_image.is_primary).to be true
      end
    end

    context 'with invalid parameters' do
      it 'returns validation errors' do
        post :create, params: { service_id: service.id }.merge(invalid_image_params)
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['error']).to eq('Image upload failed')
        expect(json_response['details']).to be_present
      end
    end
  end

  describe 'PUT #update' do
    before { sign_in_api_user(vendor_user) }
    
    let!(:service_image) { create(:service_image, service: service) }
    let(:update_params) do
      {
        service_image: {
          title: 'Updated Title',
          description: 'Updated description',
          alt_text: 'Updated alt text'
        }
      }
    end

    it 'updates service image attributes' do
      put :update, params: { service_id: service.id, id: service_image.id }.merge(update_params)
      
      expect(response).to have_http_status(:ok)
      expect(json_response['message']).to eq('Image updated successfully')
      
      service_image.reload
      expect(service_image.title).to eq('Updated Title')
      expect(service_image.description).to eq('Updated description')
      expect(service_image.alt_text).to eq('Updated alt text')
    end

    it 'returns validation errors for invalid data' do
      invalid_update = { service_image: { title: 'x' * 300 } }
      put :update, params: { service_id: service.id, id: service_image.id }.merge(invalid_update)
      
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response['error']).to eq('Image update failed')
    end
  end

  describe 'DELETE #destroy' do
    before { sign_in_api_user(vendor_user) }
    
    let!(:service_image) { create(:service_image, service: service) }

    it 'deletes the service image' do
      expect {
        delete :destroy, params: { service_id: service.id, id: service_image.id }
      }.to change(ServiceImage, :count).by(-1)
      
      expect(response).to have_http_status(:ok)
      expect(json_response['message']).to eq('Image deleted successfully')
    end
  end

  describe 'POST #set_primary' do
    before { sign_in_api_user(vendor_user) }
    
    let!(:primary_image) { create(:service_image, :primary, service: service) }
    let!(:other_image) { create(:service_image, service: service) }

    it 'sets the specified image as primary' do
      post :set_primary, params: { service_id: service.id, id: other_image.id }
      
      expect(response).to have_http_status(:ok)
      expect(json_response['message']).to eq('Primary image updated successfully')
      
      expect(other_image.reload.is_primary).to be true
      expect(primary_image.reload.is_primary).to be false
    end
  end

  describe 'POST #reorder' do
    before { sign_in_api_user(vendor_user) }
    
    let!(:image1) { create(:service_image, service: service, display_order: 0) }
    let!(:image2) { create(:service_image, service: service, display_order: 1) }
    let!(:image3) { create(:service_image, service: service, display_order: 2) }

    it 'reorders images based on provided IDs' do
      new_order = [image3.id, image1.id, image2.id]
      post :reorder, params: { service_id: service.id, image_ids: new_order }
      
      expect(response).to have_http_status(:ok)
      expect(json_response['message']).to eq('Images reordered successfully')
      
      expect(image3.reload.display_order).to eq(0)
      expect(image1.reload.display_order).to eq(1)
      expect(image2.reload.display_order).to eq(2)
    end

    it 'returns error for invalid image IDs' do
      post :reorder, params: { service_id: service.id, image_ids: [999, image1.id] }
      
      expect(response).to have_http_status(:bad_request)
      expect(json_response['error']).to eq('Invalid image IDs provided')
      expect(json_response['invalid_ids']).to eq([999])
    end

    it 'returns error for missing image_ids parameter' do
      post :reorder, params: { service_id: service.id }
      
      expect(response).to have_http_status(:bad_request)
      expect(json_response['error']).to eq('image_ids parameter is required and must be an array')
    end
  end

  describe 'POST #bulk_upload' do
    before { sign_in_api_user(vendor_user) }

    let(:bulk_upload_params) do
      {
        images: [
          {
            image: fixture_file_upload('spec/fixtures/files/test_image.jpg', 'image/jpeg'),
            title: 'First Image',
            description: 'First test image'
          },
          {
            image: fixture_file_upload('spec/fixtures/files/test_image.png', 'image/png'),
            title: 'Second Image',
            description: 'Second test image'
          }
        ]
      }
    end

    it 'uploads multiple images successfully' do
      expect {
        post :bulk_upload, params: { service_id: service.id }.merge(bulk_upload_params)
      }.to change(ServiceImage, :count).by(2)
      
      expect(response).to have_http_status(:created)
      expect(json_response['message']).to eq('2 images uploaded successfully')
      expect(json_response['service_images'].count).to eq(2)
    end

    it 'enqueues processing jobs for all uploaded images' do
      expect(ImageProcessingJob).to receive(:perform_later).twice
      post :bulk_upload, params: { service_id: service.id }.merge(bulk_upload_params)
    end

    it 'handles partial failures gracefully' do
      mixed_params = {
        images: [
          {
            image: fixture_file_upload('spec/fixtures/files/test_image.jpg', 'image/jpeg'),
            title: 'Valid Image'
          },
          {
            title: 'Invalid Image - no file'
          }
        ]
      }
      
      expect {
        post :bulk_upload, params: { service_id: service.id }.merge(mixed_params)
      }.to change(ServiceImage, :count).by(1)
      
      expect(response).to have_http_status(:partial_content)
      expect(json_response['message']).to include('1 images uploaded successfully, 1 failed')
      expect(json_response['errors']).to be_present
    end

    it 'returns error for missing images parameter' do
      post :bulk_upload, params: { service_id: service.id }
      
      expect(response).to have_http_status(:bad_request)
      expect(json_response['error']).to eq('images parameter is required and must be an array')
    end
  end

  private

  def json_response
    JSON.parse(response.body)
  end

  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  def sign_in_api_user(user)
    request.headers.merge!(auth_headers(user))
  end
end