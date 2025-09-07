module Types
  class ServiceSearchResultType < Types::BaseObject
    field :services, [Types::ServiceType], null: false, description: "List of services matching the search criteria"
    field :total_count, Integer, null: false, description: "Total number of services matching the criteria"
    field :current_page, Integer, null: false, description: "Current page number"
    field :per_page, Integer, null: false, description: "Number of items per page"
    field :total_pages, Integer, null: false, description: "Total number of pages"
    field :has_next_page, Boolean, null: false, description: "Whether there are more pages"
    field :has_previous_page, Boolean, null: false, description: "Whether there are previous pages"
    field :facets, Types::SearchFacetsType, null: false, description: "Search facets for filtering"
    field :search_time, Float, null: false, description: "Search execution time in seconds"
    
    def has_next_page
      object[:current_page] < object[:total_pages]
    end
    
    def has_previous_page
      object[:current_page] > 1
    end
  end
end