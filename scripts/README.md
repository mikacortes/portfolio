# Asset optimization scripts

Run from the repo root.

## Images

```bash
# Trubel, Unlocked Labs, home previews (resize large PNG/JPEG)
./scripts/optimize-assets.sh

# WSCUC report pages (PNG → JPEG only when smaller)
./scripts/optimize-wscuc-images.sh
```

Dry run: `DRY_RUN=1 ./scripts/optimize-assets.sh`

## Videos (largest remaining win)

Requires [ffmpeg](https://ffmpeg.org/) (`brew install ffmpeg`):

```bash
./scripts/optimize-videos.sh
```

Encodes MP4s over 2MB to 1280px wide H.264 (~CRF 28). Portfolio preview videos are muted.
