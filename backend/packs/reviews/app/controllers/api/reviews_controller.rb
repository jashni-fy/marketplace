class Api::ReviewsController < ApiController
  before_action :authenticate_user!, except: [:index, :service_reviews, :vendor_reviews]
  before_action :set_review, only: [:show, :update, :destroy]
  before_action :ensure_customer, only: [:create]
  before_action :ensure_owner, only: [:update, :destroy]

  # GET /api/reviews
  def index
    @reviews = Review.published.recent.includes(:customer, :service, :vendor_profile)
    render json: { reviews: @reviews.map { |r| review_json(r) } }
  end

  # GET /api/services/:service_id/reviews
  def service_reviews
    @reviews = Review.published.where(service_id: params[:service_id]).recent.includes(:customer)
    render json: { reviews: @reviews.map { |r| review_json(r) } }
  end

  # GET /api/vendors/:vendor_id/reviews
  def vendor_reviews
    @reviews = Review.published.where(vendor_profile_id: params[:vendor_id]).recent.includes(:customer, :service)
    render json: { reviews: @reviews.map { |r| review_json(r) } }
  end

  # POST /api/reviews
  def create
    @booking = Booking.find(review_params[:booking_id])
    
    # Validation is also in model, but early check here
    unless @booking.customer == current_user
      return render json: { error: 'You can only review your own bookings' }, status: :forbidden
    end

    @review = Review.new(review_params)
    @review.customer = current_user
    @review.vendor_profile = @booking.vendor_profile
    @review.service = @booking.service

    if @review.save
      render json: { message: 'Review submitted successfully', review: review_json(@review) }, status: :created
    else
      render json: { error: 'Review submission failed', details: @review.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/reviews/:id
  def update
    if @review.update(review_update_params)
      render json: { message: 'Review updated successfully', review: review_json(@review) }
    else
      render json: { error: 'Review update failed', details: @review.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/reviews/:id
  def destroy
    @review.destroy
    render json: { message: 'Review deleted successfully' }
  end

  private

  def set_review
    @review = Review.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Review not found' }, status: :not_found
  end

  def ensure_customer
    unless current_user.customer?
      render json: { error: 'Only customers can submit reviews' }, status: :forbidden
    end
  end

  def ensure_owner
    unless @review.customer == current_user
      render json: { error: 'You can only manage your own reviews' }, status: :forbidden
    end
  end

  def review_params
    params.require(:review).permit(:booking_id, :rating, :quality_rating, :communication_rating, :value_rating, :punctuality_rating, :comment)
  end

  def review_update_params
    params.require(:review).permit(:rating, :quality_rating, :communication_rating, :value_rating, :punctuality_rating, :comment)
  end

  def review_json(review)
    {
      id: review.id,
      rating: review.rating,
      quality_rating: review.quality_rating,
      communication_rating: review.communication_rating,
      value_rating: review.value_rating,
      punctuality_rating: review.punctuality_rating,
      comment: review.comment,
      status: review.status,
      created_at: review.created_at,
      customer: {
        id: review.customer.id,
        name: review.customer.full_name
      },
      service: {
        id: review.service.id,
        name: review.service.name
      },
      vendor: {
        id: review.vendor_profile.id,
        business_name: review.vendor_profile.business_name
      }
    }
  end
end
