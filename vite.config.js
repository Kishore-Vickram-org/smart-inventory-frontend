const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  appType: 'spa',
  plugins: [react()],
  // Allow CRA-style env vars too (Azure App Service docs often use REACT_APP_*).
  envPrefix: ['VITE_', 'REACT_APP_'],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
