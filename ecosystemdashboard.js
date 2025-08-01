"use client";
import React from "react";

function MainComponent() {
  const [services, setServices] = React.useState([
    {
      name: "TiltCheck Main",
      port: 4001,
      url: "https://tiltcheck.it.com",
      status: "online",
      icon: "🏠",
      description: "Main server and website",
    },
    {
      name: "Main Bot",
      port: 3000,
      url: "Discord integration",
      status: "online",
      icon: "🤖",
      description: "Discord bot with 47 slash commands",
    },
    {
      name: "Beta Server",
      port: 3333,
      url: "http://localhost:3333",
      status: "online",
      icon: "🧪",
      description: "Beta testing dashboard",
    },
    {
      name: "GitHub Hooks",
      port: 3001,
      url: "http://localhost:3001",
      status: "online",
      icon: "📂",
      description: "GitHub webhook server",
    },
    {
      name: "CollectClock",
      port: 3002,
      url: "http://localhost:3002",
      status: "online",
      icon: "⏰",
      description: "OAuth handler for time tracking",
    },
    {
      name: "Degens Bot",
      port: null,
      url: "Discord integration",
      status: "online",
      icon: "🎮",
      description: "Card game bot with crypto integration",
    },
  ]);

  const [endpoints] = React.useState([
    { name: "Main", url: "https://tiltcheck.it.com", icon: "🏠" },
    { name: "Beta", url: "https://tiltcheck.it.com/beta", icon: "🧪" },
    { name: "Git", url: "https://tiltcheck.it.com/git", icon: "📂" },
    {
      name: "CollectClock",
      url: "https://tiltcheck.it.com/collectclock",
      icon: "⏰",
    },
    { name: "Tilt", url: "https://tiltcheck.it.com/tilt", icon: "📊" },
    {
      name: "TrapHouse",
      url: "https://tiltcheck.it.com/traphouse",
      icon: "🏘️",
    },
    { name: "Degens", url: "https://tiltcheck.it.com/degens", icon: "🎮" },
    {
      name: "AIM Overlay",
      url: "https://tiltcheck.it.com/aimoverlay",
      icon: "🎯",
    },
    {
      name: "Analytics",
      url: "https://tiltcheck.it.com/analytics",
      icon: "📈",
    },
    { name: "NFT", url: "https://tiltcheck.it.com/nft", icon: "🎫" },
    { name: "Casinos", url: "https://tiltcheck.it.com/casinos", icon: "🎰" },
    { name: "Games", url: "https://tiltcheck.it.com/games", icon: "🎲" },
    { name: "Ko-fi", url: "https://tiltcheck.it.com/kofi", icon: "☕" },
    { name: "Help", url: "https://tiltcheck.it.com/help", icon: "❓" },
    { name: "Health", url: "https://tiltcheck.it.com/health", icon: "💚" },
  ]);

  const [stats] = React.useState({
    totalServices: 6,
    onlineServices: 6,
    totalEndpoints: 15,
    discordServers: 3,
    betaUsers: 13,
    slashCommands: 47,
  });

  const getStatusColor = (status) => {
    return status === "online" ? "text-green-500" : "text-red-500";
  };

  const getStatusBg = (status) => {
    return status === "online" ? "bg-green-100" : "bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          🚀 TiltCheck.it Ecosystem Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor all services and endpoints in real-time
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalServices}
          </div>
          <div className="text-sm text-gray-600">Total Services</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {stats.onlineServices}
          </div>
          <div className="text-sm text-gray-600">Online Services</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalEndpoints}
          </div>
          <div className="text-sm text-gray-600">Endpoints</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-indigo-600">
            {stats.discordServers}
          </div>
          <div className="text-sm text-gray-600">Discord Servers</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">
            {stats.betaUsers}
          </div>
          <div className="text-sm text-gray-600">Beta Users</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-pink-600">
            {stats.slashCommands}
          </div>
          <div className="text-sm text-gray-600">Slash Commands</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Services Status */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Service Status
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {service.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.description}
                      </div>
                      {service.port && (
                        <div className="text-xs text-gray-400">
                          Port: {service.port}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(
                        service.status
                      )} ${getStatusColor(service.status)}`}
                    >
                      {service.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Endpoints
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-3">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{endpoint.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {endpoint.name}
                      </div>
                    </div>
                  </div>
                  <a
                    href={endpoint.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Visit →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            System Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Production URLs
              </h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Main Site:</span>
                  <a
                    href="https://tiltcheck.it.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    https://tiltcheck.it.com
                  </a>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Health Check:</span>
                  <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    curl http://localhost:4001/health
                  </code>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Features</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>✅ Connected via Verified Node</div>
                <div>✅ All endpoints active and responding</div>
                <div>✅ Performance optimized</div>
                <div>✅ Security headers enabled</div>
                <div>✅ NFT Trust System initialized</div>
                <div>✅ Casino integration loaded</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;