import type { GameData, GameState, Terrain } from './types';

/** Chi phí đi vào một ô = chi phí địa hình ô đích (SYS-01). */
export function enterCost(d: GameData, terrain: Terrain): number { return d.campaign.rules.terrain_cost[terrain]; }

/**
 * Dijkstra theo chi phí. `allow(tileId)` quyết định ô trung gian được đi qua (đích luôn được phép).
 * Bằng nhau thì ưu tiên ID nhỏ để xác định (EDGE-07).
 */
export function shortestPath(
  d: GameData, s: GameState, from: string, to: string, allow: (id: string) => boolean = () => true,
): { path: string[]; cost: number } | null {
  if (from === to) return { path: [from], cost: 0 };
  const dist = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, string>();
  const done = new Set<string>();
  while (true) {
    let cur: string | null = null;
    for (const [id, dv] of [...dist.entries()].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1))) {
      if (!done.has(id)) { cur = id; break; }
    }
    if (cur === null) return null;
    if (cur === to) break;
    done.add(cur);
    for (const n of s.tiles[cur].adj) {
      if (done.has(n)) continue;
      if (n !== to && !allow(n)) continue;
      const nd = dist.get(cur)! + enterCost(d, s.tiles[n].terrain);
      if (!dist.has(n) || nd < dist.get(n)! || (nd === dist.get(n)! && cur < prev.get(n)!)) { dist.set(n, nd); prev.set(n, cur); }
    }
  }
  const path = [to];
  while (path[0] !== from) path.unshift(prev.get(path[0])!);
  return { path, cost: dist.get(to)! };
}
