require 'sidekiq'

# Skip Redis configuration in test environment
unless Rails.env.test?
  redis_config = Rails.application.config_for(:redis)

  Sidekiq.configure_server do |config|
    config.redis = redis_config

    # Load sidekiq-scheduler configuration if gem is installed
    if Gem.loaded_specs['sidekiq-scheduler']
      config.on(:startup) do
        Sidekiq.schedule = YAML.load_file(Rails.root.join('config/sidekiq_schedule.yml'))
        Sidekiq::Scheduler.reload_schedule!
      end
    end
  end

  Sidekiq.configure_client do |config|
    config.redis = redis_config
  end
end
