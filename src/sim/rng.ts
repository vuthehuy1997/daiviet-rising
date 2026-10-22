/** mulberry32 — trạng thái là một số nguyên nên serialize được; thay cho Math.random để sim xác định (EDGE-07). */
export function nextRand(state: number): [number, number] {
  let t = (state + 0x6d2b79f5) >>> 0;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, t];
}

export class Rng {
  constructor(public state: number) {}
  next(): number {
    const [v, s] = nextRand(this.state);
    this.state = s;
    return v;
  }
  range(lo: number, hi: number): number { return lo + (hi - lo) * this.next(); }
  int(n: number): number { return Math.floor(this.next() * n); }
}

/** Băm trạng thái để kiểm tra tính xác định (TST-02). */
export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
