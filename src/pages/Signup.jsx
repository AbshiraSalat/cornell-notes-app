import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useStore } from '../store/useStore';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const setUser = useStore(state => state.setUser);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔵 Form submitted');
    console.log('Form data:', { ...formData, password: '***', confirmPassword: '***' });
    
    if (!validateForm()) {
      console.log('❌ Form validation failed', errors);
      return;
    }

    console.log('✅ Form validation passed');
    setIsLoading(true);
    
    try {
      console.log('🔵 Attempting to create user with Firebase...');
      console.log('Auth object:', auth);
      console.log('Email:', formData.email);
      console.log('Name:', formData.name);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      console.log('✅ User created successfully!', userCredential.user);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });
      
      console.log('✅ Display name set to:', formData.name);
      
      // Clear any old localStorage data
      localStorage.removeItem('cornell-notes-storage');
      
      // Set user with updated profile
      setUser({
        ...userCredential.user,
        displayName: formData.name
      });
      
      toast.success(`Welcome ${formData.name.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('This email is already registered. Please login instead.');
          setErrors({ email: 'Email already in use' });
          break;
        case 'auth/weak-password':
          toast.error('Password is too weak. Use at least 6 characters.');
          setErrors({ password: 'Password too weak' });
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email format.');
          setErrors({ email: 'Invalid email' });
          break;
        case 'auth/operation-not-allowed':
          toast.error('Email/password sign-up is not enabled. Please check Firebase settings.');
          break;
        case 'auth/network-request-failed':
          toast.error('Network error. Please check your internet connection.');
          break;
        default:
          toast.error(`Failed to create account: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      console.log('🔵 Loading state set to false');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white font-bold text-2xl mb-4 shadow-xl">
            CN
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start taking better notes today
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <p className="text-xs text-purple-700 dark:text-purple-300 text-center">
            🔒 Your account is secured with Firebase Authentication
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;