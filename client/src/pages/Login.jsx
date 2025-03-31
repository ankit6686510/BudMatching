import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  CircularProgress,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

import { loginStart, login, loginFailure } from '../store/slices/authSlice';
import { login as loginService, googleLogin } from '../services/authService';

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const [loginError, setLoginError] = useState(location.state?.authError || null);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  // Check URL for error parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    
    if (errorParam) {
      if (errorParam === 'google_auth_failed') {
        setLoginError('Google authentication failed. Please try again.');
      } else if (errorParam === 'auth_failed') {
        setLoginError('Authentication failed. Please try again.');
      } else if (errorParam === 'server_error') {
        setLoginError('Server error occurred. Please try again later.');
      }
    }
  }, [location]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError(null);
    setIsGoogleAccount(false);
    
    try {
      dispatch(loginStart());
      const data = await loginService(values);
      dispatch(login(data));
      setSnackbarMessage('Login successful!');
      setShowSnackbar(true);
      
      // Short delay before navigation for better UX
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      // Check if this is a Google account
      if (err.isGoogleAccount) {
        setIsGoogleAccount(true);
        setLoginError(err.message);
      } else {
        setLoginError(err.message || 'Login failed');
      }
      dispatch(loginFailure(err.message || 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleGoogleLogin = () => {
    setLoginError(null);
    setIsGoogleAccount(false);
    dispatch(loginStart());
    
    try {
      // This will redirect to Google OAuth
      googleLogin();
      // No need to dispatch success here as the page will redirect
    } catch (err) {
      setLoginError(err.message || 'Google login failed');
      dispatch(loginFailure(err.message || 'Google login failed'));
    }
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Log In
        </Typography>
        
        {loginError && (
          <Alert 
            severity={isGoogleAccount ? "info" : "error"} 
            sx={{ width: '100%', mb: 2 }}
            action={
              isGoogleAccount && (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleGoogleLogin}
                >
                  Google Login
                </Button>
              )
            }
          >
            {loginError}
          </Alert>
        )}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form style={{ width: '100%' }}>
              <Field
                as={TextField}
                variant="outlined"
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              
              <Field
                as={TextField}
                variant="outlined"
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || isSubmitting}
                sx={{ mt: 2, mb: 2 }}
              >
                {loading && !isGoogleAccount ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </Form>
          )}
        </Formik>

        <Divider sx={{ my: 3, width: '100%' }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<GoogleIcon />}
          sx={{ mb: 3 }}
          onClick={handleGoogleLogin}
          disabled={loading && !isGoogleAccount}
        >
          Continue with Google
        </Button>

        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" variant="body2">
                Sign up
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Login; 