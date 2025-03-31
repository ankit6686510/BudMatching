import { useState } from 'react';
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
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

import { loginStart, login, loginFailure } from '../store/slices/authSlice';
import { register, googleLogin } from '../services/authService';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  location: Yup.string().required('Location is required'),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const [registerError, setRegisterError] = useState(null);
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (values, { setSubmitting }) => {
    setRegisterError(null);
    try {
      dispatch(loginStart());
      const { confirmPassword, ...userData } = values;
      const data = await register(userData);
      dispatch(login(data));
      navigate(from, { replace: true });
    } catch (err) {
      setRegisterError(err.message || 'Registration failed');
      dispatch(loginFailure(err.message || 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setRegisterError(null);
    try {
      dispatch(loginStart());
      const data = await googleLogin();
      dispatch(login(data));
      navigate(from, { replace: true });
    } catch (err) {
      setRegisterError(err.message || 'Google login failed');
      dispatch(loginFailure(err.message || 'Google login failed'));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 6,
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
          Create an Account
        </Typography>
        
        {registerError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {registerError}
          </Alert>
        )}

        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '', 
            location: '' 
          }}
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
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              
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
                autoComplete="new-password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              
              <Field
                as={TextField}
                variant="outlined"
                margin="normal"
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
              
              <Field
                as={TextField}
                variant="outlined"
                margin="normal"
                fullWidth
                id="location"
                label="Location"
                name="location"
                autoComplete="address-level2"
                error={touched.location && Boolean(errors.location)}
                helperText={touched.location && errors.location}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || isSubmitting}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
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
          disabled={loading}
        >
          Continue with Google
        </Button>

        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Log in
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Register; 