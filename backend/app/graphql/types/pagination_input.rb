module Types
  class PaginationInput < Types::BaseInputObject
    argument :page, Integer, required: false, default_value: 1, description: "Page number (1-based)"
    argument :per_page, Integer, required: false, default_value: 20, description: "Items per page (max 100)"
    argument :sort_by, String, required: false, default_value: "created_at", description: "Sort field"
    argument :sort_order, String, required: false, default_value: "desc", description: "Sort order (asc, desc)"
  end
end