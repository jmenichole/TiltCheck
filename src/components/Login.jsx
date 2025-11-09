/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaEnvelope, 
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight
} from 'react-icons/fa';

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // For demo purposes, accept any credentials
      // In production, this would validate against a backend
      const userData = {
        email: email,
        name: email.split('@')[0],
        role: 'admin',
        company: 'TiltCheck Demo'
      };
      
      onLogin(userData);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{
      background: `linear-gradient(135deg, #0a0e1a 0%, #12171f 25%, #1a1f2e 50%, #12171f 75%, #0a0e1a 100%)`
    }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-6xl animate-pulse" style={{ animationDuration: '4s' }}>♠</div>
        <div className="absolute top-40 right-20 text-5xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}>♣</div>
        <div className="absolute bottom-32 left-32 text-5xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}>♥</div>
        <div className="absolute bottom-20 right-40 text-6xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1.5s' }}>♦</div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center relative mb-4"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700 p-5 rounded-full shadow-2xl border-2 border-emerald-400/30">
              <FaShieldAlt className="text-white text-4xl drop-shadow-lg" />
            </div>
          </motion.div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            TiltCheck
          </h1>
          <p className="text-gray-300 text-lg font-medium">Professional Gaming Monitor</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border-2 border-emerald-500/20 relative overflow-hidden"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(16, 185, 129, 0.1) 10px, rgba(16, 185, 129, 0.1) 20px)`
          }}></div>
          <h2 className="text-2xl font-bold text-white mb-6 relative">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Sign In</span>
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-950/80 border-2 border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-950/80 border-2 border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-emerald-400 hover:via-blue-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50 hover:scale-[1.02] border border-emerald-400/30"
              style={{
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.1)'
              }}
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  Sign In <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Demo Note */}
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500/30 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 animate-pulse"></div>
            <p className="text-emerald-300 text-xs text-center relative z-10">
              <strong className="text-emerald-400">Demo Mode:</strong> Use any email and password to sign in
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2024 TiltCheck. All Rights Reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
