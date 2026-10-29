import { resolveEvent } from './events';
import { hasActive, anyActive, activeBuildings, garrisonCap } from './derived';
import { shortestPath } from './graph';
import { slotsOf } from './state';
import type { Cmd, CmdResult, Counts, GameData, GameState, Res, ResKey } from './types';

const clone = <T>(x: T): T => structuredClone(x);

function canAfford(s: GameState, cost: Partial<Res>, mult = 1): boolean {
  return (Object.keys(cost) as ResKey[]).every((k) => s.res[k] >= (cost[k] ?? 0) * mult);
}
function pay(s: GameState, cost: Partial<Res>, mult = 1) {
  for (const k of Object.keys(cost) as ResKey[]) s.res[k] -= (cost[k] ?? 0) * mult;
}

/** Tìm hoặc tạo đội quân đứng yên tại ô. */
export function fieldArmy(s: GameState, tile: string) {
  let a = s.armies.find((x) => x.tile === tile && !x.move);
  if (!a) { a = { id: `ARM-${s.nextId++}`, tile, units: {} }; s.armies.push(a); }
  return a;
}
export function cleanArmies(s: GameState) { s.armies = s.armies.filter((a) => Object.values(a.units).some((n) => n > 0)); }

const fail = (state: GameState, error: string): CmdResult => ({ state, error });

