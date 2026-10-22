import { defineConfig } from 'vite';

// base './' để chạy được trên GitHub Pages ở mọi đường dẫn con (chưa deploy; cần G3).
export default defineConfig({
  base: './',
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
} as any);
