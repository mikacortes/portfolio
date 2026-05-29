#!/usr/bin/env bash
# WSCUC report screenshots: resize large PNGs; convert to JPEG only when smaller.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MAX_DIM="${MAX_DIM:-1800}"
JPEG_QUALITY="${JPEG_QUALITY:-84}"
MIN_PNG_KB="${MIN_PNG_KB:-500}"
DRY_RUN="${DRY_RUN:-0}"
HTML="projects/wscuc.html"

total_saved=0
changed=0

urlencode() {
  python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$1"
}

update_html() {
  local from_name="$1"
  local to_name="$2"
  local from_enc to_enc
  from_enc=$(urlencode "$from_name")
  to_enc=$(urlencode "$to_name")
  [[ -f "$HTML" ]] && grep -q "$from_enc" "$HTML" && sed -i '' "s|${from_enc}|${to_enc}|g" "$HTML"
}

try_convert_png() {
  local png="$1"
  [[ "$png" == *.png ]] || return 0

  local before_kb=$(( $(stat -f%z "$png") / 1024 ))
  [[ "$before_kb" -ge "$MIN_PNG_KB" ]] || return 0

  local jpg="${png%.png}.jpg"
  local tmp="${png}.tmp.jpg"

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] try PNG→JPEG (${before_kb}KB): $png"
    return 0
  fi

  sips -Z "$MAX_DIM" "$png" >/dev/null
  sips -s format jpeg -s formatOptions "$JPEG_QUALITY" "$png" --out "$tmp" >/dev/null

  local after_kb=$(( $(stat -f%z "$tmp") / 1024 ))
  if [[ "$after_kb" -lt "$before_kb" ]]; then
    mv "$tmp" "$jpg"
    rm "$png"
    update_html "$(basename "$png")" "$(basename "$jpg")"
    local saved=$((before_kb - after_kb))
    total_saved=$((total_saved + saved))
    changed=$((changed + 1))
    printf '%6d → %6d KB (%+d)  %s\n' "$before_kb" "$after_kb" "$((-saved))" "$jpg"
  else
    rm "$tmp"
    printf '  keep PNG (%d KB, JPEG would be %d KB)  %s\n' "$before_kb" "$after_kb" "$png"
  fi
}

resize_large_jpeg() {
  local jpg="$1"
  local before_kb=$(( $(stat -f%z "$jpg") / 1024 ))
  [[ "$before_kb" -ge "$MIN_PNG_KB" ]] || return 0

  local w h
  w=$(sips -g pixelWidth "$jpg" 2>/dev/null | awk '/pixelWidth:/{print $2}')
  h=$(sips -g pixelHeight "$jpg" 2>/dev/null | awk '/pixelHeight:/{print $2}')
  if [[ "$w" -le "$MAX_DIM" && "$h" -le "$MAX_DIM" ]]; then
    return 0
  fi

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] resize JPEG (${before_kb}KB, ${w}x${h}): $jpg"
    return 0
  fi

  sips -Z "$MAX_DIM" "$jpg" >/dev/null
  sips -s format jpeg -s formatOptions "$JPEG_QUALITY" "$jpg" --out "$jpg" >/dev/null
  local after_kb=$(( $(stat -f%z "$jpg") / 1024 ))
  if [[ "$after_kb" -lt "$before_kb" ]]; then
    local saved=$((before_kb - after_kb))
    total_saved=$((total_saved + saved))
    changed=$((changed + 1))
    printf '%6d → %6d KB (%+d)  %s\n' "$before_kb" "$after_kb" "$((-saved))" "$jpg"
  fi
}

echo "WSCUC images (MIN_PNG_KB=${MIN_PNG_KB}, MAX_DIM=${MAX_DIM})"
echo

while IFS= read -r -d '' png; do
  try_convert_png "$png"
done < <(find "assets/project-specific/wscuc" -type f -iname '*.png' -print0)

while IFS= read -r -d '' jpg; do
  resize_large_jpeg "$jpg"
done < <(find "assets/project-specific/wscuc" -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -print0)

echo
echo "Updated ${changed} files (~$((total_saved / 1024)) MB saved)."
