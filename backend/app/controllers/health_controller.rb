class HealthController < ApiController
  skip_before_action :authenticate_request

  def show
    render json: {
      status: 'ok',
      timestamp: Time.current.iso8601,
      version: Rails.application.class.module_parent_name,
      environment: Rails.env,
      database: database_status,
      redis: redis_status
    }
  end

  private

  def database_status
    ActiveRecord::Base.connection.execute('SELECT 1')
    'connected'
  rescue StandardError => e
    Rails.logger.error "Database health check failed: #{e.message}"
    'disconnected'
  end

  def redis_status
    Redis.new(url: Rails.application.config_for(:redis)[:url]).ping
    'connected'
  rescue StandardError
    'disconnected'
  end
end