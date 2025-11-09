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
  FaUser, 
  FaEnvelope, 
  FaBuilding,
  FaShieldAlt,
  FaSave,
  FaEdit,
  FaSignOutAlt,
  FaCheckCircle
} from 'react-icons/fa';

const UserProfile = ({ user, onUpdateProfile, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    company: user.company || ''
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      company: user.company || ''
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-xl p-6 border-2 border-emerald-500/20 shadow-2xl relative overflow-hidden"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.1)'
      }}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(16, 185, 129, 0.1) 10px, rgba(16, 185, 129, 0.1) 20px)`
      }}></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2 rounded-lg">
            <FaUser className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            User Profile
          </h2>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all text-sm font-semibold shadow-lg hover:shadow-red-500/50 border border-red-500/30"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 rounded-lg p-3 flex items-center gap-2 text-emerald-300 relative z-10 shadow-lg"
        >
          <FaCheckCircle />
          <span className="font-semibold">Profile updated successfully!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Profile Information */}
        <div className="bg-gray-950/60 rounded-lg p-6 border border-emerald-500/10 shadow-lg">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Profile Information</h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-950/80 border-2 border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              ) : (
                <div className="flex items-center gap-2 text-white">
                  <FaUser className="text-gray-400" />
                  <span>{user.name}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-950/80 border-2 border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              ) : (
                <div className="flex items-center gap-2 text-white">
                  <FaEnvelope className="text-gray-400" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-950/80 border-2 border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="Your Company"
                />
              ) : (
                <div className="flex items-center gap-2 text-white">
                  <FaBuilding className="text-gray-400" />
                  <span>{user.company || 'Not specified'}</span>
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <div className="flex items-center gap-2 text-white">
                <FaShieldAlt className="text-gray-400" />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg transition-all font-semibold shadow-lg hover:shadow-emerald-500/50 border border-emerald-500/30"
                >
                  <FaSave />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold border border-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all font-semibold shadow-lg hover:shadow-blue-500/50 border border-blue-500/30"
              >
                <FaEdit />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Account Statistics */}
        <div className="bg-gray-950/60 rounded-lg p-6 border border-emerald-500/10 shadow-lg">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Account Statistics</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">Account Status</span>
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-300 rounded-full text-sm font-bold border border-emerald-500/40">
                Active
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">Subscription Plan</span>
              <span className="text-white font-semibold">Professional</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">Players Monitored</span>
              <span className="text-white font-semibold">5</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">Total Alerts</span>
              <span className="text-white font-semibold">127</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Member Since</span>
              <span className="text-white font-semibold">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="mt-6 p-4 bg-gradient-to-br from-emerald-500/10 to-blue-600/10 border-2 border-emerald-500/30 rounded-lg shadow-lg">
            <p className="text-emerald-300 text-sm">
              <strong className="text-emerald-400">Your subscription includes:</strong>
            </p>
            <ul className="mt-2 text-xs text-gray-300 space-y-1">
              <li>• Real-time monitoring for up to 10 players</li>
              <li>• Advanced analytics and insights</li>
              <li>• 24/7 technical support</li>
              <li>• Custom alert configurations</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
