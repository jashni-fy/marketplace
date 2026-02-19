class CreatePortfolioItem
  include Callable

  def initialize(vendor_profile, params)
    @vendor_profile = vendor_profile
    @params = params
  end

  def call
    portfolio_item = @vendor_profile.portfolio_items.build(@params)
    
    if portfolio_item.save
      reorder_items_in_category(portfolio_item.category) if @params[:display_order].present?
      { success: true, portfolio_item: portfolio_item }
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
end
