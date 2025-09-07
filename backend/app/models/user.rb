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
class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  # Role enum - customer: 0, vendor: 1, admin: 2
  enum role: { customer: 0, vendor: 1, admin: 2 }

  # Associations
  has_one :vendor_profile, dependent: :destroy
  has_one :customer_profile, dependent: :destroy
  has_many :customer_bookings, class_name: 'Booking', foreign_key: 'customer_id', dependent: :destroy
  has_many :vendor_bookings, class_name: 'Booking', foreign_key: 'vendor_id', dependent: :destroy
  has_many :booking_messages, foreign_key: 'sender_id', dependent: :destroy
  # TODO: Add these associations when models are created in future tasks
  # has_many :reviews, dependent: :destroy

  # Validations
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :role, presence: true
  validates :password, length: { minimum: 8 }, if: :password_required?
  validates :first_name, presence: true, length: { maximum: 50 }
  validates :last_name, presence: true, length: { maximum: 50 }

  # Callbacks
  after_create :create_profile
  before_save :downcase_email

  # Scopes
  scope :customers, -> { where(role: :customer) }
  scope :vendors, -> { where(role: :vendor) }
  scope :admins, -> { where(role: :admin) }
  scope :confirmed, -> { where.not(confirmed_at: nil) }

  # Instance methods
  def customer?
    role == 'customer'
  end

  def vendor?
    role == 'vendor'
  end

  def admin?
    role == 'admin'
  end

  def confirmed?
    confirmed_at.present?
  end

  def full_name
    "#{first_name} #{last_name}".strip
  end

  private

  def create_profile
    case role
    when 'vendor'
      create_vendor_profile!(business_name: "#{full_name}'s Business", location: 'Not specified') unless vendor_profile.present?
    when 'customer'
      create_customer_profile! unless customer_profile.present?
    end
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "Failed to create profile for user #{id}: #{e.message}"
  end

  def downcase_email
    self.email = email.downcase if email.present?
  end

  def password_required?
    !persisted? || !password.nil? || !password_confirmation.nil?
  end
end
