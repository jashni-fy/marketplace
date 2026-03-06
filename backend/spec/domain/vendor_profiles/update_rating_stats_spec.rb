# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorProfiles::UpdateRatingStats do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }

  describe '.call' do
    it 'updates the vendor profile with average rating and total reviews' do
      reviews_double = double('reviews')
      allow(vendor_profile).to receive(:reviews).and_return(reviews_double)

      # Mocking the pluck result: [count, avg_rating, avg_quality, avg_comm, avg_value, avg_punctuality]
      allow(reviews_double).to receive_messages(published: reviews_double, pluck: [[2, 4.5, 5.0, 4.0, 4.5, 4.5]])

      result = described_class.call(vendor_profile: vendor_profile)

      expect(vendor_profile.average_rating.to_f).to eq(4.5)
      expect(vendor_profile.total_reviews).to eq(2)

      expect(result[:count]).to eq(2)
      expect(result[:average]).to eq(4.5)
      expect(result[:quality]).to eq(5.0)
    end
  end
end
