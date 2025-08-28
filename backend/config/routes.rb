Rails.application.routes.draw do
  if defined?(ActiveAdmin)
    devise_for :admin_users, ActiveAdmin::Devise.config
    ActiveAdmin.routes(self)
  end
  devise_for :users
  # Health check endpoints
  get "up" => "rails/health#show", as: :rails_health_check
  get "health" => "health#show"



  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication routes (will be implemented in user_management pack)
      namespace :auth do
        post :login
        post :register
        delete :logout
      end

      # User routes (user_management pack)
      resources :users, only: [:show, :update] do
        member do
          post :upload_avatar
        end
      end

      # Service routes (service_catalog pack)
      resources :services do
        collection do
          get :search
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
        end
      end

      # Booking routes (booking_management pack)
      resources :bookings do
        member do
          post :respond
        end
      end
    end
  end

  # Sidekiq web interface (for development)
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq' if Rails.env.development?
end
