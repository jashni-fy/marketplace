ActiveAdmin.register VendorProfile do
  # Permitted parameters
  permit_params :user_id, :business_name, :business_description, :business_address, :business_phone, :business_email

  # Index page configuration
  index do
    selectable_column
    id_column
    column :user do |profile|
      link_to profile.user.full_name, admin_user_path(profile.user) if profile.user
    end
    column :business_name
    column :business_email
    column :business_phone
    column :created_at
    actions
  end

  # Filters
  filter :user, collection: -> { User.vendors.map { |u| [u.full_name, u.id] } }
  filter :business_name
  filter :business_email
  filter :business_phone
  filter :created_at

  # Show page
  show do
    attributes_table do
      row :id
      row :user do |profile|
        link_to profile.user.full_name, admin_user_path(profile.user) if profile.user
      end
      row :business_name
      row :business_description
      row :business_address
      row :business_phone
      row :business_email
      row :created_at
      row :updated_at
    end
  end

  # Form
  form do |f|
    f.inputs "Vendor Profile Details" do
      f.input :user, collection: User.vendors.map { |u| [u.full_name, u.id] }
      f.input :business_name
      f.input :business_description, as: :text
      f.input :business_address, as: :text
      f.input :business_phone
      f.input :business_email
    end
    f.actions
  end

  # Scopes
  scope :all
  scope :with_business_name, -> { where.not(business_name: [nil, '']) }
  scope :with_business_email, -> { where.not(business_email: [nil, '']) }
end
