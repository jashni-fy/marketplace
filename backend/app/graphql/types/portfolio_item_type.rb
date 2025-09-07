module Types
  class PortfolioItemType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: false
    field :description, String, null: true
    field :category, String, null: true
    field :is_featured, Boolean, null: false
    field :display_order, Integer, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    
    # Associations
    field :vendor_profile, Types::VendorProfileType, null: false
    
    # Computed fields
    field :featured, Boolean, null: false
    
    def featured
      object.featured?
    end
  end
end