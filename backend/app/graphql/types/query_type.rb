# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :node, Types::NodeType, null: true, description: "Fetches an object given its ID." do
      argument :id, ID, required: true, description: "ID of the object."
    end

    def node(id:)
      context.schema.object_from_id(id, context)
    end

    field :nodes, [Types::NodeType, null: true], null: true, description: "Fetches a list of objects given a list of IDs." do
      argument :ids, [ID], required: true, description: "IDs of the objects."
    end

    def nodes(ids:)
      ids.map { |id| context.schema.object_from_id(id, context) }
    end

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    # Advanced service search with flexible filtering and faceted search
    field :search_services, resolver: Resolvers::ServiceSearchResolver, description: "Advanced service search with flexible filtering and faceted search"
    
    # Basic service queries
    field :service, Types::ServiceType, null: true, description: "Find a service by ID" do
      argument :id, ID, required: true
    end
    
    field :services, [Types::ServiceType], null: false, description: "List all active services" do
      argument :limit, Integer, required: false, default_value: 20
    end
    
    # Service category queries
    field :service_categories, [Types::ServiceCategoryType], null: false, description: "List all active service categories"
    
    # Vendor profile queries
    field :vendor_profile, Types::VendorProfileType, null: true, description: "Find a vendor profile by ID" do
      argument :id, ID, required: true
    end
    
    def service(id:)
      Service.active.find_by(id: id)
    end
    
    def services(limit:)
      Service.active.includes(:vendor_profile, :service_category).limit(limit)
    end
    
    def service_categories
      ServiceCategory.active.ordered
    end
    
    def vendor_profile(id:)
      VendorProfile.find_by(id: id)
    end
  end
end
