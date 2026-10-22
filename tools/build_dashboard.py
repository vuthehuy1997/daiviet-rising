#!/usr/bin/env python3
"""Sinh dashboard/index.html (tĩnh, tự chứa, chỉ đọc) từ docs/, state/, game-data/, BACKLOG. Chạy: python3 -I tools/build_dashboard.py"""
import glob, json, os, yaml

def rd(p): return open(p, encoding="utf-8").read()
groups = {"Trạng thái & phê duyệt": sorted(glob.glob("state/*.md")),
          "Nghiên cứu": sorted(glob.glob("docs/research/*.md")) + ["docs/00_INTAKE.md"],
          "Concept (G1)": sorted(glob.glob("docs/concepts/*.md")),
          "Thiết kế (G2)": sorted(glob.glob("docs/design/*.md")),
          "Sản xuất & phát hành": ["docs/production/ROADMAP.md"] + sorted(glob.glob("docs/change_requests/*.md")) + sorted(glob.glob("docs/release/*.md")),
          "Bằng chứng QA": sorted(glob.glob("docs/qa/EVIDENCE_*.txt")),
          "Dữ liệu game": sorted(glob.glob("game-data/*.yaml")) + ["docs/production/BACKLOG.yaml"]}
docs = [{"group": g, "path": p, "text": rd(p), "kind": "md" if p.endswith(".md") else "yaml"} for g, ps in groups.items() for p in ps if os.path.exists(p)]
backlog = yaml.safe_load(rd("docs/production/BACKLOG.yaml"))["features"]
payload = json.dumps({"docs": docs, "backlog": backlog}, ensure_ascii=False).replace("</", "<\\/")
html = open("tools/dashboard_template.html", encoding="utf-8").read().replace("/*__DATA__*/null", payload)
os.makedirs("dashboard", exist_ok=True)
open("dashboard/index.html", "w", encoding="utf-8").write(html)
print(f"docs={len(docs)} features={len(backlog)} bytes={len(html)}")
