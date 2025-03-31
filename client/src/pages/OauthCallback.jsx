import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { login, loginFailure } from '../store/slices/authSlice';
import { checkAuth } from '../services/authService';

const OauthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token from URL query parameter
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const error = queryParams.get('error');
        
        // Handle error from OAuth flow
        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }
        
        if (!token) {
          throw new Error('No authentication token received');
        }
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Get user info using the token
        const userData = await checkAuth();
        
        if (!userData || !userData.user) {
          throw new Error('Failed to get user data');
        }
        
        // Dispatch login action with user data and token
        dispatch(login({ 
          user: userData.user, 
          token 
        }));
        
        // Redirect to home page after a short delay for user feedback
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        setLoading(false);
        dispatch(loginFailure(err.message || 'Authentication failed'));
      }
    };
    
    handleOAuthCallback();
  }, [dispatch, location, navigate]);
  
  const handleReturnToLogin = () => {
    navigate('/login', { replace: true });
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        p: 3
      }}
    >
      {error ? (
        <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {error}
          </Alert>
          <Typography variant="body1" sx={{ mb: 3 }}>
            There was a problem signing in with Google. Please try again.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleReturnToLogin}
          >
            Return to Login
          </Button>
        </Box>
      ) : (
        <>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Completing authentication...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OauthCallback; 