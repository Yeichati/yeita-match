import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Each production build gets an identifier (the commit on GitHub Actions, a timestamp otherwise).
// It is written in index.html (<meta name="app-version">) and in version.json, so that a page served
// from the browser cache can detect that a newer version is online (see the check in index.html).
function appVersion(version) {
  return {
    name: 'app-version',
    transformIndexHtml: (html) => html.replace('__APP_VERSION__', version),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version }) + '\n',
      })
    },
  }
}

export default defineConfig(({ command }) => {
  const version =
    command === 'build' ? (process.env.GITHUB_SHA?.slice(0, 12) ?? Date.now().toString(36)) : 'dev'
  // Relative asset URLs support both a project page and a custom domain.
  return { plugins: [react(), appVersion(version)], base: './' }
})
