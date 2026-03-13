const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  // Allow CRA-style env vars too (Azure App Service docs often use REACT_APP_*).
  envPrefix: ['VITE_', 'REACT_APP_'],
  build: {
    // Azure + `serve -s build` expects the production output in build/
    outDir: 'build',
    emptyOutDir: true,
  },
})
