class PortfolioSummaryService
  include Callable

  def initialize(vendor_profile)
    @vendor_profile = vendor_profile
  end

  def call
    items = @vendor_profile.portfolio_items
    
    {
      total_items: items.count,
      featured_items: items.featured.count,
      categories: items.group(:category).count,
      total_images: items.sum { |item| item.image_count },
      recent_items: items.order(created_at: :desc).limit(5).map do |item|
        {
          id: item.id,
          title: item.title,
          category: item.category,
          image_count: item.image_count,
          is_featured: item.is_featured,
          created_at: item.created_at
        }
      end
    }
  end
end
