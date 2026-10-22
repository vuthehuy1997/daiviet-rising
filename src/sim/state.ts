import type { GameData, GameState, TileRT } from './types';

export function newGame(d: GameData, seed: number = d.campaign.seed): GameState {
  const tiles: Record<string, TileRT> = {};
  for (const t of d.tiles) {
    tiles[t.id] = {
      id: t.id, terrain: t.terrain, status: t.state, adj: [...t.adj],
      buildings: (d.campaign.start_buildings[t.id] ?? []).map((type) => ({ type, level: 1, remaining: 0 })),
      garrison: {}, defenders: { ...(t.defenders ?? {}) },
    };
  }
  return {
    save_version: 1, campaign: d.campaign.id, turn: 1, rng: seed >>> 0,
    res: { ...d.campaign.start }, tiles, armies: [], queue: [], raids: [], policies: [],
    repelled: 0, negDantamTurns: 0, nextId: 1, weaken: {}, log: [], reports: [], outcome: 'playing',
  };
}

export function slotsOf(d: GameData, s: GameState, tile: string): number {
  return tile === d.campaign.capital ? d.campaign.rules.capital_slots : d.campaign.rules.default_slots;
}

/** Hash trạng thái ổn định (khóa sắp xếp) cho TST-02. */
export function stateJson(s: GameState): string {
  return JSON.stringify(s, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1))) : v));
}
