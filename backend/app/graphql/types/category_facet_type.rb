module Types
  class CategoryFacetType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :slug, String, null: false
    field :count, Integer, null: false, description: "Number of services in this category"
  end
end