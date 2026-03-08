# frozen_string_literal: true

# Authorization helper - simplifies auth checks in controllers
module AuthorizeAction
  extend ActiveSupport::Concern

  # Check authorization and render error if unauthorized
  # Usage: authorize_action?(@booking, :access) or return
  def authorize_action?(resource, action)
    unless Bookings::AuthorizeAccess.call(
      booking: resource,
      user: current_user,
      action: action
    )
      render_forbidden('Not authorized for this action')
      return false
    end

    true
  end

  # Check authorization with custom error message
  def authorize_action!(resource, action, error_message = 'Not authorized')
    authorize_action?(resource, action) || render_forbidden(error_message)
  end

  # Require booking to be cancellable
  # rubocop:disable Naming/PredicateMethod -- intentional side effects (rendering) alongside boolean return
  def require_cancellable_booking!(booking)
    return true if booking.can_be_cancelled?

    render_forbidden('This booking cannot be cancelled')
    false
  end
  # rubocop:enable Naming/PredicateMethod

  # Require booking to be modifiable
  # rubocop:disable Naming/PredicateMethod -- intentional side effects (rendering) alongside boolean return
  def require_modifiable_booking!(booking)
    return true if booking.can_be_modified?

    render_forbidden('This booking cannot be modified')
    false
  end
  # rubocop:enable Naming/PredicateMethod
end
