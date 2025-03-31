import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Fab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';

import { 
  fetchListingsStart, 
  fetchListingsSuccess, 
  fetchListingsFailure,
  applyFilters,
  clearFilters
} from '../store/slices/listingSlice';
import { fetchListings } from '../services/listingService';
import ListingCard from '../components/listings/ListingCard';
import ListingFilter from '../components/listings/ListingFilter';

const Listings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { listings, filteredListings, filters, loading, error } = useSelector((state) => state.listings);
  const { user } = useSelector((state) => state.auth);
  
  const [showFilters, setShowFilters] = useState(!isMobile);
  
  useEffect(() => {
    const loadListings = async () => {
      try {
        dispatch(fetchListingsStart());
        const data = await fetchListings();
        dispatch(fetchListingsSuccess(data.listings));
      } catch (err) {
        dispatch(fetchListingsFailure(err.message || 'Failed to load listings'));
      }
    };
    
    loadListings();
  }, [dispatch]);
  
  // Update showFilters when screen size changes
  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);
  
  const handleCreateListing = () => {
    if (!user) {
      navigate('/login', { state: { from: '/listings/create' } });
    } else {
      navigate('/listings/create');
    }
  };
  
  // Determine which listings to display based on filter status
  const displayedListings = filteredListings.length > 0 || 
    Object.values(filters).some(value => value !== '') 
    ? filteredListings 
    : listings;
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Available Earbuds
        </Typography>
        
        {isMobile ? (
          <Button 
            variant="outlined" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreateListing}
          >
            Create Listing
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Filters */}
        {showFilters && (
          <Grid item xs={12} md={3}>
            <ListingFilter />
          </Grid>
        )}
        
        {/* Listings */}
        <Grid item xs={12} md={showFilters ? 9 : 12}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : displayedListings.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 5 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No listings found
              </Typography>
              {Object.values(filters).some(value => value !== '') && (
                <Button 
                  variant="outlined" 
                  onClick={() => dispatch(clearFilters())}
                  sx={{ mt: 2 }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {displayedListings.map((listing) => (
                <Grid item key={listing._id} xs={12} sm={6} md={4}>
                  <ListingCard listing={listing} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
      
      {/* Mobile-only floating action button for creating listing */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateListing}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default Listings; 