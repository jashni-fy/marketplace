# frozen_string_literal: true

class Types::ServiceImageType < Types::BaseObject
  description 'Metadata for images that illustrate a service offering'

  field :alt_text, String, null: true, description: 'Alternative text for the image'
  field :caption, String, null: true, description: 'Caption for the image'
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'When the image metadata was created'
  field :display_order, Integer, null: false, description: 'Ordering weight among the service images'
  field :id, ID, null: false, description: 'Unique identifier of the image entry'
  field :is_primary, Boolean, null: false, description: 'Whether this image is the primary service image'
  field :updated_at,
        GraphQL::Types::ISO8601DateTime,
        null: false,
        description: 'When the image metadata was last updated'

  # Associations
  field :service, Types::ServiceType, null: false, description: 'Service that owns the image'

  # File attachment fields would be added here when needed
  # field :image_url, String, null: true
end
