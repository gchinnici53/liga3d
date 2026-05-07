module.exports = {
  apps: [
    {
      name: "liga3d",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/liga3d",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
