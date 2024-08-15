module.exports = {
  apps: [
    {
      name: "live_connect_server",
      script: "build/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
