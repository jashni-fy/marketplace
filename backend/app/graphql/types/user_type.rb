module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false
    field :email, String, null: false
    field :first_name, String, null: false
    field :last_name, String, null: false
    field :role, String, null: false
    field :full_name, String, null: false
    field :display_name, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    
    def full_name
      object.full_name
    end

    def display_name
      object.display_name
    end
  end
end
