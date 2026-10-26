import { defineConfig } from 'vite';
import { parse } from 'yaml';

// Dữ liệu game vẫn là YAML (nguồn sự thật, python tools/check_design.py đọc trực tiếp). Lúc build/test chuyển sang JSON
// để thư viện `yaml` không nằm trong gói tải về của trình duyệt (CR-003 V3: ngân sách dung lượng).
const yamlToJson = () => ({
  name: 'yaml-to-json',
  transform(code: string, id: string) {
    if (!id.endsWith('.yaml')) return null;
    return { code: `export default ${JSON.stringify(parse(code))};`, map: null };
  },
});

// base './' để chạy được trên GitHub Pages ở mọi đường dẫn con.
export default defineConfig({
  base: './',
  plugins: [yamlToJson()],
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
} as any);
