# frozen_string_literal: true

# Parameter parsing helper - centralize param extraction and validation
module ParseParams
  extend ActiveSupport::Concern

  protected

  # Parse and validate date/time parameters
  def parse_date_params
    date_str = params[:date]
    start_time_str = params[:start_time]
    end_time_str = params[:end_time]

    return nil if date_str.blank? || start_time_str.blank? || end_time_str.blank?

    {
      date: Date.parse(date_str),
      start_time: start_time_str,
      end_time: end_time_str
    }
  rescue ArgumentError => e
    render_bad_request("Invalid date or time format: #{e.message}")
    nil
  end

  # Parse booking creation params with form validation
  def parse_booking_create_params
    result = Bookings::CreateForm.call(params[:booking])

    return result.value.to_booking_attributes if result.success?

    render_errors(result.errors)
    nil
  end

  # Parse booking update params with form validation
  def parse_booking_update_params
    result = Bookings::UpdateForm.call(params[:booking])

    return result.value.to_booking_attributes if result.success?

    render_errors(result.errors)
    nil
  end

  # Parse pagination params with safe defaults
  def parse_pagination_params
    page = (params[:page] || 1).to_i
    per_page = (params[:per_page] || 20).to_i

    # Enforce sensible limits
    page = [page, 1].max
    per_page = per_page.clamp(1, 100)

    { page: page, per_page: per_page }
  end

  # Parse filter params
  def parse_filter_params
    {
      start_date: params[:start_date],
      end_date: params[:end_date],
      date: params[:date],
      status: params[:status]
    }.compact
  end
end
