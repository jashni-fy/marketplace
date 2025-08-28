import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegister,
      error: null,
      clearError: mockClearError,
    });
  });

  it('should render registration form', () => {
    renderRegister();

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('I want to')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByText('sign in to your existing account')).toBeInTheDocument();
  });

  it('should update form fields when user types', async () => {
    const user = userEvent.setup();
    renderRegister();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('should clear error when user types', async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({
      register: mockRegister,
      error: 'Email already exists',
      clearError: mockClearError,
    });

    renderRegister();

    const emailInput = screen.getByLabelText('Email address');
    await user.type(emailInput, 'test@example.com');

    expect(mockClearError).toHaveBeenCalled();
  });

  it('should display error message when error exists', () => {
    useAuth.mockReturnValue({
      register: mockRegister,
      error: 'Email already exists',
      clearError: mockClearError,
    });

    renderRegister();

    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('should show password mismatch error', async () => {
    const user = userEvent.setup();
    renderRegister();

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different');

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('should disable submit button when passwords do not match', async () => {
    const user = userEvent.setup();
    renderRegister();

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different');

    expect(submitButton).toBeDisabled();
  });

  it('should submit form with correct data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ success: true });

    renderRegister();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email address');
    const roleSelect = screen.getByLabelText('I want to');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.selectOptions(roleSelect, 'vendor');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
      password_confirmation: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      role: 'vendor',
    });
  });

  it('should navigate to dashboard on successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ success: true });

    renderRegister();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveRegister;
    mockRegister.mockReturnValue(new Promise(resolve => {
      resolveRegister = resolve;
    }));

    renderRegister();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the registration
    resolveRegister({ success: true });
    
    await waitFor(() => {
      expect(screen.getByText('Create account')).toBeInTheDocument();
    });
  });

  it('should not navigate on failed registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ success: false });

    renderRegister();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('should have default role as customer', () => {
    renderRegister();

    const roleSelect = screen.getByLabelText('I want to');
    expect(roleSelect).toHaveValue('customer');
  });

  it('should allow role selection', async () => {
    const user = userEvent.setup();
    renderRegister();

    const roleSelect = screen.getByLabelText('I want to');
    
    await user.selectOptions(roleSelect, 'vendor');
    expect(roleSelect).toHaveValue('vendor');

    await user.selectOptions(roleSelect, 'customer');
    expect(roleSelect).toHaveValue('customer');
  });

  it('should require all fields', () => {
    renderRegister();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    expect(firstNameInput).toBeRequired();
    expect(lastNameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });

  it('should have correct input types', () => {
    renderRegister();

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should not submit when passwords do not match', async () => {
    const user = userEvent.setup();
    renderRegister();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different');

    // Try to submit - the form doesn't have a role, so we'll click the submit button
    // But since it's disabled, the form shouldn't submit
    expect(submitButton).toBeDisabled();

    expect(mockRegister).not.toHaveBeenCalled();
  });
});