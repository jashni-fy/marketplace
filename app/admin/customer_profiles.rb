ActiveAdmin.register CustomerProfile do
  # Permitted parameters
  permit_params :user_id, :phone, :address, :date_of_birth

  # Index page configuration
  index do
    selectable_column
    id_column
    column :user do |profile|
      link_to profile.user.full_name, admin_user_path(profile.user) if profile.user
    end
    column :phone
    column :address
    column :date_of_birth
    column :created_at
    actions
  end

  # Filters
  filter :user, collection: -> { User.customers.map { |u| [u.full_name, u.id] } }
  filter :phone
  filter :address
  filter :date_of_birth
  filter :created_at

  # Show page
  show do
    attributes_table do
      row :id
      row :user do |profile|
        link_to profile.user.full_name, admin_user_path(profile.user) if profile.user
      end
      row :phone
      row :address
      row :date_of_birth
      row :created_at
      row :updated_at
    end
  end

  # Form
  form do |f|
    f.inputs "Customer Profile Details" do
      f.input :user, collection: User.customers.map { |u| [u.full_name, u.id] }
      f.input :phone
      f.input :address, as: :text
      f.input :date_of_birth, as: :date_picker
    end
    f.actions
  end

  # Scopes
  scope :all
  scope :with_phone, -> { where.not(phone: [nil, '']) }
  scope :with_address, -> { where.not(address: [nil, '']) }
end
