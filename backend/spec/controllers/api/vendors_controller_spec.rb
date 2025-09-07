require 'rails_helper'

RSpec.describe Api::VendorsController, type: :controller do
  let(:user) { create(:user, :vendor, :confirmed) }
  let(:vendor_profile) { user.vendor_profile }
  let(:customer_user) { create(:user, :customer, :confirmed) }
  
  describe 'GET #index' do
    let!(:vendor_user1) { create(:user, :vendor, :confirmed) }
    let!(:vendor_user2) { create(:user, :vendor, :confirmed) }
    let!(:vendor_user3) { create(:user, :vendor, :confirmed) }
    let!(:vendor1) { vendor_user1.vendor_profile.tap { |vp| vp.update!(business_name: 'Photography Pro', location: 'New York') } }
    let!(:vendor2) { vendor_user2.vendor_profile.tap { |vp| vp.update!(business_name: 'Video Masters', location: 'Los Angeles') } }
    let!(:vendor3) { vendor_user3.vendor_profile.tap { |vp| vp.update!(business_name: 'Event Planners', location: 'New York') } }
    
    context 'without filters' do
      it 'returns all vendors with pagination' do
        get :index
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['vendors']).to be_an(Array)
        expect(json_response['vendors'].length).to eq(3)
        expect(json_response['pagination']).to include(
          'current_page' => 1,
          'total_pages' => 1,
          'total_count' => 3,
          'per_page' => 20
        )
      end
    end
    
    context 'with location filter' do
      it 'filters vendors by location' do
        get :index, params: { location: 'New York' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['vendors'].length).to eq(2)
        expect(json_response['vendors'].map { |v| v['business_name'] }).to contain_exactly(
          'Photography Pro', 'Event Planners'
        )
      end
    end
    
    context 'with service category filter' do
      let!(:photography_category) { create(:service_category, slug: 'photography') }
      let!(:service1) { create(:service, vendor_profile: vendor1, service_category: photography_category) }
      
      before do
        # Update vendor1 to include photography in service_categories
        vendor1.update!(service_categories: 'Photography, Event Planning')
      end
      
      it 'filters vendors by service category' do
        get :index, params: { service_category: 'photography' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['vendors'].length).to eq(1)
        expect(json_response['vendors'].first['business_name']).to eq('Photography Pro')
      end
    end
    
    context 'with pagination' do
      it 'respects pagination parameters' do
        get :index, params: { page: 1, per_page: 2 }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['vendors'].length).to eq(2)
        expect(json_response['pagination']['per_page']).to eq(2)
        expect(json_response['pagination']['total_pages']).to eq(2)
      end
    end
  end
  
  describe 'GET #show' do
    let!(:portfolio_item1) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true) }
    let!(:portfolio_item2) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }
    
    context 'when vendor exists' do
      it 'returns detailed vendor information' do
        get :show, params: { id: vendor_profile.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        vendor_data = json_response['vendor']
        expect(vendor_data['id']).to eq(vendor_profile.id)
        expect(vendor_data['business_name']).to eq(vendor_profile.business_name)
        expect(vendor_data['description']).to eq(vendor_profile.description)
        expect(vendor_data['location']).to eq(vendor_profile.location)
        expect(vendor_data['average_rating']).to eq(vendor_profile.average_rating.to_s)
        expect(vendor_data['total_reviews']).to eq(vendor_profile.total_reviews)
        expect(vendor_data['is_verified']).to eq(vendor_profile.is_verified)
        expect(vendor_data['portfolio_items_count']).to eq(2)
        expect(vendor_data['featured_portfolio']).to be_an(Array)
        expect(vendor_data['featured_portfolio'].length).to eq(1)
        expect(vendor_data['coordinates']).to include('latitude', 'longitude')
        expect(vendor_data['user']).to include('id', 'first_name', 'last_name', 'email')
      end
    end
    
    context 'when vendor does not exist' do
      it 'returns not found error' do
        get :show, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Vendor not found')
      end
    end
  end
  
  describe 'GET #services' do
    let!(:active_service) { create(:service, vendor_profile: vendor_profile, status: :active) }
    let!(:inactive_service) { create(:service, vendor_profile: vendor_profile, status: :inactive) }
    
    context 'when vendor exists' do
      it 'returns only active services' do
        get :services, params: { id: vendor_profile.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['services']).to be_an(Array)
        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['id']).to eq(active_service.id)
        expect(json_response['services'].first['name']).to eq(active_service.name)
        expect(json_response['services'].first['category']).to include('id', 'name', 'slug')
      end
    end
    
    context 'when vendor does not exist' do
      it 'returns not found error' do
        get :services, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
      end
    end
  end
  
  describe 'GET #availability' do
    let!(:available_slot) { create(:availability_slot, vendor_profile: vendor_profile, date: Date.current + 1.day, is_available: true) }
    let!(:unavailable_slot) { create(:availability_slot, vendor_profile: vendor_profile, date: Date.current + 2.days, is_available: false) }
    
    context 'when vendor exists' do
      it 'returns only available slots' do
        get :availability, params: { id: vendor_profile.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['availability_slots']).to be_an(Array)
        expect(json_response['availability_slots'].length).to eq(1)
        expect(json_response['availability_slots'].first['id']).to eq(available_slot.id)
        expect(json_response['availability_slots'].first['date']).to eq(available_slot.date.to_s)
      end
    end
    
    context 'with date range parameters' do
      let!(:slot_in_range) { create(:availability_slot, vendor_profile: vendor_profile, date: Date.current + 5.days, is_available: true) }
      let!(:slot_out_of_range) { create(:availability_slot, vendor_profile: vendor_profile, date: Date.current + 35.days, is_available: true) }
      
      it 'filters slots by date range' do
        start_date = Date.current
        end_date = Date.current + 10.days
        
        get :availability, params: { 
          id: vendor_profile.id, 
          start_date: start_date.to_s, 
          end_date: end_date.to_s 
        }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['availability_slots'].length).to eq(2) # available_slot and slot_in_range
      end
    end
  end
  
  describe 'GET #portfolio' do
    let!(:photography_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', is_featured: true) }
    let!(:videography_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'videography', is_featured: false) }
    
    context 'when vendor exists' do
      it 'returns all portfolio items' do
        get :portfolio, params: { id: vendor_profile.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['portfolio_items']).to be_an(Array)
        expect(json_response['portfolio_items'].length).to eq(2)
        expect(json_response['categories']).to contain_exactly('photography', 'videography')
        expect(json_response['total_count']).to eq(2)
      end
    end
    
    context 'with category filter' do
      it 'filters portfolio items by category' do
        get :portfolio, params: { id: vendor_profile.id, category: 'photography' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['portfolio_items'].length).to eq(1)
        expect(json_response['portfolio_items'].first['category']).to eq('photography')
      end
    end
    
    context 'with featured filter' do
      it 'returns only featured portfolio items' do
        get :portfolio, params: { id: vendor_profile.id, featured: 'true' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['portfolio_items'].length).to eq(1)
        expect(json_response['portfolio_items'].first['is_featured']).to be true
      end
    end
    
    context 'when vendor does not exist' do
      it 'returns not found error' do
        get :portfolio, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
      end
    end
  end
  
  describe 'GET #reviews' do
    context 'when vendor exists' do
      it 'returns review data (placeholder for now)' do
        get :reviews, params: { id: vendor_profile.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['reviews']).to be_an(Array)
        expect(json_response['reviews']).to be_empty # Placeholder until reviews are implemented
        expect(json_response['average_rating']).to eq(vendor_profile.average_rating.to_s)
        expect(json_response['total_reviews']).to eq(vendor_profile.total_reviews)
        expect(json_response['rating_breakdown']).to include('5', '4', '3', '2', '1')
      end
    end
    
    context 'when vendor does not exist' do
      it 'returns not found error' do
        get :reviews, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end