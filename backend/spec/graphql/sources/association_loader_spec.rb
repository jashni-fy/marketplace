# frozen_string_literal: true

require 'rails_helper'

describe Sources::AssociationLoader do
  describe '#fetch' do
    let!(:vendor1) { create(:vendor_profile) }
    let!(:vendor2) { create(:vendor_profile) }
    let!(:service1) { create(:service, vendor_profile: vendor1) }
    let!(:service2) { create(:service, vendor_profile: vendor2) }

    it 'loads associations with a single preloader call' do
      services = [service1, service2]

      expect(ActiveRecord::Associations::Preloader).to receive(:new).once.and_call_original

      result = described_class.new(:vendor_profile).fetch(services)

      expect(result).to eq([vendor1, vendor2])
    end

    it 'returns associations in the same order as input records' do
      services = [service1, service2]
      result = described_class.new(:vendor_profile).fetch(services)

      expect(result.map(&:id)).to eq([vendor1.id, vendor2.id])
    end

    it 'works with has_many associations' do
      reviews1 = create_list(:review, 2, vendor_profile: vendor1)
      reviews2 = create_list(:review, 2, vendor_profile: vendor2)

      vendors = [vendor1, vendor2]
      result = described_class.new(:reviews).fetch(vendors)

      expect(result[0]).to match_array(reviews1)
      expect(result[1]).to match_array(reviews2)
    end
  end
end
