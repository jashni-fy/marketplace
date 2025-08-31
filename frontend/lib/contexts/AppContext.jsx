'use client';

import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  notifications: [],
  loading: false,
  error: null,
  searchFilters: {
    category: '',
    location: '',
    priceRange: { min: 0, max: 10000 },
    availability: null,
  },
  selectedService: null,
  bookingData: null,
};

// Action types
const APP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_SEARCH_FILTERS: 'SET_SEARCH_FILTERS',
  CLEAR_SEARCH_FILTERS: 'CLEAR_SEARCH_FILTERS',
  SET_SELECTED_SERVICE: 'SET_SELECTED_SERVICE',
  SET_BOOKING_DATA: 'SET_BOOKING_DATA',
  CLEAR_BOOKING_DATA: 'CLEAR_BOOKING_DATA',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case APP_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case APP_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };

    case APP_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    case APP_ACTIONS.SET_SEARCH_FILTERS:
      return {
        ...state,
        searchFilters: {
          ...state.searchFilters,
          ...action.payload,
        },
      };

    case APP_ACTIONS.CLEAR_SEARCH_FILTERS:
      return {
        ...state,
        searchFilters: initialState.searchFilters,
      };

    case APP_ACTIONS.SET_SELECTED_SERVICE:
      return {
        ...state,
        selectedService: action.payload,
      };

    case APP_ACTIONS.SET_BOOKING_DATA:
      return {
        ...state,
        bookingData: action.payload,
      };

    case APP_ACTIONS.CLEAR_BOOKING_DATA:
      return {
        ...state,
        bookingData: null,
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// App provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Loading actions
  const setLoading = (loading) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading });
  };

  // Error actions
  const setError = (error) => {
    dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR });
  };

  // Notification actions
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const notificationWithId = { ...notification, id };
    dispatch({ type: APP_ACTIONS.ADD_NOTIFICATION, payload: notificationWithId });

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return id;
  };

  const removeNotification = (id) => {
    dispatch({ type: APP_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_NOTIFICATIONS });
  };

  // Search filter actions
  const setSearchFilters = (filters) => {
    dispatch({ type: APP_ACTIONS.SET_SEARCH_FILTERS, payload: filters });
  };

  const clearSearchFilters = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_SEARCH_FILTERS });
  };

  // Service selection actions
  const setSelectedService = (service) => {
    dispatch({ type: APP_ACTIONS.SET_SELECTED_SERVICE, payload: service });
  };

  // Booking data actions
  const setBookingData = (data) => {
    dispatch({ type: APP_ACTIONS.SET_BOOKING_DATA, payload: data });
  };

  const clearBookingData = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_BOOKING_DATA });
  };

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    addNotification,
    removeNotification,
    clearNotifications,
    setSearchFilters,
    clearSearchFilters,
    setSelectedService,
    setBookingData,
    clearBookingData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;