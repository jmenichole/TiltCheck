module.exports = {
  apps: [{
    name: 'traphouse-bot',
    script: 'index.js',
    watch: true,
    watch_delay: 2000,
    ignore_watch: [
      'node_modules',
      '.git',
      'logs',
      '*.log',
      'test-*.js',
      'diagnose-*.js',
      'tilt-troubleshooting.js'
    ],
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development',
      DEBUG: 'true'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    kill_timeout: 5000,
    restart_delay: 4000
  }]
};
