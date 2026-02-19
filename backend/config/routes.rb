Rails.application.routes.draw do
  root to: "rails/health#show"

  post "/graphql", to: "graphql#execute"
  if Rails.env.development?
    begin
      mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
    rescue NameError
      # GraphiQL not available, skip mounting
    end
  end
  if defined?(ActiveAdmin)
    devise_for :admin_users, ActiveAdmin::Devise.config
    ActiveAdmin.routes(self)
  end
  devise_for :users
  
  # Health check endpoints
  get "up" => "rails/health#show", as: :rails_health_check
  get "health" => "health#show"

  # API routes namespace
  namespace :api do
    # Authentication routes (user_management pack)
    scope :auth do
      post :login, to: 'auth#login'
      post :register, to: 'auth#register'
      delete :logout, to: 'auth#logout'
    end

    # User routes (user_management pack)
    resources :users, only: [:show, :update] do
      member do
        post :upload_avatar
      end
    end

    # Vendor profile routes (user_management pack)
    resources :profiles, only: [:show, :create, :update, :destroy] do
      collection do
        get :me
        get :service_categories
        post :request_verification
      end
    end

    # Analytics routes
    get 'analytics/dashboard', to: 'analytics#dashboard'

    # Service routes (service_catalog pack)
    resources :services do
      collection do
        get :search
      end
      
      member do
        get :reviews, to: 'reviews#service_reviews'
      end

      # Service images nested routes
      resources :images, controller: 'service_images', except: [:new, :edit] do
        member do
          post :set_primary
        end
        collection do
          post :reorder
          post :bulk_upload
        end
      end
    end

    # Vendor routes (service_catalog pack)
    resources :vendors, only: [:index, :show] do
      member do
        get :services
        get :availability
        get :portfolio
        get :reviews, to: 'reviews#vendor_reviews'
      end
      
      # Portfolio items nested under vendors for public viewing
      resources :portfolio_items, only: [:index, :show], controller: 'portfolio_items'
    end

    # Review routes (reviews pack)
    resources :reviews, only: [:index, :show, :create, :update, :destroy]


    # Portfolio items routes (service_catalog pack)
    resources :portfolio_items do
      member do
        post :upload_images
        delete 'remove_image/:image_id', action: :remove_image, as: :remove_image
        post :duplicate
      end
      collection do
        get :summary
        post :reorder
        patch :set_featured
      end
    end

    # Booking routes (booking_management pack)
    resources :bookings do
      member do
        post :respond
        get :messages
        post :send_message
      end
      collection do
        post :check_availability
        post :suggest_alternatives
      end
    end

    # Availability slots routes (booking_management pack)
    resources :availability_slots do
      collection do
        post :bulk_create
        get :check_conflicts
      end
    end
  end

  # Sidekiq web interface (for development)
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq' if Rails.env.development?
end
