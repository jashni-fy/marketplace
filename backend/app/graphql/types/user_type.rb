# frozen_string_literal: true

class Types::UserType < Types::BaseObject
  field :id, ID, null: false
  field :email, String, null: false
  field :first_name, String, null: false
  field :last_name, String, null: false
  field :role, String, null: false
  field :full_name, String, null: false
  field :display_name, String, null: false
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false

  delegate :full_name, to: :object

  delegate :display_name, to: :object
end
