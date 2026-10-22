import { Rng } from './rng';
import type { Counts, GameData, Terrain } from './types';

export interface SideMods {
  atkMult: number;      // chính sách, morale
  fort: number;         // giảm sát thương nhận (bên phòng thủ có lũy)
  terrainAtk: number;   // hệ số sát thương gây ra do địa hình/cọc (bên tấn công)
}
export interface CombatInput {
  d: GameData; terrain: Terrain; attacker: Counts; defender: Counts;
  attMods: SideMods; defMods: SideMods; rng: Rng;
}
export interface CombatResult {
  winner: 'attacker' | 'defender'; rounds: number; attackerLeft: Counts; defenderLeft: Counts;
  causes: string[];
}

interface Inst { id: number; type: string; cls: string; side: 'a' | 'd'; hp: number; maxhp: number; atk: number; def: number }

/** Khắc chế (placeholder-balance, SYS-05). */
export function counter(attCls: string, tgtCls: string): number {
  if (attCls === 'bo_binh' && tgtCls === 'cung_no') return 1.3;
  if (attCls === 'cung_no' && tgtCls === 'thuy_binh') return 1.3;
  if (attCls === 'thuy_binh' && tgtCls === 'bo_binh') return 1.1;
  return 1;
}

/** Hệ số địa hình cho bên tấn công (SYS-06): vượt sông/núi/rừng bất lợi. */
export function terrainAttackerMod(t: Terrain): number {
  return { dong_bang: 1, ven_bien: 1, rung: 0.95, nui: 0.9, song: 0.85 }[t];
}

function spawn(d: GameData, counts: Counts, side: 'a' | 'd', startId: number): Inst[] {
  const out: Inst[] = [];
  let id = startId;
  for (const type of Object.keys(counts).sort()) {
    const u = d.units[type];
    for (let i = 0; i < counts[type]; i++) out.push({ id: id++, type, cls: u.class, side, hp: u.hp, maxhp: u.hp, atk: u.atk, def: u.def });
  }
  return out;
}

const power = (xs: Inst[]) => xs.reduce((a, x) => a + x.atk * x.hp, 0);

/** SYS-06: mô phỏng xác định theo rng. Không có đơn vị nào → bên kia thắng ngay. */
export function resolveCombat(inp: CombatInput): CombatResult {
  const { d, rng } = inp;
  const rules = d.campaign.rules;
  const A = spawn(d, inp.attacker, 'a', 0);
  const D = spawn(d, inp.defender, 'd', 1000);
  const all = [...A, ...D];
  const startA = power(A), startD = power(D);
  let boostedDmg = 0, totalDmg = 0;
  let rounds = 0;

  const alive = (side: 'a' | 'd') => all.filter((x) => x.side === side && x.hp > 0);
  for (let r = 0; r < rules.rounds && alive('a').length && alive('d').length; r++) {
    rounds++;
    for (const u of [...all].sort((x, y) => x.id - y.id)) {
      if (u.hp <= 0) continue;
      const foes = alive(u.side === 'a' ? 'd' : 'a');
      if (!foes.length) break;
      // Chọn mục tiêu: cận chiến 50% nhắm tuyến đầu (không phải tầm xa) trước, còn lại ngẫu nhiên theo seed.
      let pool = foes;
      if (u.cls === 'bo_binh' || u.cls === 'dan_binh') {
        const front = foes.filter((f) => f.cls !== 'cung_no');
        if (front.length && rng.next() < 0.5) pool = front;
      }
      const tgt = pool[rng.int(pool.length)];
      const mine = u.side === 'a' ? inp.attMods : inp.defMods;
      const theirs = u.side === 'a' ? inp.defMods : inp.attMods;
      const defRed = Math.min(0.6, tgt.def / (tgt.def + rules.defense_k));
      const c = counter(u.cls, tgt.cls);
      const dmg = u.atk * c * mine.atkMult * mine.terrainAtk * (1 - defRed) * (1 - theirs.fort) * rng.range(0.9, 1.1);
      tgt.hp -= dmg;
      totalDmg += dmg;
      if (c > 1 && u.side === 'a') boostedDmg += dmg;
    }
  }

  const left = (xs: Inst[]): Counts => {
    const o: Counts = {};
    for (const x of xs) if (x.hp > 0) o[x.type] = (o[x.type] ?? 0) + 1;
    return o;
  };
  const aLeft = alive('a'), dLeft = alive('d');
  const hpA = aLeft.reduce((a, x) => a + x.hp, 0), hpD = dLeft.reduce((a, x) => a + x.hp, 0);
  const winner: 'attacker' | 'defender' = !dLeft.length ? 'attacker' : !aLeft.length ? 'defender' : hpA > hpD ? 'attacker' : 'defender';

  // PIL-03: nguyên nhân (yếu tố có tác động lớn nhất lên trước)
  const causes: { w: number; s: string }[] = [];
  const ratio = startA > 0 && startD > 0 ? startA / startD : startA > 0 ? Infinity : 0;
  causes.push({ w: Math.abs(Math.log(Math.max(ratio, 0.01))) * 1, s: ratio >= 1 ? `Phe tấn công mạnh hơn ~${ratio === Infinity ? '∞' : ratio.toFixed(1)}× về sức mạnh gộp` : `Phe phòng thủ mạnh hơn ~${(1 / Math.max(ratio, 0.01)).toFixed(1)}× về sức mạnh gộp` });
  if (inp.defMods.fort > 0) causes.push({ w: inp.defMods.fort * 6, s: `Công sự/kế sách giảm ${(inp.defMods.fort * 100).toFixed(0)}% sát thương cho phe phòng thủ` });
  if (inp.attMods.terrainAtk < 1) causes.push({ w: (1 - inp.attMods.terrainAtk) * 6, s: `Địa hình/cọc làm phe tấn công mất ${((1 - inp.attMods.terrainAtk) * 100).toFixed(0)}% sát thương` });
  if (totalDmg > 0 && boostedDmg / totalDmg > 0.15) causes.push({ w: (boostedDmg / totalDmg) * 3, s: `Khắc chế quân chủng: ${(100 * boostedDmg / totalDmg).toFixed(0)}% sát thương của phe tấn công được tăng` });
  if (inp.attMods.atkMult !== 1 || inp.defMods.atkMult !== 1) causes.push({ w: 0.5 + Math.abs(inp.attMods.atkMult - inp.defMods.atkMult) * 4, s: `Kế sách/morale: sát thương phe tấn công ×${inp.attMods.atkMult.toFixed(2)}, phe phòng thủ ×${inp.defMods.atkMult.toFixed(2)}` });
  causes.sort((x, y) => y.w - x.w);

  return { winner, rounds, attackerLeft: left(aLeft), defenderLeft: left(dLeft), causes: causes.slice(0, 3).map((c) => c.s) };
}
