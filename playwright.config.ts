import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  reporter: [['list'], ['json', { outputFile: 'docs/qa/e2e-last.json' }]],
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: { command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 120000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-touch', use: { ...devices['Pixel 7'] } },
  ],
});
