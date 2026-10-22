import { applyCommand } from '../sim/commands';
import { deserialize, serialize } from '../sim/save';
import { newGame } from '../sim/state';
import { endTurn } from '../sim/turn';
import type { BattleReport, Cmd, GameData, GameState } from '../sim/types';

const KEY = 'daiviet-rising.autosave';

/** Lớp điều khiển phi-DOM: lệnh, hoàn tác trong lượt (UXD-06), lưu/nạp (UXD-SAVE). localStorage có thể bị chặn → luôn try/catch. */
export class Controller {
  state: GameState;
  private history: GameState[] = [];
  storageOk = true;

  constructor(readonly d: GameData, private storage: Storage | null = safeStorage()) {
    this.state = newGame(d);
    if (!this.storage) this.storageOk = false;
  }

  get canUndo() { return this.history.length > 0; }

  dispatch(cmd: Cmd): string | undefined {
    const r = applyCommand(this.d, this.state, cmd);
    if (r.error) return r.error;
    this.history.push(this.state);
    this.state = r.state;
    return undefined;
  }

  undo(): boolean {
    const prev = this.history.pop();
    if (!prev) return false;
    this.state = prev;
    return true;
  }

  /** Kết thúc lượt; trả về các báo cáo trận mới phát sinh. */
  endTurn(): BattleReport[] {
    const before = this.state.reports.length;
    this.state = endTurn(this.d, this.state);
    this.history = [];
    this.autosave();
    return this.state.reports.slice(before);
  }

  newGame(seed?: number) { this.state = newGame(this.d, seed); this.history = []; this.autosave(); }

  exportJson(): string { return serialize(this.state); }

  importJson(text: string): string | undefined {
    try { this.state = deserialize(text); this.history = []; this.autosave(); return undefined; }
    catch (e) { return (e as Error).message; }
  }

  autosave() {
    if (!this.storage) return;
    try { this.storage.setItem(KEY, serialize(this.state)); } catch { this.storageOk = false; }
  }

  loadAutosave(): boolean {
    if (!this.storage) return false;
    try {
      const t = this.storage.getItem(KEY);
      if (!t) return false;
      this.state = deserialize(t); this.history = [];
      return true;
    } catch { return false; }
  }
}

function safeStorage(): Storage | null {
  try { const s = globalThis.localStorage; s.getItem('x'); return s; } catch { return null; }
}
