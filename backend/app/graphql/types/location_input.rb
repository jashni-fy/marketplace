# frozen_string_literal: true

class Types::LocationInput < Types::BaseInputObject
  description 'Optional location filter parameters used for service search'
  argument :address, String, required: false, description: 'Full address or location string'
  argument :city, String, required: false, description: 'City name'
  argument :country, String, required: false, description: 'Country name'
  argument :latitude, Float, required: false, description: 'Latitude coordinate'
  argument :longitude, Float, required: false, description: 'Longitude coordinate'
  argument :radius, Float, required: false, description: 'Search radius in kilometers'
  argument :state, String, required: false, description: 'State or province'
end
