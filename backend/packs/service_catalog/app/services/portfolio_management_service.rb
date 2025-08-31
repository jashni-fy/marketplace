class PortfolioManagementService
  def initialize(vendor_profile)
    @vendor_profile = vendor_profile
  end

  def create_portfolio_item(params)
    portfolio_item = @vendor_profile.portfolio_items.build(params)
    
    if portfolio_item.save
      reorder_items_in_category(portfolio_item.category) if params[:display_order].present?
      { success: true, portfolio_item: portfolio_item }
    else
      { success: false, errors: portfolio_item.errors.full_messages }
    end
  end

  def update_portfolio_item(portfolio_item, params)
    old_category = portfolio_item.category
    old_order = portfolio_item.display_order
    
    if portfolio_item.update(params)
      # Reorder if category or display_order changed
      if params[:category].present? && params[:category] != old_category
        reorder_items_in_category(old_category)
        reorder_items_in_category(portfolio_item.category)
      elsif params[:display_order].present? && params[:display_order] != old_order
        reorder_items_in_category(portfolio_item.category)
      end
      
      { success: true, portfolio_item: portfolio_item }
    else
      { success: false, errors: portfolio_item.errors.full_messages }
    end
  end

  def bulk_upload_images(portfolio_item, images)
    return { success: false, errors: ['No images provided'] } if images.blank?
    
    images.each do |image|
      portfolio_item.images.attach(image)
    end
    
    if portfolio_item.save
      { success: true, portfolio_item: portfolio_item, images_count: images.count }
    else
      { success: false, errors: portfolio_item.errors.full_messages }
    end
  end

  def reorder_portfolio_items(category, item_orders)
    # item_orders should be an array of { id: portfolio_item_id, display_order: new_order }
    success_count = 0
    errors = []
    
    item_orders.each do |item_order|
      portfolio_item = @vendor_profile.portfolio_items.find_by(
        id: item_order[:id], 
        category: category
      )
      
      if portfolio_item
        if portfolio_item.update(display_order: item_order[:display_order])
          success_count += 1
        else
          errors << "Failed to update item #{portfolio_item.title}: #{portfolio_item.errors.full_messages.join(', ')}"
        end
      else
        errors << "Portfolio item with ID #{item_order[:id]} not found in category #{category}"
      end
    end
    
    {
      success: errors.empty?,
      updated_count: success_count,
      errors: errors
    }
  end

  def get_portfolio_summary
    items = @vendor_profile.portfolio_items.includes(:images)
    
    {
      total_items: items.count,
      featured_items: items.featured.count,
      categories: items.group(:category).count,
      total_images: items.sum { |item| item.images.count },
      recent_items: items.order(created_at: :desc).limit(5).map do |item|
        {
          id: item.id,
          title: item.title,
          category: item.category,
          image_count: item.images.count,
          is_featured: item.is_featured,
          created_at: item.created_at
        }
      end
    }
  end

  def duplicate_portfolio_item(portfolio_item)
    new_item = portfolio_item.dup
    new_item.title = "#{portfolio_item.title} (Copy)"
    new_item.is_featured = false
    new_item.display_order = get_next_display_order(portfolio_item.category)
    
    if new_item.save
      # Copy images if they exist
      if portfolio_item.images.attached?
        portfolio_item.images.each do |image|
          new_item.images.attach(
            io: StringIO.new(image.download),
            filename: image.filename,
            content_type: image.content_type
          )
        end
      end
      
      { success: true, portfolio_item: new_item }
    else
      { success: false, errors: new_item.errors.full_messages }
    end
  end

  def set_featured_items(item_ids, featured_status = true)
    items = @vendor_profile.portfolio_items.where(id: item_ids)
    updated_count = 0
    errors = []
    
    items.each do |item|
      if item.update(is_featured: featured_status)
        updated_count += 1
      else
        errors << "Failed to update #{item.title}: #{item.errors.full_messages.join(', ')}"
      end
    end
    
    {
      success: errors.empty?,
      updated_count: updated_count,
      errors: errors
    }
  end

  def delete_portfolio_item(portfolio_item)
    category = portfolio_item.category
    
    if portfolio_item.destroy
      reorder_items_in_category(category)
      { success: true }
    else
      { success: false, errors: portfolio_item.errors.full_messages }
    end
  end

  private

  def reorder_items_in_category(category)
    items = @vendor_profile.portfolio_items.where(category: category).order(:display_order, :created_at)
    
    items.each_with_index do |item, index|
      item.update_column(:display_order, index + 1) if item.display_order != (index + 1)
    end
  end

  def get_next_display_order(category)
    max_order = @vendor_profile.portfolio_items.where(category: category).maximum(:display_order) || 0
    max_order + 1
  end
end