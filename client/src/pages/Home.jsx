import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import ListingCard from '../components/listings/ListingCard';
import ListingFilter from '../components/listings/ListingFilter';

import { 
  fetchListingsStart, 
  fetchListingsSuccess, 
  fetchListingsFailure 
} from '../store/slices/listingSlice';
import { getListings } from '../services/listingService';

const Home = () => {
  const dispatch = useDispatch();
  const { filteredListings, loading, error } = useSelector((state) => state.listings);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadListings = async () => {
      try {
        dispatch(fetchListingsStart());
        const listings = await getListings({ status: 'available' });
        dispatch(fetchListingsSuccess(listings));
      } catch (err) {
        dispatch(fetchListingsFailure(err.message));
      }
    };

    loadListings();
  }, [dispatch]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h2" component="h1" gutterBottom>
              Find Your Missing Earbud Match
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              BudMatching helps you connect with people who have the opposite earbud 
              of what you've lost. List your single earbud and find its perfect match!
            </Typography>
            <Box sx={{ mt: 3 }}>
              {isAuthenticated ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  component={RouterLink}
                  to="/create-listing"
                >
                  Create a Listing
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  component={RouterLink}
                  to="/register"
                >
                  Sign Up Now
                </Button>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src="/DALL·E 2025-03-20 22.01.12 - A pair of Apple earbuds (AirPods) with a white background. The earbuds should be sleek, wireless, and modern with a smooth, glossy finish. The image s.webp"
              alt="Apple AirPods Pro 2"
              sx={{
                width: '100%',
                maxWidth: 500,
                height: 'auto',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Available Earbuds
        </Typography>
        <ListingFilter />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ my: 4 }}>
            Error loading listings: {error}
          </Typography>
        ) : filteredListings.length === 0 ? (
          <Typography align="center" sx={{ my: 4 }}>
            No listings found. Try adjusting your filters or check back later.
          </Typography>
        ) : (
          <div className="listings-container">
            {filteredListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </Box>

      <Box sx={{ my: 6, py: 4, bgcolor: 'background.default', borderRadius: 2 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom align="center">
            How BudMatching Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  1. List Your Earbud
                </Typography>
                <Typography>
                  Create a listing with details about your single earbud - brand, model, side, condition, and price.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  2. Find a Match
                </Typography>
                <Typography>
                  Our algorithm will find potential matches with the opposite earbud that matches your specific model.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  3. Connect & Trade
                </Typography>
                <Typography>
                  Message the match, agree on terms, and complete the transaction to get your earbuds working again!
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Container>
  );
};

export default Home; 