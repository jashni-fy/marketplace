class Api::BookingsController < ApiController
  before_action :authenticate_user!
  before_action :set_booking, only: [:show, :update, :respond, :messages, :send_message]

  def index
    @bookings = current_user.role == 'vendor' ? 
                current_user.vendor_profile.bookings : 
                current_user.customer_profile.bookings
    
    @bookings = @bookings.includes(:service, :vendor_profile, :customer_profile)
    @bookings = @bookings.where(status: params[:status]) if params[:status].present?
    
    render json: { bookings: @bookings.map { |booking| booking_response(booking) } }
  end

  def show
    render json: booking_response(@booking, include_details: true)
  end

  def create
    @booking = Booking.new(booking_params)
    @booking.customer_profile = current_user.customer_profile

    if @booking.save
      render json: {
        message: 'Booking created successfully',
        booking: booking_response(@booking, include_details: true)
      }, status: :created
    else
      render json: {
        error: 'Booking creation failed',
        details: @booking.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    if @booking.update(booking_params)
      render json: {
        message: 'Booking updated successfully',
        booking: booking_response(@booking, include_details: true)
      }
    else
      render json: {
        error: 'Booking update failed',
        details: @booking.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def respond
    response_action = params[:response_action]
    
    case response_action
    when 'accept'
      @booking.update(status: 'accepted')
      message = 'Booking accepted successfully'
    when 'decline'
      @booking.update(status: 'declined')
      message = 'Booking declined'
    when 'counter_offer'
      @booking.update(
        status: 'counter_offered',
        total_amount: params[:counter_amount],
        vendor_notes: params[:counter_message]
      )
      message = 'Counter offer sent'
    else
      return render json: { error: 'Invalid response action' }, status: :bad_request
    end

    render json: {
      message: message,
      booking: booking_response(@booking, include_details: true)
    }
  end

  def messages
    messages = @booking.booking_messages.includes(:user).order(:created_at)
    render json: {
      messages: messages.map { |msg| message_response(msg) }
    }
  end

  def send_message
    message = @booking.booking_messages.build(
      user: current_user,
      message: params[:message]
    )

    if message.save
      render json: {
        message: 'Message sent successfully',
        message: message_response(message)
      }
    else
      render json: {
        error: 'Failed to send message',
        details: message.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def set_booking
    @booking = Booking.find(params[:id])
    
    # Ensure user can access this booking
    unless (@booking.customer_profile&.user == current_user) || 
           (@booking.vendor_profile&.user == current_user)
      render json: { error: 'Access denied' }, status: :forbidden
    end
  end

  def booking_params
    params.require(:booking).permit(:service_id, :booking_date, :start_time, :end_time, 
                                   :location, :requirements, :total_amount)
  end

  def booking_response(booking, include_details: false)
    response = {
      id: booking.id,
      service: {
        id: booking.service.id,
        title: booking.service.title,
        base_price: booking.service.base_price
      },
      customer: {
        id: booking.customer_profile.id,
        name: "#{booking.customer_profile.user.first_name} #{booking.customer_profile.user.last_name}"
      },
      vendor: {
        id: booking.vendor_profile.id,
        business_name: booking.vendor_profile.business_name
      },
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      location: booking.location,
      status: booking.status,
      total_amount: booking.total_amount,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }

    if include_details
      response[:requirements] = booking.requirements
      response[:vendor_notes] = booking.vendor_notes
      response[:customer][:email] = booking.customer_profile.user.email
      response[:vendor][:email] = booking.vendor_profile.user.email
    end

    response
  end

  def message_response(message)
    {
      id: message.id,
      user: {
        id: message.user.id,
        name: "#{message.user.first_name} #{message.user.last_name}",
        role: message.user.role
      },
      message: message.message,
      created_at: message.created_at
    }
  end
end