# frozen_string_literal: true

class Types::UserType < Types::BaseObject
  description 'User account details'

  field :created_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'Account creation timestamp'
  field :display_name, String, null: false, description: 'Display name presented in the UI'
  field :email, String, null: false, description: 'Email address of the user'
  field :first_name, String, null: false, description: 'User first name'
  field :full_name, String, null: false, description: 'Full name of the user'
  field :id, ID, null: false, description: 'Unique identifier for the user'
  field :last_name, String, null: false, description: 'User last name'
  field :role, String, null: false, description: 'Role assigned to the user'

  delegate :full_name, to: :object

  delegate :display_name, to: :object
end
