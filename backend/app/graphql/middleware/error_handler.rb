# frozen_string_literal: true

module Middleware
  # Standardizes GraphQL error responses with consistent shape and HTTP status codes
  # rubocop:disable GraphQL/ObjectDescription
  class ErrorHandler
    # Converts application errors to GraphQL ExecutionErrors with consistent format
    def self.call(error, _context)
      case error
      when ActiveRecord::RecordNotFound
        not_found_error
      when ActiveRecord::RecordInvalid
        unprocessable_entity_error(error)
      when ActionController::ParameterMissing
        bad_request_error(error)
      when Pundit::NotAuthorizedError
        forbidden_error
      when StandardError
        internal_error(error)
      else
        error
      end
    end

    def self.not_found_error
      GraphQL::ExecutionError.new(
        'Resource not found',
        extensions: { code: 'NOT_FOUND', status: 404 }
      )
    end

    def self.unprocessable_entity_error(error)
      GraphQL::ExecutionError.new(
        error.record.errors.full_messages.join(', '),
        extensions: { code: 'UNPROCESSABLE_ENTITY', status: 422 }
      )
    end

    def self.bad_request_error(error)
      GraphQL::ExecutionError.new(
        "Missing required parameter: #{error.param}",
        extensions: { code: 'BAD_REQUEST', status: 400 }
      )
    end

    def self.forbidden_error
      GraphQL::ExecutionError.new(
        'Not authorized to perform this action',
        extensions: { code: 'FORBIDDEN', status: 403 }
      )
    end

    def self.internal_error(error)
      # Log internal error; don't expose implementation details to client
      Rails.logger.error(
        "GraphQL Error: #{error.class} - #{error.message}\n#{error.backtrace.first(5).join("\n")}"
      )
      GraphQL::ExecutionError.new(
        'Internal server error',
        extensions: { code: 'INTERNAL_ERROR', status: 500 }
      )
    end
  end
  # rubocop:enable GraphQL/ObjectDescription
end
