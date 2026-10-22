import type { GameState } from './types';

export const SAVE_VERSION = 1;

export function serialize(s: GameState): string { return JSON.stringify({ save_version: SAVE_VERSION, state: s }); }

/** Nạp + migrate. Ném lỗi nếu phiên bản không hỗ trợ hoặc dữ liệu hỏng (UXD-SAVE). */
export function deserialize(text: string): GameState {
  let o: any;
  try { o = JSON.parse(text); } catch { throw new Error('Tệp lưu không phải JSON hợp lệ'); }
  if (!o || typeof o !== 'object' || typeof o.save_version !== 'number') throw new Error('Thiếu save_version');
  if (o.save_version > SAVE_VERSION) throw new Error(`Bản lưu mới hơn (v${o.save_version}) – không hỗ trợ`);
  const s = migrate(o);
  if (!s || !s.tiles || typeof s.turn !== 'number') throw new Error('Bản lưu thiếu dữ liệu');
  return s as GameState;
}

function migrate(o: any): GameState {
  // v1 là phiên bản đầu; điểm mở rộng cho migration sau này.
  return o.state;
}
