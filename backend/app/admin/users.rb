ActiveAdmin.register User do
  # Permitted parameters for creating and updating users
  permit_params :email, :password, :password_confirmation, :role, :first_name, :last_name, :confirmed_at

  # Index page configuration
  index do
    selectable_column
    id_column
    column :email
    column :first_name
    column :last_name
    column :full_name
    column :role do |user|
      status_tag user.role.humanize, class: user.role
    end
    column :confirmed do |user|
      status_tag(user.confirmed? ? 'Yes' : 'No')
    end
    column :created_at
    actions
  end

  # Filters for the index page
  filter :email
  filter :first_name
  filter :last_name
  filter :role, as: :select, collection: User.roles.keys.map { |role| [role.humanize, role] }
  filter :confirmed_at
  filter :created_at

  # Show page configuration
  show do
    attributes_table do
      row :id
      row :email
      row :first_name
      row :last_name
      row :full_name
      row :role do |user|
        status_tag user.role.humanize, class: user.role
      end
      row :confirmed do |user|
        status_tag(user.confirmed? ? 'Yes' : 'No', user.confirmed? ? :ok : :error)
      end
      row :confirmed_at
      row :created_at
      row :updated_at
    end

    panel "Profile Information" do
      if resource.vendor?
        attributes_table_for resource.vendor_profile do
          row :business_name
          row :business_description
          row :business_address
          row :business_phone
          row :business_email
          row :created_at
        end if resource.vendor_profile
      elsif resource.customer?
        attributes_table_for resource.customer_profile do
          row :phone
          row :address
          row :date_of_birth
          row :created_at
        end if resource.customer_profile
      end
    end
  end

  # Form configuration
  form do |f|
    f.inputs "User Details" do
      f.input :email
      f.input :first_name
      f.input :last_name
      f.input :role, as: :select, collection: User.roles.keys.map { |role| [role.humanize, role] }
      f.input :confirmed_at, as: :datetime_picker, hint: "Leave blank to keep user unconfirmed"
    end

    f.inputs "Password" do
      f.input :password
      f.input :password_confirmation
    end

    f.actions
  end

  # Scopes for filtering
  scope :all
  scope :customers
  scope :vendors
  scope :admins
  scope :confirmed, -> { where.not(confirmed_at: nil) }
  scope :unconfirmed, -> { where(confirmed_at: nil) }

  # Custom actions
  member_action :confirm, method: :put do
    resource.confirm
    redirect_to admin_user_path(resource), notice: "User confirmed successfully!"
  end

  action_item :confirm, only: :show, if: proc { !resource.confirmed? } do
    link_to "Confirm User", confirm_admin_user_path(resource), method: :put, 
            data: { confirm: "Are you sure you want to confirm this user?" }
  end

  # Batch actions
  batch_action :confirm, if: proc { true } do |ids|
    User.where(id: ids).find_each(&:confirm)
    redirect_to collection_path, notice: "#{ids.count} users confirmed successfully!"
  end

  batch_action :make_customer, if: proc { true } do |ids|
    User.where(id: ids).update_all(role: :customer)
    redirect_to collection_path, notice: "#{ids.count} users updated to customer role!"
  end

  batch_action :make_vendor, if: proc { true } do |ids|
    User.where(id: ids).update_all(role: :vendor)
    redirect_to collection_path, notice: "#{ids.count} users updated to vendor role!"
  end
end
