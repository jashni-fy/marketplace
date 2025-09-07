class PortfolioItemsController < ApiController
  # Authentication is handled by ApiController
  before_action :set_vendor_profile, only: [:index, :create]
  before_action :set_portfolio_item, only: [:show, :update, :destroy]
  before_action :ensure_vendor_access, except: [:index, :show]

  # GET /vendors/:vendor_profile_id/portfolio_items
  # GET /portfolio_items (for current vendor)
  def index
    if params[:vendor_profile_id]
      # Public access to view any vendor's portfolio
      @portfolio_items = @vendor_profile.portfolio_items.ordered
      @portfolio_items = @portfolio_items.by_category(params[:category]) if params[:category].present?
      @portfolio_items = @portfolio_items.featured if params[:featured] == 'true'
    else
      # Vendor accessing their own portfolio
      ensure_vendor_role
      @portfolio_items = current_user.vendor_profile.portfolio_items.ordered
      @portfolio_items = @portfolio_items.by_category(params[:category]) if params[:category].present?
    end

    render json: {
      portfolio_items: @portfolio_items.map { |item| portfolio_item_json(item) },
      categories: @vendor_profile&.portfolio_categories || current_user.vendor_profile.portfolio_categories
    }
  end

  # GET /portfolio_items/:id
  def show
    render json: { portfolio_item: portfolio_item_json(@portfolio_item) }
  end

  # POST /portfolio_items
  def create
    ensure_vendor_role
    service = PortfolioManagementService.new(current_user.vendor_profile)
    result = service.create_portfolio_item(portfolio_item_params)

    if result[:success]
      render json: { 
        portfolio_item: portfolio_item_json(result[:portfolio_item]),
        message: 'Portfolio item created successfully'
      }, status: :created
    else
      render json: { 
        errors: result[:errors]
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /portfolio_items/:id
  def update
    service = PortfolioManagementService.new(@portfolio_item.vendor_profile)
    result = service.update_portfolio_item(@portfolio_item, portfolio_item_params)

    if result[:success]
      render json: { 
        portfolio_item: portfolio_item_json(result[:portfolio_item]),
        message: 'Portfolio item updated successfully'
      }
    else
      render json: { 
        errors: result[:errors]
      }, status: :unprocessable_entity
    end
  end

  # DELETE /portfolio_items/:id
  def destroy
    @portfolio_item.destroy
    render json: { message: 'Portfolio item deleted successfully' }
  end

  # POST /portfolio_items/:id/upload_images
  def upload_images
    set_portfolio_item
    service = PortfolioManagementService.new(@portfolio_item.vendor_profile)
    result = service.bulk_upload_images(@portfolio_item, params[:images])
    
    if result[:success]
      render json: { 
        portfolio_item: portfolio_item_json(result[:portfolio_item]),
        message: 'Images uploaded successfully',
        images_uploaded: result[:images_count]
      }
    else
      render json: { 
        errors: result[:errors]
      }, status: :unprocessable_entity
    end
  end

  # DELETE /portfolio_items/:id/remove_image/:image_id
  def remove_image
    set_portfolio_item
    
    image = @portfolio_item.images.find(params[:image_id])
    image.purge
    
    render json: { 
      portfolio_item: portfolio_item_json(@portfolio_item),
      message: 'Image removed successfully'
    }
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Image not found'] }, status: :not_found
  end

  # GET /portfolio_items/summary
  def summary
    ensure_vendor_role
    service = PortfolioManagementService.new(current_user.vendor_profile)
    summary = service.get_portfolio_summary
    
    render json: { summary: summary }
  end

  # POST /portfolio_items/reorder
  def reorder
    ensure_vendor_role
    service = PortfolioManagementService.new(current_user.vendor_profile)
    result = service.reorder_portfolio_items(params[:category], params[:item_orders])
    
    if result[:success]
      render json: { 
        message: "Successfully reordered #{result[:updated_count]} items",
        updated_count: result[:updated_count]
      }
    else
      render json: { 
        errors: result[:errors],
        updated_count: result[:updated_count]
      }, status: :unprocessable_entity
    end
  end

  # POST /portfolio_items/:id/duplicate
  def duplicate
    set_portfolio_item
    service = PortfolioManagementService.new(@portfolio_item.vendor_profile)
    result = service.duplicate_portfolio_item(@portfolio_item)
    
    if result[:success]
      render json: { 
        portfolio_item: portfolio_item_json(result[:portfolio_item]),
        message: 'Portfolio item duplicated successfully'
      }, status: :created
    else
      render json: { 
        errors: result[:errors]
      }, status: :unprocessable_entity
    end
  end

  # PATCH /portfolio_items/set_featured
  def set_featured
    ensure_vendor_role
    service = PortfolioManagementService.new(current_user.vendor_profile)
    result = service.set_featured_items(params[:item_ids], params[:featured])
    
    if result[:success]
      render json: { 
        message: "Successfully updated #{result[:updated_count]} items",
        updated_count: result[:updated_count]
      }
    else
      render json: { 
        errors: result[:errors],
        updated_count: result[:updated_count]
      }, status: :unprocessable_entity
    end
  end

  private

  def set_vendor_profile
    if params[:vendor_profile_id]
      @vendor_profile = VendorProfile.find(params[:vendor_profile_id])
    end
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Vendor profile not found'] }, status: :not_found
  end

  def set_portfolio_item
    @portfolio_item = PortfolioItem.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Portfolio item not found'] }, status: :not_found
  end

  def ensure_vendor_access
    unless @portfolio_item.vendor_profile.user == current_user
      render json: { errors: ['Access denied'] }, status: :forbidden
    end
  end

  def ensure_vendor_role
    unless current_user.vendor?
      render json: { errors: ['Vendor access required'] }, status: :forbidden
    end
  end

  def portfolio_item_params
    params.require(:portfolio_item).permit(:title, :description, :category, :display_order, :is_featured, images: [])
  end

  def portfolio_item_json(item)
    {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      display_order: item.display_order,
      is_featured: item.is_featured,
      created_at: item.created_at,
      updated_at: item.updated_at,
      images: item.images.attached? ? item.images.map { |image| image_json(image) } : [],
      image_count: item.image_count,
      vendor_profile: {
        id: item.vendor_profile.id,
        business_name: item.vendor_profile.business_name
      }
    }
  end

  def image_json(image)
    {
      id: image.id,
      filename: image.filename.to_s,
      content_type: image.content_type,
      byte_size: image.byte_size,
      url: url_for(image),
      thumbnail_url: url_for(image.variant(resize_to_limit: [300, 300]))
    }
  end
end