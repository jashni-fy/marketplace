# frozen_string_literal: true

class Bookings::UpdateForm
  include ActiveModel::Model

  attr_accessor :event_date, :event_end_date, :event_location,
                :requirements, :special_instructions, :event_duration

  validates :event_location, length: { minimum: 3, maximum: 255 }, allow_blank: true
  validates :event_duration, length: { maximum: 100 }, allow_blank: true

  def self.call(params)
    form = new(params)
    form.valid? ? Success(form) : Failure(form.errors)
  end

  def to_booking_attributes
    {
      event_date: parse_datetime(event_date),
      event_end_date: parse_datetime(event_end_date),
      event_location: event_location,
      requirements: requirements,
      special_instructions: special_instructions,
      event_duration: event_duration
    }.compact
  end

  private

  def parse_datetime(value)
    return nil if value.blank?

    value.is_a?(String) ? Time.zone.parse(value) : value
  rescue ArgumentError
    raise ArgumentError, "Invalid date/time format: #{value}"
  end

  # Result objects
  class Success
    def initialize(form)
      @form = form
    end

    def success?
      true
    end

    def failure?
      false
    end

    def value
      @form
    end

    def errors
      {}
    end
  end

  class Failure
    def initialize(errors)
      @errors = errors
    end

    def success?
      false
    end

    def failure?
      true
    end

    def value
      nil
    end

    def errors
      @errors.messages.transform_values(&:first)
    end
  end
end
