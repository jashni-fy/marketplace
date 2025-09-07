require 'sidekiq'

# Skip Redis configuration in test environment
unless Rails.env.test?
  redis_config = Rails.application.config_for(:redis)

  Sidekiq.configure_server do |config|
    config.redis = redis_config
  end

  Sidekiq.configure_client do |config|
    config.redis = redis_config
  end
end