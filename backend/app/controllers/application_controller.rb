class ApplicationController < ActionController::Base
  include ExceptionHandler
  
  # Protect from forgery attacks in web requests, but skip for API requests
  protect_from_forgery with: :exception, unless: -> { request.format.json? }
  
  # Skip CSRF protection for API requests
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }

  # called before every action on controllers for API requests
  before_action :authenticate_request, if: -> { request.format.json? }
  attr_reader :current_user

  private

  def authenticate_request
    @current_user = (AuthorizeApiRequest.new(request.headers).call)[:user]
  end


end
