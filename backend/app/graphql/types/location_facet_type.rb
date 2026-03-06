# frozen_string_literal: true

class Types::LocationFacetType < Types::BaseObject
  description 'Summary of services grouped by location for faceted search'

  field :count, Integer, null: false, description: 'Number of services in this location'
  field :location, String, null: false, description: 'Name of the location'
end
