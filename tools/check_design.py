#!/usr/bin/env python3
"""Kiểm tra truy vết thiết kế & dữ liệu. Chạy: python3 -I tools/check_design.py (từ gốc repo). Exit 1 nếu lỗi."""
import glob, re, sys, yaml

ROOT = "."
LABELS = {"SOURCED", "FICTION", "ALT-HISTORY"}
errors = []

def load(p):
    with open(p, encoding="utf-8") as f:
        return yaml.safe_load(f)

design_text = "".join(open(p, encoding="utf-8").read() for p in sorted(glob.glob("docs/design/*.md")))
def in_design(i): return re.search(r"(?<![A-Za-z0-9-])" + re.escape(i) + r"(?![A-Za-z0-9])", design_text) is not None

# 1. game-data
ids, tiles, adj = set(), {}, {}
data = {p: load(p) for p in sorted(glob.glob("game-data/*.yaml"))}
for p, d in data.items():
    for key, rows in d.items():
        rows = rows if isinstance(rows, list) else [rows]
        for r in rows:
            if not isinstance(r, dict) or "id" not in r: continue
            if r["id"] in ids: errors.append(f"{p}: ID trùng {r['id']}")
            ids.add(r["id"])
            if r.get("source_label") not in LABELS: errors.append(f"{p}: {r['id']} thiếu/sai source_label")
            if "design" in r and not in_design(r["design"]): errors.append(f"{p}: {r['id']} design '{r['design']}' không có trong docs/design")
            if key == "tiles": tiles[r["id"]] = r; adj[r["id"]] = set(r["adj"])
for t, a in adj.items():
    for n in a:
        if n not in adj: errors.append(f"tile {t} kề ô không tồn tại {n}")
        elif t not in adj[n]: errors.append(f"tile kề không đối xứng {t}->{n}")
cap = data["game-data/campaign_cmp01.yaml"]["campaign"]["capital"]
if cap not in tiles: errors.append("capital không tồn tại")

# 2. backlog truy vết
bl = load("docs/production/BACKLOG.yaml")["features"]
test_ids = set(re.findall(r"TST-\d+", design_text))
for f in bl:
    for d in f["design"]:
        if not in_design(d): errors.append(f"{f['id']}: design ID '{d}' không tồn tại")
    for t in f["tests"]:
        if t not in test_ids: errors.append(f"{f['id']}: test ID '{t}' không tồn tại")
    if not f["design"] or not f["tests"]: errors.append(f"{f['id']}: thiếu design hoặc test")
used_sys = {d for f in bl for d in f["design"]}
for s in sorted(set(re.findall(r"SYS-\d+", design_text))):
    if s not in used_sys: errors.append(f"{s} chưa có feature nào trỏ tới")
used_t = {t for f in bl for t in f["tests"]}
for t in sorted(test_ids - used_t): errors.append(f"{t} chưa gắn feature nào")

print(f"ids={len(ids)} tiles={len(tiles)} features={len(bl)} design_ids_checked={len(used_sys)} tests={len(test_ids)}")
if errors:
    print("FAIL"); [print(" -", e) for e in errors]; sys.exit(1)
print("OK")
