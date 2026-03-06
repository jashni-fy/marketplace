# frozen_string_literal: true

class Types::LocationFacetType < Types::BaseObject
  field :location, String, null: false
  field :count, Integer, null: false, description: 'Number of services in this location'
end
