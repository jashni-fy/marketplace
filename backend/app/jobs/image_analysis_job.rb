# frozen_string_literal: true

class ImageAnalysisJob < ApplicationJob
  # Low priority: metadata analysis can happen at non-peak times
  queue_as :low

  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(service_image_id)
    service_image = ServiceImage.find(service_image_id)

    return unless service_image.image.attached?
    return if service_image.image.blob.analyzed?

    service_image.image.blob.analyze

    Rails.logger.info "Analyzed image metadata for ServiceImage #{service_image_id}"
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn "ServiceImage #{service_image_id} not found, skipping analysis"
  rescue StandardError => e
    Rails.logger.error "Image analysis failed for ServiceImage #{service_image_id}: #{e.message}"
    raise e
  end
end
