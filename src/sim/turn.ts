import { cleanArmies, fieldArmy } from './commands';
import { activeBuildings, atkMult, fortBonus, moraleMod, stakesPenalty } from './derived';
import { resolveCombat, terrainAttackerMod } from './combat';
import { applyScheduled, autoResolvePending, openEvents } from './events';
import { shortestPath } from './graph';
import { Rng } from './rng';
import type { BattleReport, Counts, GameData, GameState, Raid, ResKey, TileRT } from './types';

const ENEMY_SPEED = 2;
const addTo = (a: Counts, b: Counts) => { for (const [k, n] of Object.entries(b)) a[k] = (a[k] ?? 0) + n; return a; };

function log(s: GameState, msg: string) { s.log.push(`[Lượt ${s.turn}] ${msg}`); if (s.log.length > 300) s.log.shift(); }

/** Ô định cư gần nguồn nhất theo chi phí đường (địch đi qua mọi ô). */
export function nearestSettled(d: GameData, s: GameState, from: string): { tile: string; cost: number } | null {
  let best: { tile: string; cost: number } | null = null;
  for (const t of Object.values(s.tiles)) {
    if (t.status !== 'settled') continue;
    const p = shortestPath(d, s, from, t.id);
    if (p && (!best || p.cost < best.cost || (p.cost === best.cost && t.id < best.tile))) best = { tile: t.id, cost: p.cost };
  }
  return best;
}

function produce(d: GameData, s: GameState) {
  for (const t of Object.values(s.tiles)) {
    if (t.status !== 'settled') continue;
    for (const b of activeBuildings(t)) {
      const def = d.buildings[b.type];
      for (const k of Object.keys(def.produces ?? {}) as ResKey[]) {
        s.res[k] += Math.round((def.produces![k] ?? 0) * b.level * (def.terrain_mult?.[t.terrain] ?? 1));
      }
    }
  }
}

function construct(s: GameState) {
  for (const t of Object.values(s.tiles)) for (const b of t.buildings) if (b.remaining > 0) b.remaining -= 1;
}

function mergeArrival(s: GameState, dest: string, units: Counts) { addTo(fieldArmy(s, dest).units, units); }

function train(d: GameData, s: GameState) {
  const rest = [];
  for (const j of s.queue) {
    j.remaining -= 1;
    if (j.remaining > 0) { rest.push(j); continue; }
    const t = s.tiles[j.tile];
    if (t.status !== 'settled') { log(s, `Huấn luyện ${d.units[j.unit].name_vi} tại ${j.tile} bị hủy (ô đã mất)`); continue; }
    if (d.units[j.unit].garrison) addTo(t.garrison, { [j.unit]: j.count });
    else addTo(fieldArmy(s, j.tile).units, { [j.unit]: j.count });
    log(s, `Hoàn tất huấn luyện ${j.count} ${d.units[j.unit].name_vi} tại ${j.tile}`);
  }
  s.queue = rest;
}

function spawnRaids(d: GameData, s: GameState) {
  for (const r of s.raids) r.eta -= 1; // chỉ các đợt đã có từ trước
  const pre = d.campaign.preemptive;
  for (const def of d.raids.filter((x) => x.turn === s.turn)) {
    const target = nearestSettled(d, s, def.origin);
    if (!target) { s.outcome = 'lost'; s.outcomeReason = 'Không còn khu định cư nào'; return; }
    const weaken = def.turn >= pre.min_turn_effect && s.tiles[pre.tile].status !== 'hostile' ? pre.weaken_factor : 1;
    const edit = s.raidEdits[def.id] ?? { delay: 0, mult: 1 };
    const units: Counts = {};
    for (const [u, n] of Object.entries(def.units)) units[u] = Math.max(1, Math.floor(n * weaken * edit.mult));
    const raid: Raid = { id: def.id, origin: def.origin, target: target.tile, eta: Math.max(1, Math.ceil(target.cost / ENEMY_SPEED)) + edit.delay, units };
    s.raids.push(raid);
    log(s, `Tình báo: đợt tập kích ${def.id} nhắm ${target.tile}, dự kiến tới sau ${raid.eta} lượt${weaken < 1 ? ' (đã bị suy yếu do mất hậu cứ)' : ''}`);
  }
}

function pushReport(s: GameState, r: BattleReport) { s.reports.push(r); log(s, `Trận ${r.kind === 'raid' ? 'phòng thủ' : 'tấn công'} tại ${r.tile}: ${r.winner === (r.kind === 'raid' ? 'defender' : 'attacker') ? 'THẮNG' : 'THUA'}`); }

function loseTile(d: GameData, s: GameState, t: TileRT, survivors: Counts) {
  if (t.id === d.campaign.capital) { s.outcome = 'lost'; s.outcomeReason = 'Thủ phủ thất thủ'; }
  t.status = 'lost';
  t.buildings = t.buildings.map((b) => ({ ...b, level: b.level - 1 })).filter((b) => b.level > 0);
  t.garrison = {};
  t.defenders = survivors;
  s.armies = s.armies.filter((a) => !(a.tile === t.id && !a.move));
  s.queue = s.queue.filter((j) => j.tile !== t.id);
  s.res.dantam = Math.max(-20, s.res.dantam - 5);
}

