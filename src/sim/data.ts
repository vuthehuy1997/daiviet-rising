import buildingsDoc from '../../game-data/buildings.yaml';
import unitsDoc from '../../game-data/units.yaml';
import eventsDoc from '../../game-data/events_cmp01.yaml';
import campaignDoc from '../../game-data/campaign_cmp01.yaml';
import campaign2Doc from '../../game-data/campaign_cmp02.yaml';
import type { EventDef, BuildingDef, GameData, PolicyDef, TileDef, UnitDef, RaidDef } from './types';

const RES_KEYS = new Set(['grain', 'wood', 'stone', 'iron', 'dantam']);
const MOD_KINDS = new Set(['atk_mult', 'fort', 'warn_lead', 'supply_cap']);
const LABELS = new Set(['SOURCED', 'FICTION', 'ALT-HISTORY']);

/** Tải + kiểm tra schema dữ liệu (TST-05). Ném lỗi liệt kê mọi vấn đề. */
export function loadData(campaignId: 'CMP-01' | 'CMP-02' = 'CMP-01'): GameData {
  const b = buildingsDoc as { buildings: BuildingDef[] };
  const u = unitsDoc as { units: UnitDef[]; policies: PolicyDef[] };
  const c = (campaignId === 'CMP-02' ? campaign2Doc : campaignDoc) as any;
  const ev = campaignId === 'CMP-01' ? (eventsDoc as { events: EventDef[] }).events : []; // CMP-02 chưa có sự kiện lựa chọn
  const data: GameData = {
    buildings: Object.fromEntries(b.buildings.map((x) => [x.id, x])),
    units: Object.fromEntries(u.units.map((x) => [x.id, x])),
    policies: Object.fromEntries(u.policies.map((x) => [x.id, x])),
    campaign: c.campaign,
    tiles: c.tiles as TileDef[],
    raids: c.raids as RaidDef[],
    events: ev,
  };
  const errs = validateData(data, [...b.buildings, ...u.units, ...u.policies, ...c.tiles, ...c.raids, ...ev, c.campaign]);
  if (errs.length) throw new Error('game-data không hợp lệ:\n' + errs.join('\n'));
  return data;
}

export function validateData(d: GameData, rows: any[]): string[] {
  const errs: string[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    if (seen.has(r.id)) errs.push(`ID trùng: ${r.id}`);
    seen.add(r.id);
    if (!LABELS.has(r.source_label)) errs.push(`${r.id}: thiếu/sai source_label`);
  }
  const tiles = new Map(d.tiles.map((t) => [t.id, t]));
  for (const t of d.tiles) {
    for (const n of t.adj) {
      const o = tiles.get(n);
      if (!o) errs.push(`${t.id} kề ô không tồn tại ${n}`);
      else if (!o.adj.includes(t.id)) errs.push(`kề không đối xứng ${t.id}->${n}`);
    }
    for (const k of Object.keys(t.defenders ?? {})) if (!d.units[k]) errs.push(`${t.id}: defender không tồn tại ${k}`);
  }
  if (!tiles.has(d.campaign.capital)) errs.push('capital không tồn tại');
  const tide = d.campaign.tide;
  const lure = d.campaign.lure;
  if (lure) {
    for (const k of Object.keys(lure.cost)) if (!RES_KEYS.has(k)) errs.push(`lure.cost: tài nguyên lạ ${k}`);
    if (!(lure.range >= 0 && Number.isInteger(lure.range))) errs.push('lure.range phải là số nguyên ≥ 0');
    if (!(lure.max_detour >= 0)) errs.push('lure.max_detour phải ≥ 0');
    if (!(lure.estimate_max_units >= 0)) errs.push('lure.estimate_max_units phải ≥ 0');
  }
  if (tide) {
    if (!(Number.isInteger(tide.period) && tide.period >= 2 && tide.period <= 4)) errs.push('tide.period phải là số nguyên 2–4');
    if (!Number.isInteger(tide.phase_offset)) errs.push('tide.phase_offset phải là số nguyên');
    for (const p of ['rising', 'high', 'ebb'] as const) if (!(tide.stakes_mult?.[p] >= 0 && tide.stakes_mult[p] <= 1)) errs.push(`tide.stakes_mult.${p} phải trong [0,1]`);
    if (!(tide.naval_ebb_cost_mult >= 1)) errs.push('tide.naval_ebb_cost_mult phải ≥ 1');
  }
  for (const r of d.raids) {
    if (!tiles.has(r.origin)) errs.push(`${r.id}: origin không tồn tại`);
    for (const k of Object.keys(r.units)) if (!d.units[k]) errs.push(`${r.id}: unit không tồn tại ${k}`);
  }
  for (const [t, bl] of Object.entries(d.campaign.start_buildings)) {
    if (!tiles.has(t)) errs.push(`start_buildings: ô không tồn tại ${t}`);
    for (const x of bl) if (!d.buildings[x]) errs.push(`start_buildings: công trình không tồn tại ${x}`);
  }
  for (const e of d.events) {
    if (!(e.turn >= 1 && e.turn <= d.campaign.rules.deadline_turn)) errs.push(`${e.id}: turn ngoài phạm vi`);
    if (e.choices.length < 2 || e.choices.length > 3) errs.push(`${e.id}: cần 2–3 lựa chọn`);
    if (e.choices.filter((c) => c.default).length !== 1) errs.push(`${e.id}: cần đúng 1 lựa chọn default`);
    if (new Set(e.choices.map((c) => c.id)).size !== e.choices.length) errs.push(`${e.id}: id lựa chọn trùng`);
    for (const c of e.choices) {
      const f = c.effects ?? {};
      for (const k of Object.keys(f.res ?? {})) if (!RES_KEYS.has(k)) errs.push(`${e.id}/${c.id}: tài nguyên lạ ${k}`);
      for (const m of f.mods ?? []) if (!MOD_KINDS.has(m.kind) || typeof m.value !== 'number') errs.push(`${e.id}/${c.id}: mod sai`);
      for (const l of f.later ?? []) if (!(l.after >= 1)) errs.push(`${e.id}/${c.id}: later.after sai`);
    }
  }
  return errs;
}
