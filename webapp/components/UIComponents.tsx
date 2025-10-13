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

import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/20 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h4 className="text-xl font-semibold text-white mb-3">{title}</h4>
      <p className="text-white/70">{description}</p>
    </div>
  );
};

interface PricingCardProps {
  tier: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ tier, price, features, popular = false }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl p-8 border ${popular ? 'border-yellow-400' : 'border-white/10'} relative`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
            Most Popular
          </span>
        </div>
      )}
      <h4 className="text-2xl font-bold text-white mb-2">{tier}</h4>
      <div className="text-4xl font-bold text-white mb-6">
        {price}<span className="text-lg text-white/60">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-white/80">
            <span className="text-green-400 mr-3">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
        popular 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600' 
          : 'bg-white/20 text-white hover:bg-white/30'
      }`}>
        Get Started
      </button>
    </div>
  );
};

interface GitHubButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const GitHubButton: React.FC<GitHubButtonProps> = ({ href, children, variant = 'primary' }) => {
  const baseClasses = "font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2";
  const variantClasses = variant === 'primary' 
    ? "bg-gray-800 hover:bg-gray-700 text-white" 
    : "bg-blue-600 hover:bg-blue-700 text-white";
  
  return (
    <a 
      href={href} 
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </a>
  );
};
