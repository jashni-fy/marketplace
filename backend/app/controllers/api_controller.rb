class ApiController < ActionController::API
  include ExceptionHandler

  # called before every action on controllers
  before_action :authenticate_request
  attr_reader :current_user

  private

  def authenticate_request
    @current_user = (AuthorizeApiRequest.new(request.headers).call)[:user]
  end
end