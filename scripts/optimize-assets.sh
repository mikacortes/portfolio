#!/usr/bin/env bash
# Resize and compress portfolio images in place (macOS sips).
# Requires: sips (built into macOS). Videos: run optimize-videos.sh (needs ffmpeg).
#
# Usage:
#   ./scripts/optimize-assets.sh              # default targets
#   MIN_KB=300 MAX_DIM=1800 ./scripts/optimize-assets.sh
#   DRY_RUN=1 ./scripts/optimize-assets.sh    # print only, no writes

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MIN_KB="${MIN_KB:-400}"
MAX_DIM="${MAX_DIM:-2000}"
PREVIEW_MAX_DIM="${PREVIEW_MAX_DIM:-1400}"
JPEG_QUALITY="${JPEG_QUALITY:-82}"
DRY_RUN="${DRY_RUN:-0}"

TARGET_DIRS=(
  "assets/project-specific/trubel-co"
  "assets/project-specific/wscuc"
  "assets/project-specific/unlocked labs"
  "assets/images"
)

preview_dir="assets/images"

total_before=0
total_after=0
changed=0
skipped=0

file_size_kb() {
  echo $(( $(stat -f%z "$1") / 1024 ))
}

image_dimensions() {
  local w h
  w=$(sips -g pixelWidth "$1" 2>/dev/null | awk '/pixelWidth:/{print $2}')
  h=$(sips -g pixelHeight "$1" 2>/dev/null | awk '/pixelHeight:/{print $2}')
  echo "${w:-0} ${h:-0}"
}

should_process() {
  local file="$1"
  local size_kb="$2"
  local w="$3"
  local h="$4"
  local max_dim="$5"

  if [[ "$size_kb" -ge "$MIN_KB" ]]; then
    return 0
  fi
  if [[ "$w" -gt "$max_dim" || "$h" -gt "$max_dim" ]]; then
    return 0
  fi
  return 1
}

optimize_image() {
  local file="$1"
  local max_dim="$2"
  local size_kb w h before after

  [[ -f "$file" ]] || return 0
  case "$file" in
    *.png|*.PNG|*.jpg|*.JPG|*.jpeg|*.JPEG|*.webp|*.WEBP) ;;
    *) return 0 ;;
  esac

  read -r w h <<< "$(image_dimensions "$file")"
  size_kb=$(file_size_kb "$file")

  if ! should_process "$file" "$size_kb" "$w" "$h" "$max_dim"; then
    skipped=$((skipped + 1))
    return 0
  fi

  before=$size_kb
  total_before=$((total_before + before))

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] would optimize (${before}KB, ${w}x${h}): $file"
    changed=$((changed + 1))
    total_after=$((total_after + before))
    return 0
  fi

  if [[ "$w" -gt "$max_dim" || "$h" -gt "$max_dim" ]]; then
    sips -Z "$max_dim" "$file" >/dev/null
  fi

  # Re-compress JPEG only (sips PNG re-encode often increases file size).
  case "$file" in
    *.jpg|*.JPG|*.jpeg|*.JPEG)
      if [[ "$before" -ge "$MIN_KB" ]]; then
        sips -s format jpeg -s formatOptions "$JPEG_QUALITY" "$file" --out "$file" >/dev/null
      fi
      ;;
  esac

  read -r w h <<< "$(image_dimensions "$file")"
  after=$(file_size_kb "$file")
  total_after=$((total_after + after))
  changed=$((changed + 1))

  local saved=$((before - after))
  printf '%6d → %6d KB (%+d)  %s\n' "$before" "$after" "$((-saved))" "$file"
}

echo "Optimizing images (MIN_KB=${MIN_KB}, MAX_DIM=${MAX_DIM}, JPEG_Q=${JPEG_QUALITY})"
echo

for dir in "${TARGET_DIRS[@]}"; do
  [[ -d "$dir" ]] || continue
  while IFS= read -r -d '' file; do
    if [[ "$file" == "$preview_dir"* ]]; then
      optimize_image "$file" "$PREVIEW_MAX_DIM"
    else
      optimize_image "$file" "$MAX_DIM"
    fi
  done < <(find "$dir" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0)
done

echo
echo "Done: ${changed} optimized, ${skipped} skipped."
if [[ "$changed" -gt 0 && "$DRY_RUN" != "1" ]]; then
  saved_mb=$(echo "scale=1; ($total_before - $total_after) / 1024" | bc)
  echo "Total: ${total_before} KB → ${total_after} KB (~${saved_mb} MB saved)"
fi
