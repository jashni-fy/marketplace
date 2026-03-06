# frozen_string_literal: true

module Types::NodeType
  include Types::BaseInterface

  description 'Relay node interface that exposes a globally unique identifier'

  # Add the `id` field
  include GraphQL::Types::Relay::NodeBehaviors
end
