import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaUsers, 
  FaBell, 
  FaCog, 
  FaChartBar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEnvelope,
  FaArrowRight,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaRocket,
  FaBrain,
  FaEye,
  FaClock,
  FaDollarSign
} from 'react-icons/fa';

const LandingPage = ({ onStartDemo = () => {} }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail('');
    }, 1000);
  };

  const features = [
    {
      icon: FaBrain,
      title: "AI-Powered Tilt Detection",
      description: "Advanced machine learning algorithms analyze betting patterns, reaction times, and behavioral indicators to detect tilt in real-time.",
      status: "In Development"
    },
    {
      icon: FaEye,
      title: "Real-Time Monitoring",
      description: "Continuous monitoring of player behavior across multiple gaming sessions with instant alerts and intervention recommendations.",
      status: "Coming Soon"
    },
    {
      icon: FaChartBar,
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive analytics platform with customizable reports, trend analysis, and performance metrics for operators.",
      status: "Planned"
    },
    {
      icon: FaUsers,
      title: "Multi-Player Management",
      description: "Scalable platform supporting thousands of simultaneous players with individualized risk profiles and monitoring.",
      status: "Planned"
    },
    {
      icon: FaBell,
      title: "Smart Alert System",
      description: "Configurable alert thresholds with multiple notification channels including email, SMS, and API webhooks.",
      status: "In Development"
    },
    {
      icon: FaShieldAlt,
      title: "Responsible Gaming Tools",
      description: "Integrated tools for deposit limits, session timeouts, and self-exclusion features to promote healthy gaming habits.",
      status: "Coming Soon"
    }
  ];

  const stats = [
    { value: "99.7%", label: "Accuracy Rate" },
    { value: "<500ms", label: "Response Time" },
    { value: "24/7", label: "Monitoring" },
    { value: "API", label: "Integration" }
  ];

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`
    }}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-full"
              >
                <FaShieldAlt className="text-white text-4xl" />
              </motion.div>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                TiltCheck
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto"
            >
              The Future of Responsible Gaming Monitoring
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Advanced AI-powered player behavior monitoring system designed to promote responsible gaming through real-time tilt detection and intelligent intervention.
            </motion.p>

            {/* Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-lg font-semibold mb-12"
            >
              <FaRocket />
              <span>Coming Soon - Early 2025</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex justify-center"
            >
              <button
                onClick={onStartDemo}
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-xl"
              >
                <FaDesktop className="text-lg" />
                <span>Launch Interactive Demo</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Planned Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Revolutionary technology stack designed to transform responsible gaming monitoring
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <feature.icon className="text-3xl text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    feature.status === 'In Development' ? 'bg-orange-500/20 text-orange-400' :
                    feature.status === 'Coming Soon' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {feature.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the Waitlist
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Be the first to know when TiltCheck launches. Get exclusive early access and updates.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <>
                        Join <FaArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 max-w-md mx-auto"
              >
                <FaCheckCircle className="text-green-400 text-3xl mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
                <p className="text-gray-300">We'll notify you as soon as TiltCheck is ready.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaShieldAlt className="text-blue-400 text-xl" />
                <h3 className="text-lg font-bold text-white">TiltCheck</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Advanced player behavior monitoring system designed to promote responsible gaming through real-time tilt detection and intervention.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaGithub className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaTwitter className="text-xl" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Planned Features</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• AI-powered tilt detection</li>
                <li>• Real-time monitoring</li>
                <li>• Advanced analytics</li>
                <li>• Multi-player support</li>
                <li>• Smart alerts</li>
                <li>• Responsible gaming tools</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact & Updates</h4>
              <div className="text-gray-400 text-sm space-y-2">
                <p className="flex items-center gap-2">
                  <FaEnvelope />
                  j.chapman7@yahoo.com
                </p>
                <p>Expected Launch: Early 2025</p>
                <p>Status: In Development</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 TiltCheck. Building the future of responsible gaming monitoring.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;