function resolveRaids(d: GameData, s: GameState, rng: Rng) {
  const due = s.raids.filter((r) => r.eta <= 0).sort((a, b) => (a.id < b.id ? -1 : 1));
  for (const raid of due) {
    let t = s.tiles[raid.target];
    if (t.status !== 'settled') { // mục tiêu đã mất → chuyển hướng tới ô gần nhất còn lại
      const nt = nearestSettled(d, s, raid.target);
      if (!nt) { s.outcome = 'lost'; s.outcomeReason = 'Không còn khu định cư nào'; return; }
      raid.target = nt.tile; raid.eta = Math.max(1, Math.ceil(nt.cost / ENEMY_SPEED));
      continue;
    }
    const stat = s.armies.find((a) => a.tile === t.id && !a.move);
    const defenders: Counts = addTo(addTo({}, t.garrison), stat?.units ?? {});
    const stakes = t.terrain === 'song' ? stakesPenalty(d, s, t.id) : 0;
    const res = resolveCombat({
      d, terrain: t.terrain, attacker: raid.units, defender: defenders, rng,
      attMods: { atkMult: 1, fort: 0, terrainAtk: terrainAttackerMod(t.terrain) * (1 - stakes) },
      defMods: { atkMult: atkMult(d, s) * moraleMod(d, s), fort: fortBonus(d, s, t.id), terrainAtk: 1 },
    });
    pushReport(s, {
      turn: s.turn, tile: t.id, kind: 'raid', raidId: raid.id, attacker: raid.units, defender: defenders,
      attackerLeft: res.attackerLeft, defenderLeft: res.defenderLeft, winner: res.winner, rounds: res.rounds,
      causes: stakes > 0 ? [`Cọc ngầm làm quân vượt sông mất ${(stakes * 100).toFixed(0)}% sát thương`, ...res.causes].slice(0, 3) : res.causes,
    });
    s.raids = s.raids.filter((r) => r.id !== raid.id);
    if (res.winner === 'defender') {
      // phân bổ lại quân sống sót (dân binh ở garrison, còn lại ở đội đứng yên)
      t.garrison = {}; const mobile: Counts = {};
      for (const [u, n] of Object.entries(res.defenderLeft)) (d.units[u].garrison ? t.garrison : mobile)[u] = n;
      if (stat) stat.units = mobile;
      s.repelled += 1; s.res.dantam += 3;
      cleanArmies(s);
    } else {
      loseTile(d, s, t, res.attackerLeft);
      log(s, `${t.id} thất thủ!`);
      if (s.outcome !== 'playing') return;
    }
  }
}

function resolveAssaults(d: GameData, s: GameState, rng: Rng, arrivals: { armyId: string; dest: string }[]) {
  for (const { armyId, dest } of arrivals) {
    const army = s.armies.find((a) => a.id === armyId)!;
    const t = s.tiles[dest];
    const res = resolveCombat({
      d, terrain: t.terrain, attacker: army.units, defender: t.defenders, rng,
      attMods: { atkMult: atkMult(d, s) * moraleMod(d, s), fort: 0, terrainAtk: terrainAttackerMod(t.terrain) },
      defMods: { atkMult: 1, fort: 0, terrainAtk: 1 },
    });
    pushReport(s, {
      turn: s.turn, tile: dest, kind: 'assault', attacker: army.units, defender: t.defenders,
      attackerLeft: res.attackerLeft, defenderLeft: res.defenderLeft, winner: res.winner, rounds: res.rounds, causes: res.causes,
    });
    delete army.move;
    if (res.winner === 'attacker') {
      t.status = 'open'; t.defenders = {}; army.tile = dest; army.units = res.attackerLeft; s.res.dantam += 2;
      log(s, `Chiếm được ${dest}`);
      mergeStationary(s, army.id);
    } else {
      t.defenders = res.defenderLeft; army.units = res.attackerLeft; // quân sống sót rút về ô xuất phát (army.tile)
      mergeStationary(s, army.id);
    }
  }
  cleanArmies(s);
}

/** Gộp đội đứng yên cùng ô để mỗi ô chỉ có một đội đứng yên. */
function mergeStationary(s: GameState, id: string) {
  const a = s.armies.find((x) => x.id === id);
  if (!a || a.move) return;
  const other = s.armies.find((x) => x.id !== id && x.tile === a.tile && !x.move);
  if (other) { addTo(other.units, a.units); a.units = {}; }
}

/** SYS-02: thứ tự phân giải cuối lượt. */
export function endTurn(d: GameData, s0: GameState): GameState {
  if (s0.outcome !== 'playing') return s0;
  const s = structuredClone(s0);
  const rng = new Rng(s.rng);
  const rules = d.campaign.rules;

  autoResolvePending(d, s);                        // 0: sự kiện chưa chọn → mặc định
  applyScheduled(s);
  produce(d, s);                                   // 1
  construct(s);                                    // 2
  const arrivals: { armyId: string; dest: string }[] = []; // 3
  for (const a of s.armies) {
    if (!a.move) continue;
    a.move.remaining -= 1;
    if (a.move.remaining > 0) continue;
    const dest = a.move.path[a.move.path.length - 1];
    if (a.move.attack) arrivals.push({ armyId: a.id, dest });
    else { a.tile = dest; delete a.move; mergeStationary(s, a.id); }
  }
  cleanArmies(s);
  train(d, s);                                     // 4
  spawnRaids(d, s);                                // 5
  if (s.outcome === 'playing') resolveRaids(d, s, rng);       // 6a
  if (s.outcome === 'playing') resolveAssaults(d, s, rng, arrivals); // 6b

  s.rng = rng.state;
  s.turn += 1;
  if (s.outcome === 'playing') {
    openEvents(d, s);
    s.negDantamTurns = s.res.dantam < 0 ? s.negDantamTurns + 1 : 0;
    if (s.negDantamTurns >= rules.lose_dantam_turns) { s.outcome = 'lost'; s.outcomeReason = 'Dân tâm cạn kiệt'; }
    else if (s.turn > rules.deadline_turn) { s.outcome = 'lost'; s.outcomeReason = 'Hết thời hạn chiến dịch mà chưa giảng hòa'; }
  }
  return s;
}
