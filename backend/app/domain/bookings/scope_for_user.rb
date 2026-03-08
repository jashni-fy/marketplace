# frozen_string_literal: true

module Bookings
  class ScopeForUser
    extend Dry::Initializer

    option :user, type: Types.Instance(User)

    def self.call(user:)
      new(user: user).call
    end

    def call
      user.vendor? ? user.vendor_bookings : user.customer_bookings
    end
  end
end
