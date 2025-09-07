module Types
  class VendorProfileType < Types::BaseObject
    field :id, ID, null: false
    field :business_name, String, null: false
    field :description, String, null: true
    field :location, String, null: false
    field :phone, String, null: true
    field :website, String, null: true
    field :years_experience, Integer, null: false
    field :average_rating, Float, null: false
    field :total_reviews, Integer, null: false
    field :is_verified, Boolean, null: false
    field :service_categories, String, null: true
    field :latitude, Float, null: true
    field :longitude, Float, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    
    # Associations
    field :services, [Types::ServiceType], null: false, complexity: 10
    field :portfolio_items, [Types::PortfolioItemType], null: false, complexity: 5
    
    # Computed fields
    field :verified, Boolean, null: false
    field :has_description, Boolean, null: false
    field :profile_complete, Boolean, null: false
    field :display_name, String, null: false
    field :rating_display, String, null: false
    field :service_categories_list, [String], null: false
    field :has_portfolio, Boolean, null: false
    field :has_coordinates, Boolean, null: false
    field :coordinates, [Float], null: true
    field :distance_to, Float, null: true do
      argument :latitude, Float, required: true
      argument :longitude, Float, required: true
    end
    
    def verified
      object.verified?
    end
    
    def has_description
      object.has_description?
    end
    
    def profile_complete
      object.profile_complete?
    end
    
    def display_name
      object.display_name
    end
    
    def rating_display
      object.rating_display
    end
    
    def service_categories_list
      object.service_categories_list
    end
    
    def has_portfolio
      object.has_portfolio?
    end
    
    def has_coordinates
      object.has_coordinates?
    end
    
    def coordinates
      object.coordinates
    end
    
    def distance_to(latitude:, longitude:)
      object.distance_to(latitude, longitude)
    end
  end
end