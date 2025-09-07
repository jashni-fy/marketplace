module Types
  class LocationInput < Types::BaseInputObject
    argument :latitude, Float, required: false, description: "Latitude coordinate"
    argument :longitude, Float, required: false, description: "Longitude coordinate"
    argument :radius, Float, required: false, description: "Search radius in kilometers"
    argument :city, String, required: false, description: "City name"
    argument :state, String, required: false, description: "State or province"
    argument :country, String, required: false, description: "Country name"
    argument :address, String, required: false, description: "Full address or location string"
  end
end