# frozen_string_literal: true

module VendorSerializable
  extend ActiveSupport::Concern

  private

  def vendor_summary_json(vendor)
    {
      id: vendor.id,
      business_name: vendor.business_name,
      location: vendor.location,
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      years_experience: vendor.years_experience,
      is_verified: vendor.verified?,
      service_categories: vendor.service_categories_list,
      featured_portfolio: vendor.featured_portfolio_items.limit(3).map { |item| portfolio_item_json(item) }
    }
  end

  def vendor_detail_json(vendor)
    {
      id: vendor.id,
      business_name: vendor.business_name,
      description: vendor.description,
      location: vendor.location,
      phone: vendor.phone,
      website: vendor.website,
      years_experience: vendor.years_experience,
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      is_verified: vendor.verified?,
      service_categories: vendor.service_categories_list,
      coordinates: vendor.coordinates,
      portfolio_items_count: vendor.portfolio_items.count,
      featured_portfolio: vendor.featured_portfolio_items.map { |item| portfolio_item_json(item) },
      user: vendor_user_json(vendor.user),
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    }
  end

  def vendor_user_json(user)
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    }
  end

  def service_json(service)
    {
      id: service.id,
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      pricing_type: service.pricing_type,
      category: {
        id: service.service_category.id,
        name: service.service_category.name,
        slug: service.service_category.slug
      },
      images: service.service_images.limit(3).map { |img| image_summary_json(img) }
    }
  end

  def portfolio_item_json(item)
    {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      is_featured: item.is_featured,
      images: item.images.attached? ? item.images.limit(1).map { |image| image_summary_json(image) } : []
    }
  end

  def availability_slot_json(slot)
    {
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available
    }
  end

  def image_summary_json(image)
    {
      id: image.id,
      url: image.is_a?(ActiveStorage::Attachment) ? url_for(image) : nil
    }
  rescue StandardError
    { id: image.id, url: nil }
  end
end
