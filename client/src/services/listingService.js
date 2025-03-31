import api from './api';

// Get all listings
export const getListings = async (filters = {}) => {
  try {
    const response = await api.get('/api/listings', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch listings' };
  }
};

// Alias for getListings to maintain backward compatibility
export const fetchListings = getListings;

// Get a specific listing by ID
export const getListingById = async (id) => {
  try {
    const response = await api.get(`/api/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch listing' };
  }
};

// Create a new listing
export const createListing = async (listingData) => {
  try {
    const response = await api.post('/api/listings', listingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create listing' };
  }
};

// Update an existing listing
export const updateListing = async (id, listingData) => {
  try {
    const response = await api.put(`/api/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update listing' };
  }
};

// Delete a listing
export const deleteListing = async (id) => {
  try {
    const response = await api.delete(`/api/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete listing' };
  }
};

// Add a listing to favorites
export const addFavorite = async (id) => {
  try {
    const response = await api.post(`/api/listings/${id}/favorite`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add to favorites' };
  }
};

// Remove a listing from favorites
export const removeFavorite = async (id) => {
  try {
    const response = await api.delete(`/api/listings/${id}/favorite`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove from favorites' };
  }
};

// Search listings with filters
export const searchListings = async (filters) => {
  try {
    const response = await api.get('/api/listings/search', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search listings' };
  }
};

// Get listings for a specific user
export const getUserListings = async (userId) => {
  try {
    const response = await api.get('/api/listings', { 
      params: { user: userId } 
    });
    return response.data.listings || [];
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user listings' };
  }
};

// Find potential matches for a listing
export const findMatches = async (listingId) => {
  try {
    const response = await api.get(`/api/listings/${listingId}/matches`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to find matches' };
  }
};

// Mark listings as matched
export const markAsMatched = async (listingId, matchedListingId) => {
  try {
    const response = await api.post('/api/listings/match', {
      listingId,
      matchedListingId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to match listings' };
  }
}; 