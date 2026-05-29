#!/usr/bin/env bash
# Re-encode large MP4s for web (requires ffmpeg).
#
# Usage:
#   ./scripts/optimize-videos.sh
#   DRY_RUN=1 ./scripts/optimize-videos.sh
#   CRF=28 MAX_WIDTH=1280 ./scripts/optimize-videos.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MIN_KB="${MIN_KB:-2000}"
CRF="${CRF:-28}"
MAX_WIDTH="${MAX_WIDTH:-1280}"
PRESET="${PRESET:-medium}"
DRY_RUN="${DRY_RUN:-0}"
BACKUP_DIR="${BACKUP_DIR:-}"

find_ffmpeg() {
  if command -v ffmpeg >/dev/null 2>&1; then
    command -v ffmpeg
    return 0
  fi
  for candidate in /opt/homebrew/bin/ffmpeg /usr/local/bin/ffmpeg; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

FFMPEG="$(find_ffmpeg || true)"
if [[ -z "$FFMPEG" ]]; then
  echo "ffmpeg not found. Install with: brew install ffmpeg"
  echo "Then re-run: ./scripts/optimize-videos.sh"
  exit 1
fi

TARGET_DIRS=(
  "assets/videos"
  "assets/project-specific/trubel-co"
  "assets/project-specific/unlocked labs"
)

total_before=0
total_after=0
changed=0

while IFS= read -r -d '' file; do
  size_kb=$(( $(stat -f%z "$file") / 1024 ))
  [[ "$size_kb" -ge "$MIN_KB" ]] || continue

  total_before=$((total_before + size_kb))

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] would encode (${size_kb}KB): $file"
    changed=$((changed + 1))
    continue
  fi

  tmp="${file}.optimizing.mp4"
  echo "Encoding (${size_kb}KB): $file"

  if [[ -n "$BACKUP_DIR" ]]; then
    mkdir -p "$BACKUP_DIR"
    cp -p "$file" "$BACKUP_DIR/$(basename "$file")"
  fi

  # Portfolio previews are muted; strip audio for smaller files.
  "$FFMPEG" -y -i "$file" \
    -vf "scale='min(${MAX_WIDTH},iw)':-2" \
    -c:v libx264 -preset "$PRESET" -crf "$CRF" \
    -movflags +faststart \
    -an \
    "$tmp"

  mv "$tmp" "$file"
  new_kb=$(( $(stat -f%z "$file") / 1024 ))
  total_after=$((total_after + new_kb))
  changed=$((changed + 1))
  printf '  → %d KB (%+d)\n' "$new_kb" "$((new_kb - size_kb))"
done < <(
  for dir in "${TARGET_DIRS[@]}"; do
    [[ -d "$dir" ]] && find "$dir" -type f -iname '*.mp4' -print0
  done
)

echo
echo "Videos: ${changed} encoded."
if [[ "$changed" -gt 0 && "$DRY_RUN" != "1" ]]; then
  saved=$(echo "scale=1; ($total_before - $total_after) / 1024" | bc)
  echo "Total: ${total_before} KB → ${total_after} KB (~${saved} MB saved)"
fi
