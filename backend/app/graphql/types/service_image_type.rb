module Types
  class ServiceImageType < Types::BaseObject
    field :id, ID, null: false
    field :caption, String, null: true
    field :alt_text, String, null: true
    field :is_primary, Boolean, null: false
    field :display_order, Integer, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    
    # Associations
    field :service, Types::ServiceType, null: false
    
    # File attachment fields would be added here when needed
    # field :image_url, String, null: true
  end
end