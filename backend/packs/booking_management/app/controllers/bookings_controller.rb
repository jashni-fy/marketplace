# frozen_string_literal: true

class BookingsController < ApiController
  include BookingManagement::BookingActions

  before_action :authenticate_user!
  before_action :set_booking, only: %i[show update destroy respond messages send_message]

  def show
    super
  end

  def update
    super
  end

  def destroy
    super
  end

  def respond
    super
  end

  def messages
    super
  end

  def send_message
    super
  end
end
