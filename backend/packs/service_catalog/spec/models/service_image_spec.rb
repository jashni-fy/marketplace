# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ServiceImage do
  let(:service) { create(:service) }
  let(:service_image) { build(:service_image, service: service) }

  describe 'associations' do
    it { is_expected.to belong_to(:service) }
    it { is_expected.to have_one_attached(:image) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:service_id) }
    it { is_expected.to validate_presence_of(:display_order) }
    it { is_expected.to validate_numericality_of(:display_order).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_length_of(:title).is_at_most(255) }
    it { is_expected.to validate_length_of(:description).is_at_most(1000) }
    it { is_expected.to validate_length_of(:alt_text).is_at_most(255) }

    describe 'image_attached validation' do
      it 'is invalid without an attached image' do
        service_image = build(:service_image, :without_image, service: service)
        expect(service_image).not_to be_valid
        expect(service_image.errors[:image]).to include('must be attached')
      end

      it 'is valid with an attached image' do
        expect(service_image).to be_valid
      end
    end

    describe 'image_content_type validation' do
      it 'accepts JPEG images' do
        expect(service_image).to be_valid
      end

      it 'accepts PNG images' do
        service_image = build(:service_image, :with_png_image, service: service)
        expect(service_image).to be_valid
      end

      it 'rejects invalid content types' do
        service_image.image.attach(
          io: StringIO.new('fake content'),
          filename: 'test.txt',
          content_type: 'text/plain'
        )
        expect(service_image).not_to be_valid
        expect(service_image.errors[:image]).to include('must be a JPEG, PNG, or WebP file')
      end
    end

    describe 'only_one_primary_per_service validation' do
      it 'allows one primary image per service' do
        primary_image = create(:service_image, :primary, service: service)
        expect(primary_image).to be_valid
      end

      it 'prevents multiple primary images per service' do
        create(:service_image, :primary, service: service)
        second_primary = build(:service_image, :primary, service: service)

        expect(second_primary).not_to be_valid
        expect(second_primary.errors[:is_primary]).to include('can only have one primary image per service')
      end

      it 'allows primary images for different services' do
        other_service = create(:service)
        create(:service_image, :primary, service: service)
        second_primary = build(:service_image, :primary, service: other_service)

        expect(second_primary).to be_valid
      end
    end
  end

  describe 'scopes' do
    let(:other_service) { create(:service) }
    let!(:first_image) do
      img = create(:service_image, service: service, display_order: 1)
      img.update(is_primary: false)
      img
    end
    let!(:second_image) do
      img = create(:service_image, service: other_service, display_order: 0)
      img.update(is_primary: false)
      img
    end
    let!(:primary_image) do
      img = create(:service_image, service: service, display_order: 2)
      img.update(is_primary: true)
      img
    end

    describe '.ordered' do
      it 'returns images ordered by display_order and created_at' do
        expect(described_class.ordered).to eq([second_image, first_image, primary_image])
      end
    end

    describe '.primary' do
      it 'returns only primary images' do
        expect(described_class.primary).to eq([primary_image])
      end
    end

    describe '.non_primary' do
      it 'returns only non-primary images' do
        expect(described_class.non_primary.where(service: [service,
                                                           other_service])).to contain_exactly(first_image,
                                                                                               second_image)
      end
    end
  end

  describe 'callbacks' do
    describe 'set_primary_if_first_image' do
      it 'sets the first image as primary automatically' do
        first_image = create(:service_image, service: service, is_primary: false)
        expect(first_image.reload.is_primary).to be true
      end

      it 'does not change primary status if other images exist' do
        create(:service_image, :primary, service: service)
        second_image = create(:service_image, service: service, is_primary: false)
        expect(second_image.is_primary).to be false
      end
    end

    describe 'reassign_primary_if_needed' do
      it 'reassigns primary to next image when primary is deleted' do
        primary_image = create(:service_image, :primary, service: service, display_order: 0)
        second_image = create(:service_image, service: service, display_order: 1)

        primary_image.destroy
        expect(second_image.reload.is_primary).to be true
      end

      it 'does nothing when non-primary image is deleted' do
        primary_image = create(:service_image, :primary, service: service)
        second_image = create(:service_image, service: service)

        second_image.destroy
        expect(primary_image.reload.is_primary).to be true
      end
    end
  end

  describe 'instance methods' do
    describe '#primary?' do
      it 'returns true for primary images' do
        primary_image = create(:service_image, :primary, service: service)
        expect(primary_image.primary?).to be true
      end

      it 'returns false for non-primary images' do
        expect(service_image.primary?).to be false
      end
    end

    describe '#image_url' do
      it 'returns nil when no image is attached' do
        service_image = build(:service_image, :without_image, service: service)
        expect(service_image.image_url).to be_nil
      end

      it 'returns URL when image is attached' do
        service_image.save!
        expect(service_image.image_url).to be_present
        expect(service_image.image_url).to include('/rails/active_storage/blobs/')
      end
    end

    describe '#thumbnail_url' do
      it 'returns variant URL for thumbnail' do
        service_image.save!
        expect(service_image.thumbnail_url).to be_present
        expect(service_image.thumbnail_url).to include('/rails/active_storage/representations/')
      end
    end

    describe '#file_size_mb' do
      it 'returns 0 when no image is attached' do
        service_image = build(:service_image, :without_image, service: service)
        expect(service_image.file_size_mb).to eq(0)
      end

      it 'returns file size in MB when image is attached' do
        service_image.save!
        expect(service_image.file_size_mb).to be >= 0
      end
    end
  end

  describe 'class methods' do
    let!(:service_image_one) { create(:service_image, service: service, display_order: 2) }
    let!(:service_image_two) { create(:service_image, service: service, display_order: 1) }
    let!(:service_image_three) { create(:service_image, service: service, display_order: 0) }

    describe '.reorder_for_service' do
      it 'reorders images based on provided IDs' do
        described_class.reorder_for_service(service.id,
                                            [service_image_one.id, service_image_three.id, service_image_two.id])

        expect(service_image_one.reload.display_order).to eq(0)
        expect(service_image_three.reload.display_order).to eq(1)
        expect(service_image_two.reload.display_order).to eq(2)
      end
    end

    describe '.set_primary_for_service' do
      it 'sets specified image as primary and others as non-primary' do
        # Create first image which will be primary by default, then create another
        primary_img = create(:service_image, service: service, is_primary: false)
        primary_img.update(is_primary: true)

        described_class.set_primary_for_service(service.id, service_image_two.id)

        expect(service_image_two.reload.is_primary).to be true
        expect(service.service_images.where.not(id: service_image_two.id).pluck(:is_primary)).to all(be false)
      end
    end
  end
end
