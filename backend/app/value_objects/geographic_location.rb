# frozen_string_literal: true

# Value object representing a geographic location with distance calculation
class GeographicLocation
  VALID_UNITS = %i[meters kilometers miles].freeze
  MIN_LAT = -90
  MAX_LAT = 90
  MIN_LNG = -180
  MAX_LNG = 180
  EARTH_RADIUS_KM = 6371.0

  attr_reader :latitude, :longitude

  def initialize(latitude, longitude)
    @latitude = latitude
    @longitude = longitude
    validate!
  end

  def valid?
    latitude.is_a?(Numeric) && longitude.is_a?(Numeric) &&
      latitude.between?(MIN_LAT, MAX_LAT) &&
      longitude.between?(MIN_LNG, MAX_LNG)
  end

  def distance_to(other_location, unit: :meters)
    raise ArgumentError, "Invalid unit: #{unit}" unless VALID_UNITS.include?(unit)
    return 0.0 if latitude == other_location.latitude && longitude == other_location.longitude

    distance_km = haversine_distance(other_location)
    format_distance(distance_km, unit)
  end

  def self.sql_distance_predicate
    '6371 * acos(cos(radians(?)) * cos(radians(latitude)) * ' \
      'cos(radians(longitude) - radians(?)) + sin(radians(?)) * ' \
      'sin(radians(latitude))) <= ?'
  end

  private

  def validate!
    return if valid?

    raise ArgumentError, "Invalid coordinates: lat=#{latitude} lng=#{longitude}"
  end

  def haversine_distance(other_location)
    rad_per_deg = Math::PI / 180

    dlat_rad = (other_location.latitude - latitude) * rad_per_deg
    dlon_rad = (other_location.longitude - longitude) * rad_per_deg
    lat1_rad = latitude * rad_per_deg
    lat2_rad = other_location.latitude * rad_per_deg

    sin_dlat = Math.sin(dlat_rad / 2)**2
    sin_dlon = Math.sin(dlon_rad / 2)**2

    a = sin_dlat + (Math.cos(lat1_rad) * Math.cos(lat2_rad) * sin_dlon)
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    EARTH_RADIUS_KM * c
  end

  def format_distance(distance_km, unit)
    case unit
    when :meters
      (distance_km * 1000).round(2)
    when :kilometers
      distance_km.round(4)
    when :miles
      (distance_km * 0.621371).round(4)
    end
  end
end
