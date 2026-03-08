# frozen_string_literal: true

# Consistent JSON response formatting for API endpoints
module JsonResponse
  extend ActiveSupport::Concern

  # Success responses
  def render_success(data = nil, message = nil, status = :ok)
    response = {}
    response[:data] = data if data.present?
    response[:message] = message if message.present?

    render json: response, status: status
  end

  def render_created(data = nil, message = nil)
    render_success(data, message, :created)
  end

  # Error responses
  def render_errors(errors, status = :unprocessable_content)
    # Handle both array of error hashes and error messages
    formatted_errors = if errors.is_a?(Hash)
                         errors
                       elsif errors.is_a?(Array)
                         errors.map { |e| e.is_a?(Hash) ? e : { message: e } }
                       else
                         { message: errors.to_s }
                       end

    render json: { errors: formatted_errors }, status: status
  end

  def render_bad_request(message)
    render_errors(message, :bad_request)
  end

  def render_unauthorized(message = 'Unauthorized')
    render_errors(message, :unauthorized)
  end

  def render_forbidden(message = 'Access denied')
    render_errors(message, :forbidden)
  end

  def render_not_found(resource = 'Resource')
    render_errors("#{resource} not found", :not_found)
  end

  def render_conflict(message = 'Conflict detected')
    render_errors(message, :conflict)
  end

  # Pagination response
  def render_paginated(records, presenter_class = nil, message = nil)
    data = if presenter_class
             records.map { |record| presenter_class.new(record).as_json }
           else
             records.as_json
           end

    response = { data: data, pagination: pagination_meta(records) }
    response[:message] = message if message.present?

    render json: response
  end

  private

  def pagination_meta(collection)
    {
      page: collection.current_page,
      per_page: collection.limit_value,
      total: collection.total_count,
      total_pages: collection.total_pages
    }
  end
end
