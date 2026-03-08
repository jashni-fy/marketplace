# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ServiceCategory do
  describe 'associations' do
    it { is_expected.to belong_to(:service) }
    it { is_expected.to belong_to(:category) }
  end

  describe 'validations' do
    subject { build(:service_category, service: service, category: category) }

    let(:service) { create(:service) }
    let(:category) { create(:category) }

    it { is_expected.to be_valid }

    describe 'service_id uniqueness' do
      before { create(:service_category, service: service, category: category) }

      it 'validates uniqueness scoped to category_id' do
        duplicate = build(:service_category, service: service, category: category)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:service_id]).to include('has already been taken')
      end

      it 'allows same service with different category' do
        other_category = create(:category)
        another = build(:service_category, service: service, category: other_category)
        expect(another).to be_valid
      end
    end
  end
end
