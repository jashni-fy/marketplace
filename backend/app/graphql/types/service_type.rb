module Types
  class ServiceType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :description, String, null: false
    field :base_price, Float, null: true
    field :pricing_type, String, null: false
    field :status, String, null: false
    field :average_rating, Float, null: false
    field :total_reviews, Integer, null: false
    field :rating_distribution, Types::RatingDistributionType, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    
    # Associations
    field :vendor_profile, Types::VendorProfileType, null: false, complexity: 5
    field :service_category, Types::ServiceCategoryType, null: false, complexity: 2
    field :service_images, [Types::ServiceImageType], null: false, complexity: 3
    field :reviews, [Types::ReviewType], null: false, complexity: 5

    # Computed fields
    field :formatted_base_price, String, null: false
    field :can_be_booked, Boolean, null: false
    field :has_images, Boolean, null: false
    field :bookings_count, Integer, null: false
    field :short_description, String, null: false do
      argument :limit, Integer, required: false, default_value: 100
    end
    
    # Location-based fields
    field :vendor_location, String, null: true
    field :vendor_business_name, String, null: false
    field :vendor_average_rating, Float, null: false
    field :vendor_total_reviews, Integer, null: false
    
    def formatted_base_price
      object.formatted_base_price
    end
    
    def can_be_booked
      object.can_be_booked?
    end
    
    def has_images
      object.has_images?
    end
    
    def bookings_count
      object.bookings_count
    end
    
    def short_description(limit:)
      object.short_description(limit)
    end
    
    def vendor_location
      object.vendor_location
    end
    
    def vendor_business_name
      object.vendor_business_name
    end
    
    def vendor_average_rating
      object.vendor_average_rating
    end
    
    def vendor_total_reviews
      object.vendor_total_reviews
    end
  end
end