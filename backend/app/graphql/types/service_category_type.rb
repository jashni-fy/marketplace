# frozen_string_literal: true

class Types::ServiceCategoryType < Types::BaseObject
  field :id, ID, null: false
  field :name, String, null: false
  field :description, String, null: false
  field :slug, String, null: false
  field :active, Boolean, null: false
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

  # Associations
  field :services, [Types::ServiceType], null: false

  # Computed fields
  field :services_count, Integer, null: false

  delegate :services_count, to: :object
end
