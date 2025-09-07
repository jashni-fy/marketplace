class Api::BookingsController < ApiController
  before_action :authenticate_user!
  before_action :set_booking, only: [:show, :update, :destroy, :respond, :messages, :send_message]

  def index
    @bookings = current_user.vendor? ? vendor_bookings : customer_bookings
    @bookings = @bookings.includes(:customer, :vendor, :service, :booking_messages)
                         .order(created_at: :desc)
                         .page(params[:page])
                         .per(params[:per_page] || 20)

    render json: {
      bookings: @bookings.map { |booking| booking_json(booking) },
      pagination: pagination_meta(@bookings)
    }
  end

  def show
    return unless authorize_booking_access!
    render json: { booking: detailed_booking_json(@booking) }
  end

  def create
    booking_service = BookingCreationService.new(
      booking_params.merge(customer: current_user)
    )

    if booking_service.call
      render json: { 
        booking: booking_json(booking_service.booking),
        message: 'Booking created successfully'
      }, status: :created
    else
      render json: { 
        errors: booking_service.errors.full_messages,
        error: 'Failed to create booking'
      }, status: :unprocessable_entity
    end
  end

  def update
    return unless authorize_booking_modification!

    if @booking.update(booking_update_params)
      render json: { booking: booking_json(@booking) }
    else
      render json: { errors: @booking.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    return unless authorize_booking_modification!

    if @booking.can_be_cancelled?
      @booking.update!(status: :cancelled)
      # TODO: Send cancellation notification
      render json: { message: 'Booking cancelled successfully' }
    else
      render json: { error: 'Booking cannot be cancelled' }, status: :unprocessable_entity
    end
  end

  def respond
    return unless authorize_vendor_response!

    response_action = params[:response_action]
    
    case response_action
    when 'accept'
      @booking.update!(status: :accepted)
      message = 'Booking accepted successfully'
    when 'decline'
      @booking.update!(status: :declined)
      message = 'Booking declined'
    when 'counter_offer'
      @booking.update!(
        status: :counter_offered,
        total_amount: params[:counter_amount],
        special_instructions: params[:counter_message]
      )
      message = 'Counter offer sent'
    else
      return render json: { error: 'Invalid response action' }, status: :bad_request
    end

    # TODO: Send notification to customer
    render json: { booking: booking_json(@booking), message: message }
  end

  def messages
    return unless authorize_booking_access!
    
    @messages = @booking.booking_messages
                        .includes(:sender)
                        .ordered
                        .page(params[:page])
                        .per(params[:per_page] || 50)

    render json: {
      messages: @messages.map { |message| message_json(message) },
      pagination: pagination_meta(@messages)
    }
  end

  def send_message
    return unless authorize_booking_access!

    @message = @booking.booking_messages.build(
      sender: current_user,
      message: params[:message],
      sent_at: Time.current
    )

    if @message.save
      # TODO: Send real-time notification
      render json: { message: message_json(@message) }, status: :created
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def check_availability
    service = Service.find(params[:service_id])
    vendor_profile = service.vendor_profile

    availability_checker = AvailabilityCheckerService.new(
      vendor_profile: vendor_profile,
      date: Date.parse(params[:date]),
      start_time: params[:start_time],
      end_time: params[:end_time]
    )

    if availability_checker.available?
      render json: { 
        available: true,
        message: 'Time slot is available'
      }
    else
      render json: { 
        available: false,
        message: 'Time slot is not available',
        suggested_times: availability_checker.suggested_times
      }
    end
  rescue Date::Error, ArgumentError => e
    render json: { error: 'Invalid date or time format' }, status: :bad_request
  end

  def suggest_alternatives
    conflict_resolver = ConflictResolutionService.new(
      vendor: User.find(params[:vendor_id]),
      event_date: DateTime.parse("#{params[:date]} #{params[:start_time]}"),
      event_end_date: DateTime.parse("#{params[:date]} #{params[:end_time]}")
    )

    render json: {
      has_conflict: conflict_resolver.has_conflict?,
      alternative_times: conflict_resolver.suggest_alternative_times
    }
  rescue Date::Error, ArgumentError => e
    render json: { error: 'Invalid date or time format' }, status: :bad_request
  end

  private

  def set_booking
    @booking = Booking.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Booking not found' }, status: :not_found
  end

  def vendor_bookings
    current_user.vendor_bookings
  end

  def customer_bookings
    current_user.customer_bookings
  end

  def authorize_booking_access!
    unless @booking.customer == current_user || @booking.vendor == current_user
      render json: { error: 'Access denied' }, status: :forbidden
      return false
    end
    true
  end

  def authorize_booking_modification!
    unless @booking.customer == current_user && @booking.can_be_modified?
      render json: { error: 'Cannot modify this booking' }, status: :forbidden
      return false
    end
    true
  end

  def authorize_vendor_response!
    unless @booking.vendor == current_user && @booking.pending?
      render json: { error: 'Cannot respond to this booking' }, status: :forbidden
      return false
    end
    true
  end

  def booking_params
    params.require(:booking).permit(
      :service_id, :event_date, :event_end_date, :event_location,
      :total_amount, :requirements, :special_instructions, :event_duration
    )
  end

  def booking_update_params
    params.require(:booking).permit(
      :event_date, :event_end_date, :event_location,
      :requirements, :special_instructions, :event_duration
    )
  end

  def booking_json(booking)
    {
      id: booking.id,
      status: booking.status,
      event_date: booking.event_date,
      event_end_date: booking.event_end_date,
      event_location: booking.event_location,
      total_amount: booking.total_amount,
      requirements: booking.requirements,
      special_instructions: booking.special_instructions,
      event_duration: booking.event_duration,
      duration_hours: booking.duration_hours,
      can_be_modified: booking.can_be_modified?,
      can_be_cancelled: booking.can_be_cancelled?,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        category: booking.service.category_name
      },
      customer: {
        id: booking.customer.id,
        name: booking.customer.full_name,
        email: booking.customer.email
      },
      vendor: {
        id: booking.vendor.id,
        name: booking.vendor.full_name,
        business_name: booking.vendor_profile&.business_name
      }
    }
  end

  def detailed_booking_json(booking)
    booking_json(booking).merge(
      messages_count: booking.booking_messages.count,
      last_message_at: booking.booking_messages.maximum(:sent_at)
    )
  end

  def message_json(message)
    {
      id: message.id,
      message: message.message,
      sent_at: message.sent_at,
      formatted_sent_at: message.formatted_sent_at,
      sender: {
        id: message.sender.id,
        name: message.sender_name,
        type: message.sender_type
      }
    }
  end

  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count,
      per_page: collection.limit_value
    }
  end
end