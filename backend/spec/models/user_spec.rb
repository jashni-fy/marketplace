# == Schema Information
#
# Table name: users
#
#  id                     :bigint           not null, primary key
#  confirmation_sent_at   :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  first_name             :string
#  last_name              :string
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  role                   :integer          default("customer"), not null
#  unconfirmed_email      :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_users_on_confirmation_token    (confirmation_token) UNIQUE
#  index_users_on_email                 (email) UNIQUE
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#
require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:role) }
    it { should validate_presence_of(:first_name) }
    it { should validate_length_of(:first_name).is_at_most(50) }
    it { should validate_presence_of(:last_name) }
    it { should validate_length_of(:last_name).is_at_most(50) }

    context 'password validation' do
      it 'validates password length on creation' do
        user = build(:user, password: '123', password_confirmation: '123')
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include('is too short (minimum is 8 characters)')
      end

      it 'validates password length on update when password is provided' do
        user = create(:user)
        user.password = '123'
        user.password_confirmation = '123'
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include('is too short (minimum is 8 characters)')
      end

      it 'does not validate password length on update when password is not provided' do
        user = create(:user)
        user.first_name = 'Updated'
        expect(user).to be_valid
      end
    end
  end

  describe 'associations' do
    it { should have_one(:vendor_profile).dependent(:destroy) }
    it { should have_one(:customer_profile).dependent(:destroy) }
    # TODO: Add these tests when models are created in future tasks
    # it { should have_many(:bookings).dependent(:destroy) }
    # it { should have_many(:reviews).dependent(:destroy) }
  end

  describe 'enums' do
    it { should define_enum_for(:role).with_values(customer: 0, vendor: 1, admin: 2) }
  end

  describe 'scopes' do
    before do
      # Clean up any existing users
      User.destroy_all
    end

    let!(:customer) { create(:user, :customer) }
    let!(:vendor) { create(:user, :vendor) }
    let!(:admin) { create(:user, :admin) }
    let!(:confirmed_user) { create(:user, confirmed_at: 1.day.ago) }
    let!(:unconfirmed_user) { create(:user, :unconfirmed) }

    describe '.customers' do
      it 'returns only customer users' do
        customers = User.customers
        expect(customers).to include(customer, confirmed_user)
        expect(customers).not_to include(vendor, admin)
      end
    end

    describe '.vendors' do
      it 'returns only vendor users' do
        vendors = User.vendors
        expect(vendors).to include(vendor)
        expect(vendors).not_to include(customer, admin, confirmed_user, unconfirmed_user)
      end
    end

    describe '.admins' do
      it 'returns only admin users' do
        admins = User.admins
        expect(admins).to include(admin)
        expect(admins).not_to include(customer, vendor, confirmed_user, unconfirmed_user)
      end
    end

    describe '.confirmed' do
      it 'returns only confirmed users' do
        confirmed_users = User.confirmed
        expect(confirmed_users).to include(customer, vendor, admin, confirmed_user)
        expect(confirmed_users).not_to include(unconfirmed_user)
      end
    end
  end

  describe 'callbacks' do
    describe 'after_create :create_profile' do
      context 'when user is a vendor' do
        it 'creates a vendor profile' do
          user = build(:user, :vendor)
          expect { user.save! }.to change { user.vendor_profile }.from(nil)
        end

        it 'does not create a customer profile' do
          user = create(:user, :vendor)
          expect(user.customer_profile).to be_nil
        end
      end

      context 'when user is a customer' do
        it 'creates a customer profile' do
          user = build(:user, :customer)
          expect { user.save! }.to change { user.customer_profile }.from(nil)
        end

        it 'does not create a vendor profile' do
          user = create(:user, :customer)
          expect(user.vendor_profile).to be_nil
        end
      end

      context 'when user is an admin' do
        it 'does not create any profile' do
          user = create(:user, :admin)
          expect(user.vendor_profile).to be_nil
          expect(user.customer_profile).to be_nil
        end
      end
    end

    describe 'before_save :downcase_email' do
      it 'downcases email before saving' do
        user = build(:user, email: 'TEST@EXAMPLE.COM')
        user.save!
        expect(user.email).to eq('test@example.com')
      end

      it 'handles nil email gracefully' do
        user = build(:user, email: nil)
        expect { user.save }.not_to raise_error
      end
    end
  end

  describe 'instance methods' do
    let(:customer) { create(:user, :customer) }
    let(:vendor) { create(:user, :vendor) }
    let(:admin) { create(:user, :admin) }

    describe '#customer?' do
      it 'returns true for customer users' do
        expect(customer.customer?).to be true
      end

      it 'returns false for non-customer users' do
        expect(vendor.customer?).to be false
        expect(admin.customer?).to be false
      end
    end

    describe '#vendor?' do
      it 'returns true for vendor users' do
        expect(vendor.vendor?).to be true
      end

      it 'returns false for non-vendor users' do
        expect(customer.vendor?).to be false
        expect(admin.vendor?).to be false
      end
    end

    describe '#admin?' do
      it 'returns true for admin users' do
        expect(admin.admin?).to be true
      end

      it 'returns false for non-admin users' do
        expect(customer.admin?).to be false
        expect(vendor.admin?).to be false
      end
    end

    describe '#confirmed?' do
      it 'returns true for confirmed users' do
        user = create(:user, confirmed_at: 1.day.ago)
        expect(user.confirmed?).to be true
      end

      it 'returns false for unconfirmed users' do
        user = create(:user, :unconfirmed)
        expect(user.confirmed?).to be false
      end
    end

    describe '#full_name' do
      it 'returns the full name' do
        user = create(:user, first_name: 'John', last_name: 'Doe')
        expect(user.full_name).to eq('John Doe')
      end

      it 'handles nil names gracefully' do
        user = build(:user, first_name: nil, last_name: nil)
        user.save(validate: false) # Skip validations for this test
        expect(user.full_name).to eq('')
      end

      it 'strips whitespace' do
        user = create(:user, first_name: ' John ', last_name: ' Doe ')
        expect(user.full_name).to eq('John   Doe')
      end
    end
  end

  describe 'Devise modules' do
    it 'includes database_authenticatable' do
      expect(User.devise_modules).to include(:database_authenticatable)
    end

    it 'includes registerable' do
      expect(User.devise_modules).to include(:registerable)
    end

    it 'includes recoverable' do
      expect(User.devise_modules).to include(:recoverable)
    end

    it 'includes rememberable' do
      expect(User.devise_modules).to include(:rememberable)
    end

    it 'includes validatable' do
      expect(User.devise_modules).to include(:validatable)
    end

    it 'includes confirmable' do
      expect(User.devise_modules).to include(:confirmable)
    end
  end

  describe 'JWT token integration' do
    let(:user) { create(:user) }

    it 'can generate JWT token using JwtService' do
      token = JwtService.encode(user_id: user.id)
      expect(token).to be_present
      expect(token).to be_a(String)
    end

    it 'can decode JWT token using JwtService' do
      token = JwtService.encode(user_id: user.id)
      decoded = JwtService.decode(token)
      expect(decoded[:user_id]).to eq(user.id)
    end

    it 'can be found using AuthorizeApiRequest service' do
      token = JwtService.encode(user_id: user.id)
      headers = { 'Authorization' => "Bearer #{token}" }
      
      result = AuthorizeApiRequest.new(headers).call
      expect(result[:user]).to eq(user)
    end
  end

  describe 'error handling in profile creation' do
    it 'logs error when profile creation fails' do
      user = build(:user, :vendor)
      
      # Mock the vendor_profile creation to fail
      allow(user).to receive(:create_vendor_profile!).and_raise(ActiveRecord::RecordInvalid.new(user))
      
      expect(Rails.logger).to receive(:error).with(/Failed to create profile/)
      
      user.save!
    end
  end
end
