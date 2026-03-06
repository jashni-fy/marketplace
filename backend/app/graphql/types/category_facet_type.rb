# frozen_string_literal: true

class Types::CategoryFacetType < Types::BaseObject
  description 'Summary of services grouped by category for faceted search'

  field :count, Integer, null: false, description: 'Number of services in this category'
  field :id, ID, null: false, description: 'Unique identifier for the category facet'
  field :name, String, null: false, description: 'Name of the category'
  field :slug, String, null: false, description: 'URL-friendly slug for the category'
end
