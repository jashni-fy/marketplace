# frozen_string_literal: true

module BookingManagement::BookingActionHelpers
  extend ActiveSupport::Concern
  include PaginationHelper

  private

  def bookings_scope
    current_user.vendor? ? current_user.vendor_bookings : current_user.customer_bookings
  end

  def booking_access_authorized?
    authorized = @booking.customer == current_user || @booking.vendor == current_user
    return true if authorized

    render json: { error: 'Access denied' }, status: :forbidden
    false
  end

  def booking_modification_authorized?
    authorized = @booking.customer == current_user && @booking.can_be_modified?
    return true if authorized

    render json: { error: 'Cannot modify this booking' }, status: :forbidden
    false
  end

  def vendor_response_authorized?
    authorized = @booking.vendor == current_user && @booking.pending?
    return true if authorized

    render json: { error: 'Cannot respond to this booking' }, status: :forbidden
    false
  end

  def build_availability_checker
    service = Service.find(params[:service_id])
    AvailabilityCheckerService.new(
      vendor_profile: service.vendor_profile,
      date: Date.parse(params[:date]),
      start_time: params[:start_time],
      end_time: params[:end_time]
    )
  end

  def build_conflict_resolver
    ConflictResolutionService.new(
      vendor_profile: VendorProfile.find(params[:vendor_profile_id]),
      event_date: DateTime.parse("#{params[:date]} #{params[:start_time]}"),
      event_end_date: DateTime.parse("#{params[:date]} #{params[:end_time]}")
    )
  end

  def invalid_datetime_response
    render json: { error: 'Invalid date or time format' }, status: :bad_request
  end

  def set_booking
    @booking = Booking.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Booking not found' }, status: :not_found
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
end

module BookingManagement::BookingActions::ListingActions
  def index
    bookings = bookings_scope
               .includes(:customer, :vendor_profile, :service, :booking_messages)
               .order(created_at: :desc)
               .page(params[:page])
               .per(params[:per_page] || 20)

    render json: {
      bookings: BookingPresenter.collection(bookings),
      pagination: pagination_meta(bookings)
    }
  end

  def show
    return unless booking_access_authorized?

    render json: { booking: BookingPresenter.new(@booking).as_json(include_details: true) }
  end
end

module BookingManagement::BookingActions::ModificationActions
  def create
    service = BookingCreationService.new(booking_params.merge(customer: current_user))
    if service.call
      render json: {
        booking: BookingPresenter.new(service.booking).as_json,
        message: 'Booking created successfully'
      }, status: :created
    else
      render json: {
        errors: service.errors.full_messages,
        error: 'Failed to create booking'
      }, status: :unprocessable_content
    end
  end

  def update
    return unless booking_modification_authorized?

    if @booking.update(booking_update_params)
      render json: { booking: BookingPresenter.new(@booking).as_json }
    else
      render json: { errors: @booking.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    return unless booking_modification_authorized?

    if @booking.can_be_cancelled?
      @booking.update!(status: :cancelled)
      render json: { message: 'Booking cancelled successfully' }
    else
      render json: { error: 'Booking cannot be cancelled' }, status: :unprocessable_content
    end
  end

  def respond
    return unless vendor_response_authorized?

    response_action = params[:response_action]
    result = BookingResponseService.call(@booking, current_user, response_action)

    if result[:success]
      render json: {
        booking: BookingPresenter.new(result[:booking]).as_json,
        message: "Booking #{response_action}ed successfully"
      }
    else
      render json: { errors: result[:errors] }, status: :unprocessable_content
    end
  end
end

module BookingManagement::BookingActions::CommunicationActions
  def messages
    return unless booking_access_authorized?

    @messages = @booking.booking_messages
                        .includes(:sender)
                        .ordered
                        .page(params[:page])
                        .per(params[:per_page] || 50)

    render json: {
      messages: @messages.map { |message| MessagePresenter.new(message).as_json },
      pagination: pagination_meta(@messages)
    }
  end

  def send_message
    return unless booking_access_authorized?

    @message = @booking.booking_messages.build(
      sender: current_user,
      message: params[:message],
      sent_at: Time.current
    )

    if @message.save
      render json: { message: MessagePresenter.new(@message).as_json }, status: :created
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_content
    end
  end
end

module BookingManagement::BookingActions::AvailabilityActions
  def check_availability
    availability_checker = build_availability_checker
    if availability_checker.available?
      render json: { available: true, message: 'Time slot is available' }
    else
      render json: {
        available: false,
        message: 'Time slot is not available',
        suggested_times: availability_checker.suggested_times
      }
    end
  rescue ArgumentError
    invalid_datetime_response
  end

  def suggest_alternatives
    conflict_resolver = build_conflict_resolver

    render json: {
      has_conflict: conflict_resolver.conflict?,
      alternative_times: conflict_resolver.suggest_alternative_times
    }
  rescue ArgumentError
    invalid_datetime_response
  end
end

module BookingManagement::BookingActions
  extend ActiveSupport::Concern
  include BookingManagement::BookingActionHelpers
  include BookingManagement::BookingActions::ListingActions
  include BookingManagement::BookingActions::ModificationActions
  include BookingManagement::BookingActions::CommunicationActions
  include BookingManagement::BookingActions::AvailabilityActions
end
