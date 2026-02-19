class AddExtendedVerificationToVendorProfiles < ActiveRecord::Migration[7.1]
  def change
    add_column :vendor_profiles, :verification_status, :integer, default: 0 # 0: unverified, 1: pending, 2: verified, 3: rejected
    add_column :vendor_profiles, :verified_at, :datetime
    add_column :vendor_profiles, :rejection_reason, :text
    
    add_index :vendor_profiles, :verification_status
  end
end
