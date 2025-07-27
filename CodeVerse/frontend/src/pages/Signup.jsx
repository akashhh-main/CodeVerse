import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { registerUser } from '../authSlice';
import { useEffect, useState } from 'react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum 3 characters"),
  emailId: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Requires uppercase letter")
    .regex(/[a-z]/, "Requires lowercase letter")
    .regex(/[0-9]/, "Requires number")
    .regex(/[^A-Za-z0-9]/, "Requires special character"),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated,loading } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data) => dispatch(registerUser(data));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 space-y-4">
          {/* LeetCode Heading - Added back with styling */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              <span className="text-orange-500">Leet</span>Code
            </h1>
            <p className="text-gray-600 mt-1">Create your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register('firstName')}
                className={`w-full px-3 py-2 border rounded-md text-gray-800 ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('emailId')}
                className={`w-full px-3 py-2 border rounded-md text-gray-800 ${errors.emailId ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="your@email.com"
              />
              {errors.emailId && (
                <p className="text-red-500 text-xs mt-1">{errors.emailId.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-3 py-2 border rounded-md text-gray-800 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.523 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
              disabled={loading}
            >
              Sign Up
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-orange-500 hover:underline font-medium"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;