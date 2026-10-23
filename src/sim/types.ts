export type Terrain = 'dong_bang' | 'song' | 'nui' | 'ven_bien' | 'rung';
export type TileStatus = 'hostile' | 'open' | 'settled' | 'lost';
export type ResKey = 'grain' | 'wood' | 'stone' | 'iron' | 'dantam';
export type Res = Record<ResKey, number>;
export type Counts = Record<string, number>;

export interface BuildingDef {
  id: string; name_vi: string; enabled?: boolean;
  produces?: Partial<Res>; terrain_mult?: Partial<Record<Terrain, number>>;
  supply_cap?: number; trains?: boolean; fort_bonus?: number; attacker_penalty?: number;
  warn_lead_bonus?: number; terrain_only?: Terrain[]; cost: Partial<Res>; build_turns: number;
}
export interface UnitDef {
  id: string; name_vi: string; side: 'player' | 'enemy'; class: string; enabled?: boolean;
  hp: number; atk: number; def: number; range: number; speed: number; supply: number;
  cost?: Partial<Res>; train_turns?: number; garrison?: boolean; requires_building?: string;
}
export interface PolicyDef {
  id: string; name_vi: string; cost_dantam: number;
  effect: { supply_cap?: number; fort_bonus?: number; atk_mult?: number };
}
export interface TileDef {
  id: string; name_vi: string; terrain: Terrain; state: TileStatus; x: number; y: number;
  adj: string[]; defenders?: Counts;
}
export type ModKind = 'atk_mult' | 'fort' | 'warn_lead' | 'supply_cap';
export interface ModDef { kind: ModKind; value: number; turns?: number; terrain?: Terrain }
export interface Mod { kind: ModKind; value: number; until?: number; terrain?: Terrain }
export interface Effects {
  res?: Partial<Res>; mods?: ModDef[]; raid?: { delay?: number; mult?: number };
  later?: { after: number; res: Partial<Res> }[];
}
export interface EventChoice { id: string; label_vi: string; default?: boolean; effects: Effects }
export interface EventDef {
  id: string; turn: number; name_vi: string; text_vi: string; choices: EventChoice[];
  source_label: string; source_ids: string[];
}
export interface RaidDef { id: string; turn: number; origin: string; units: Counts }
export interface Rules {
  deadline_turn: number; negotiate_from_turn: number; negotiate_min_repelled: number;
  negotiate_min_dantam: number; negotiate_min_settled: number; lose_dantam_turns: number; base_supply_cap: number;
  base_warn_lead: number; rounds: number; defense_k: number; settle_cost: Partial<Res>;
  default_slots: number; capital_slots: number; max_level: number;
  garrison_base: number; garrison_capital_bonus: number; garrison_per_fort_level: number;
  terrain_cost: Record<Terrain, number>;
}
export interface GameData {
  buildings: Record<string, BuildingDef>;
  units: Record<string, UnitDef>;
  policies: Record<string, PolicyDef>;
  campaign: {
    id: string; name_vi: string; seed: number; capital: string; start: Res;
    start_buildings: Record<string, string[]>; rules: Rules;
    preemptive: { tile: string; weaken_factor: number; min_turn_effect: number };
  };
  tiles: TileDef[];
  raids: RaidDef[];
  events: EventDef[];
}

export interface BuildingInst { type: string; level: number; remaining: number }
export interface TileRT {
  id: string; terrain: Terrain; status: TileStatus; adj: string[];
  buildings: BuildingInst[]; garrison: Counts; defenders: Counts;
}
export interface Army { id: string; tile: string; units: Counts; move?: { path: string[]; remaining: number; attack: boolean } }
export interface TrainJob { tile: string; unit: string; count: number; remaining: number }
export interface Raid { id: string; origin: string; target: string; eta: number; units: Counts }

export interface BattleReport {
  turn: number; tile: string; kind: 'raid' | 'assault'; raidId?: string;
  attacker: Counts; defender: Counts; attackerLeft: Counts; defenderLeft: Counts;
  winner: 'attacker' | 'defender'; rounds: number; causes: string[];
}

export interface GameState {
  save_version: 2;
  campaign: string;
  turn: number;
  rng: number;
  res: Res;
  tiles: Record<string, TileRT>;
  armies: Army[];
  queue: TrainJob[];
  raids: Raid[];
  policies: string[];
  repelled: number;
  negDantamTurns: number;
  nextId: number;
  weaken: Record<string, number>;
  mods: Mod[];
  pendingEvents: string[];
  eventLog: { turn: number; event: string; choice: string; auto: boolean }[];
  raidEdits: Record<string, { delay: number; mult: number }>;
  scheduled: { turn: number; res: Partial<Res> }[];
  log: string[];
  reports: BattleReport[];
  outcome: 'playing' | 'won' | 'lost';
  outcomeReason?: string;
}

export type Cmd =
  | { t: 'build'; tile: string; bld: string }
  | { t: 'upgrade'; tile: string; index: number }
  | { t: 'demolish'; tile: string; index: number }
  | { t: 'train'; tile: string; unit: string; count: number }
  | { t: 'move'; army: string; to: string; units?: Counts }
  | { t: 'attack'; army: string; to: string; units?: Counts }
  | { t: 'settle'; tile: string }
  | { t: 'research'; policy: string }
  | { t: 'negotiate' }
  | { t: 'choose'; event: string; choice: string };

export interface CmdResult { state: GameState; error?: string }