/** Áp dụng một lệnh lên bản sao trạng thái; lỗi trả về trạng thái gốc + thông báo (không đổi state). */
export function applyCommand(d: GameData, s0: GameState, cmd: Cmd): CmdResult {
  if (s0.outcome !== 'playing') return fail(s0, 'Chiến dịch đã kết thúc');
  const s = clone(s0);
  const rules = d.campaign.rules;

  switch (cmd.t) {
    case 'build': {
      const def = d.buildings[cmd.bld];
      const t = s.tiles[cmd.tile];
      if (!def || def.enabled === false) return fail(s0, 'Công trình không khả dụng');
      if (!t || t.status !== 'settled') return fail(s0, 'Chỉ xây ở ô có khu định cư');
      if (def.terrain_only && !def.terrain_only.includes(t.terrain)) return fail(s0, 'Địa hình không phù hợp');
      if (t.buildings.length >= slotsOf(d, s, t.id)) return fail(s0, 'Hết ô trống');
      if (!canAfford(s, def.cost)) return fail(s0, 'Không đủ tài nguyên');
      pay(s, def.cost);
      t.buildings.push({ type: def.id, level: 1, remaining: def.build_turns });
      return { state: s };
    }
    case 'upgrade': {
      const t = s.tiles[cmd.tile];
      const b = t?.buildings[cmd.index];
      if (!t || t.status !== 'settled' || !b) return fail(s0, 'Không có công trình');
      if (b.remaining > 0) return fail(s0, 'Công trình đang xây');
      if (b.level >= rules.max_level) return fail(s0, 'Đã tối đa cấp');
      const def = d.buildings[b.type];
      if (!canAfford(s, def.cost, b.level + 1)) return fail(s0, 'Không đủ tài nguyên');
      pay(s, def.cost, b.level + 1);
      b.level += 1; b.remaining = def.build_turns;
      return { state: s };
    }
    case 'demolish': {
      const t = s.tiles[cmd.tile];
      const b = t?.buildings[cmd.index];
      if (!t || t.status !== 'settled' || !b) return fail(s0, 'Không có công trình');
      const def = d.buildings[b.type];
      for (const k of Object.keys(def.cost) as ResKey[]) s.res[k] += Math.floor((def.cost[k] ?? 0) * b.level * 0.5); // hoàn 50% (EDGE-03)
      t.buildings.splice(cmd.index, 1);
      return { state: s };
    }
    case 'train': {
      const def = d.units[cmd.unit];
      const t = s.tiles[cmd.tile];
      if (!def || def.side !== 'player' || def.enabled === false) return fail(s0, 'Đơn vị không khả dụng');
      if (!t || t.status !== 'settled') return fail(s0, 'Chỉ huấn luyện ở ô có khu định cư');
      if (!Number.isInteger(cmd.count) || cmd.count < 1) return fail(s0, 'Số lượng không hợp lệ');
      if (!def.garrison && !hasActive(t, 'BLD-BARRACKS')) return fail(s0, 'Cần Trại quân đã xây xong ở ô này');
      if (def.requires_building && !anyActive(s, def.requires_building)) return fail(s0, `Cần ${d.buildings[def.requires_building].name_vi}`);
      if (def.garrison) {
        const have = Object.values(t.garrison).reduce((a, b) => a + b, 0) +
          s.queue.filter((j) => j.tile === t.id && d.units[j.unit].garrison).reduce((a, j) => a + j.count, 0);
        if (have + cmd.count > garrisonCap(d, s, t.id)) return fail(s0, `Vượt trần đồn trú (${garrisonCap(d, s, t.id)}); xây thêm lũy để tăng`);
      }
      if (!canAfford(s, def.cost ?? {}, cmd.count)) return fail(s0, 'Không đủ tài nguyên');
      pay(s, def.cost ?? {}, cmd.count);
      s.queue.push({ tile: cmd.tile, unit: cmd.unit, count: cmd.count, remaining: def.train_turns ?? 1 });
      return { state: s };
    }
    case 'move':
    case 'attack': {
      const army = s.armies.find((a) => a.id === cmd.army);
      if (!army || army.move) return fail(s0, 'Quân không sẵn sàng');
      const dest = s.tiles[cmd.to];
      if (!dest) return fail(s0, 'Ô không tồn tại');
      const attack = cmd.t === 'attack';
      const enemyOwned = dest.status === 'hostile' || dest.status === 'lost';
      if (attack !== enemyOwned) return fail(s0, attack ? 'Chỉ tấn công ô địch chiếm' : 'Ô đích do địch chiếm, hãy dùng tấn công');
      // tách đội nếu chỉ định
      const take: Counts = cmd.units ? { ...cmd.units } : { ...army.units };
      for (const [u, n] of Object.entries(take)) {
        if (!(n > 0) || (army.units[u] ?? 0) < n) return fail(s0, 'Không đủ quân để điều');
      }
      if (Object.values(take).reduce((a, b) => a + b, 0) === 0) return fail(s0, 'Chưa chọn quân');
      const p = shortestPath(d, s, army.tile, cmd.to, (id) => s.tiles[id].status === 'settled' || s.tiles[id].status === 'open');
      if (!p) return fail(s0, 'Không có đường đi');
      const slowest = Math.min(...Object.keys(take).map((u) => d.units[u].speed).filter((v) => v > 0));
      if (!isFinite(slowest)) return fail(s0, 'Đơn vị đồn trú không thể di chuyển');
      for (const [u, n] of Object.entries(take)) { army.units[u] -= n; if (army.units[u] === 0) delete army.units[u]; }
      s.armies.push({ id: `ARM-${s.nextId++}`, tile: army.tile, units: take, move: { path: p.path.slice(1), remaining: Math.max(1, Math.ceil(p.cost / slowest)), attack } });
      cleanArmies(s);
      return { state: s };
    }
    case 'settle': {
      const t = s.tiles[cmd.tile];
      if (!t || t.status !== 'open') return fail(s0, 'Chỉ lập khu định cư ở đất trống');
      if (!t.adj.some((n) => s.tiles[n].status === 'settled')) return fail(s0, 'Phải kề một khu định cư');
      if (!canAfford(s, rules.settle_cost)) return fail(s0, 'Không đủ tài nguyên');
      pay(s, rules.settle_cost);
      t.status = 'settled';
      s.res.dantam += 3;
      return { state: s };
    }
    case 'research': {
      const p = d.policies[cmd.policy];
      if (!p) return fail(s0, 'Kế sách không tồn tại');
      if (s.policies.includes(p.id)) return fail(s0, 'Đã nghiên cứu');
      if (s.res.dantam < p.cost_dantam) return fail(s0, 'Không đủ Dân tâm');
      s.res.dantam -= p.cost_dantam;
      s.policies.push(p.id);
      return { state: s };
    }
    case 'choose': {
      const err = resolveEvent(d, s, cmd.event, cmd.choice, false);
      return err ? fail(s0, err) : { state: s };
    }
    case 'negotiate': {
      if (rules.win_mode === 'survive') return fail(s0, 'Chiến dịch này không có đàm phán: hãy giữ phòng tuyến tới hết thời hạn');
      if (s.turn < rules.negotiate_from_turn) return fail(s0, `Chỉ đàm phán từ lượt ${rules.negotiate_from_turn}`);
      if (s.raids.length || d.raids.some((r) => r.turn >= s.turn)) return fail(s0, 'Còn đợt tập kích chưa phân giải');
      if (s.repelled < rules.negotiate_min_repelled) return fail(s0, `Cần chặn ít nhất ${rules.negotiate_min_repelled} đợt tập kích`);
      if (Object.values(s.tiles).filter((x) => x.status === 'settled').length < rules.negotiate_min_settled) return fail(s0, `Cần giữ ít nhất ${rules.negotiate_min_settled} khu định cư`);
      if (s.res.dantam < rules.negotiate_min_dantam) return fail(s0, `Cần Dân tâm ≥ ${rules.negotiate_min_dantam}`);
      s.outcome = 'won'; s.outcomeReason = 'Giảng hòa thành công trong thế giữ vững biên cương';
      return { state: s };
    }
  }
}

/** Dùng cho UI/bot: các công trình đang hoạt động ở ô. */
export function listActive(s: GameState, tile: string) { return activeBuildings(s.tiles[tile]); }
