import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4173); // đổi cổng khi 4173 đang bị tiến trình khác chiếm

export default defineConfig({
  testDir: 'e2e',
  reporter: [['list'], ['json', { outputFile: 'docs/qa/e2e-last.json' }]],
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: { command: `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`, url: `http://127.0.0.1:${PORT}`, reuseExistingServer: false, timeout: 120000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-touch', use: { ...devices['Pixel 7'] } },
  ],
});
