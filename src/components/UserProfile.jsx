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
      className="bg-dark-light rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaUser className="text-primary text-2xl" />
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-green-500/10 border border-green-500/50 rounded-lg p-3 flex items-center gap-2 text-green-400"
        >
          <FaCheckCircle />
          <span>Profile updated successfully!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
          
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                >
                  <FaSave />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
              >
                <FaEdit />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Account Statistics */}
        <div className="bg-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Statistics</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">Account Status</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
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
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>Your subscription includes:</strong>
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
