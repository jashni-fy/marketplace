# frozen_string_literal: true

class Types::ServiceCategoryType < Types::BaseObject
  description 'A category used to organize services'

  field :active, Boolean, null: false, description: 'Whether the category is currently active'
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'Creation timestamp for the category'
  field :description, String, null: false, description: 'Description of the services grouped in this category'
  field :id, ID, null: false, description: 'Unique identifier of the category'
  field :name, String, null: false, description: 'Display name of the category'
  field :slug, String, null: false, description: 'URL-friendly slug for the category'
  field :updated_at,
        GraphQL::Types::ISO8601DateTime,
        null: false,
        description: 'Timestamp when the category was last updated'

  # Associations
  field :services, [Types::ServiceType], null: false, description: 'Services associated with this category'

  # Computed fields
  field :services_count, Integer, null: false, description: 'Total number of services in this category'

  delegate :services_count, to: :object
end
