# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JsonResponse do
  let(:controller) do
    Class.new(ApplicationController) do
      include JsonResponse
    end.new
  end

  before do
    allow(controller).to receive(:render)
  end

  describe '#render_success' do
    it 'renders with data and ok status' do
      controller.render_success({ id: 1, name: 'Test' })
      expect(controller).to have_received(:render).with(
        json: hash_including(data: { id: 1, name: 'Test' }),
        status: :ok
      )
    end

    it 'renders with message' do
      controller.render_success({ id: 1 }, 'Success')
      expect(controller).to have_received(:render).with(
        json: hash_including(data: { id: 1 }, message: 'Success'),
        status: :ok
      )
    end

    it 'renders with custom status' do
      controller.render_success({ id: 1 }, nil, :created)
      expect(controller).to have_received(:render).with(
        json: { data: { id: 1 } },
        status: :created
      )
    end
  end

  describe '#render_created' do
    it 'renders with created status' do
      controller.render_created({ id: 1 })
      expect(controller).to have_received(:render).with(
        json: { data: { id: 1 } },
        status: :created
      )
    end

    it 'includes message if provided' do
      controller.render_created({ id: 1 }, 'Created successfully')
      expect(controller).to have_received(:render).with(
        json: hash_including(data: { id: 1 }, message: 'Created successfully'),
        status: :created
      )
    end
  end

  describe '#render_errors' do
    it 'renders error hash with unprocessable_content status' do
      errors = { email: 'Invalid email' }
      controller.render_errors(errors)
      expect(controller).to have_received(:render).with(
        json: { errors: errors },
        status: :unprocessable_content
      )
    end

    it 'renders error array' do
      errors = [{ message: 'Error 1' }, { message: 'Error 2' }]
      controller.render_errors(errors)
      expect(controller).to have_received(:render).with(
        json: { errors: errors },
        status: :unprocessable_content
      )
    end

    it 'wraps string error in message' do
      controller.render_errors('Something went wrong')
      expect(controller).to have_received(:render).with(
        json: { errors: { message: 'Something went wrong' } },
        status: :unprocessable_content
      )
    end
  end

  describe '#render_bad_request' do
    it 'renders with bad_request status' do
      controller.render_bad_request('Invalid input')
      expect(controller).to have_received(:render).with(
        json: { errors: 'Invalid input' },
        status: :bad_request
      )
    end
  end

  describe '#render_forbidden' do
    it 'renders with forbidden status' do
      controller.render_forbidden('Not authorized')
      expect(controller).to have_received(:render).with(
        json: { errors: 'Not authorized' },
        status: :forbidden
      )
    end

    it 'uses default message' do
      controller.render_forbidden
      expect(controller).to have_received(:render).with(
        json: { errors: 'Access denied' },
        status: :forbidden
      )
    end
  end

  describe '#render_not_found' do
    it 'renders with not_found status' do
      controller.render_not_found('Booking')
      expect(controller).to have_received(:render).with(
        json: { errors: 'Booking not found' },
        status: :not_found
      )
    end

    it 'uses default resource name' do
      controller.render_not_found
      expect(controller).to have_received(:render).with(
        json: { errors: 'Resource not found' },
        status: :not_found
      )
    end
  end
end
