class DeletePortfolioItem
  include Callable

  def initialize(portfolio_item)
    @portfolio_item = portfolio_item
    @vendor_profile = portfolio_item.vendor_profile
  end

  def call
    category = @portfolio_item.category
    
    if @portfolio_item.destroy
      reorder_items_in_category(category)
      { success: true }
    else
      { success: false, errors: @portfolio_item.errors.full_messages }
    end
  end

  private

  def reorder_items_in_category(category)
    items = @vendor_profile.portfolio_items.where(category: category).order(:display_order, :created_at)
    
    items.each_with_index do |item, index|
      item.update_column(:display_order, index + 1) if item.display_order != (index + 1)
    end
  end
end
