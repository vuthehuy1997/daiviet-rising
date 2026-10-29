import type { GameState } from './types';

export const SAVE_VERSION = 3;

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
  const st = o.state;
  if (o.save_version < 2 && st && typeof st === 'object') { // v1 (RC1) chưa có sự kiện: thêm trường rỗng
    st.mods ??= []; st.pendingEvents ??= []; st.eventLog ??= []; st.raidEdits ??= {}; st.scheduled ??= [];
  }
  if (o.save_version < 3 && st && typeof st === 'object') { st.lure ??= null; } // v2 (RC2–RC4) chưa có mồi nhử
  if (st && typeof st === 'object') st.save_version = SAVE_VERSION;
  return st;
}
