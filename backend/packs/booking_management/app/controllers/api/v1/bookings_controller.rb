class Api::V1::BookingsController < ApplicationController
  # Booking management endpoints will be implemented in task 6.2
  def index
    render json: { message: "Bookings index - to be implemented" }
  end

  def show
    render json: { message: "Booking show - to be implemented" }
  end

  def create
    render json: { message: "Booking create - to be implemented" }
  end

  def update
    render json: { message: "Booking update - to be implemented" }
  end

  def destroy
    render json: { message: "Booking destroy - to be implemented" }
  end

  def respond
    render json: { message: "Booking respond - to be implemented" }
  end
end