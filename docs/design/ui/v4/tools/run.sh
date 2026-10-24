#!/bin/bash
# build bản đồ: sprites (Chromium) -> paint_map.py -> preview
D="$(cd "$(dirname "$0")" && pwd)"
node "$D/../mockups/render_sprites.mjs" && python3 -P "$D/paint_map.py" && python3 -P -c "
from PIL import Image
im=Image.open('$D/../build/map_bg.png'); im.resize((1600,900),Image.LANCZOS).save('$D/../build/prev_full.png'); im.crop((0,0,1400,900)).save('$D/../build/prev_crop.png')"
python3 -P -c "import json;open(\"$D/../build/roads.js\",\"w\").write(\"const ROADS=\"+open(\"$D/../build/roads.json\").read()+\";\")"
echo BUILD_DONE
