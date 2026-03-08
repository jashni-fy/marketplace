import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '../AppContext';

jest.useFakeTimers();

const contextRef: { current: ReturnType<typeof useApp> | null } = {
  current: null,
};

const ContextTester = () => {
  const context = useApp();
  contextRef.current = context;

  return (
    <div>
      <span data-testid="loading">{context.loading ? 'true' : 'false'}</span>
      <span data-testid="category">{context.searchFilters.category}</span>
      <span data-testid="notifications">{context.notifications.length}</span>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AppProvider>
      <ContextTester />
    </AppProvider>
  );

describe('AppContext', () => {
  beforeEach(() => {
    contextRef.current = null;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('applies loading and search filter updates', async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(contextRef.current).not.toBeNull();
    });

    act(() => {
      contextRef.current?.setLoading(true);
      contextRef.current?.setSearchFilters({ category: 'wedding' });
      contextRef.current?.addNotification({ title: 'Test', message: 'Message' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('category')).toHaveTextContent('wedding');
      expect(screen.getByTestId('notifications')).toHaveTextContent('1');
    });
  });

  it('removes notifications after timeout', async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(contextRef.current).not.toBeNull();
    });

    act(() => {
      contextRef.current?.addNotification({ title: 'Timer', message: 'Reminder' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications')).toHaveTextContent('1');
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications')).toHaveTextContent('0');
    });
  });
});
