// moodmirror/src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// User Profile API calls
export const profileAPI = {
  // Get user profile
  getProfile: () => apiCall('/profile'),
  
  // Update profile
  updateProfile: (profileData) => apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  
  // Update account settings
  updateAccountSettings: (settings) => apiCall('/profile/account', {
    method: 'PUT',
    body: JSON.stringify(settings)
  }),
  
  // Update preferences
  updatePreferences: (preferences) => apiCall('/profile/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences)
  }),
  
  // Get profile statistics
  getProfileStats: () => apiCall('/profile/stats'),
  
  // Delete profile (soft delete)
  deleteProfile: () => apiCall('/profile', {
    method: 'DELETE'
  }),
  
  // Reactivate profile
  reactivateProfile: () => apiCall('/profile/reactivate', {
    method: 'POST'
  })
};

// Recommendations API calls
export const recommendationsAPI = {
  // Get mood-based recommendations
  getMoodRecommendations: (moodType, category = null, limit = 5) => {
    let endpoint = `/recommendations/mood/${moodType}`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return apiCall(endpoint);
  },
  
  // Get available categories
  getCategories: () => apiCall('/recommendations/categories'),
  
  // Submit feedback
  submitFeedback: (feedbackData) => apiCall('/recommendations/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  })
};

// Auth API calls (if needed)
export const authAPI = {
  // Login
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  // Register
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  // Forgot password
  forgotPassword: (email) => apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  
  // Get current user
  getCurrentUser: () => apiCall('/auth/me')
};

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Not set';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateAccountAge = (createdAt) => {
  if (!createdAt) return 0;
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Progress API calls
export const progressAPI = {
  // Get progress overview
  getProgressOverview: (days = 30) => apiCall(`/progress/overview?days=${days}`),
  
  // Get progress trends
  getProgressTrends: (period = 'month', granularity = 'day') => 
    apiCall(`/progress/trends?period=${period}&granularity=${granularity}`),
  
  // Get progress insights
  getProgressInsights: (days = 30) => apiCall(`/progress/insights?days=${days}`),
  
  // Get progress goals
  getProgressGoals: (days = 30) => apiCall(`/progress/goals?days=${days}`)
};

// Emotion Analysis API calls
export const emotionAPI = {
  // Analyze emotion from image/video
  analyzeEmotion: (formData) => {
    return fetch(`${API_BASE_URL}/emotions/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    }).then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.message || 'Analysis failed');
        });
      }
      return response.json();
    });
  },
  
  // Get emotion history
  getEmotionHistory: () => apiCall('/emotions/history'),
  
  // Get emotion trends
  getEmotionTrends: () => apiCall('/emotions/trends')
};

export default {
  profileAPI,
  recommendationsAPI,
  authAPI,
  emotionAPI,
  progressAPI,
  formatDate,
  formatDateTime,
  calculateAccountAge
};