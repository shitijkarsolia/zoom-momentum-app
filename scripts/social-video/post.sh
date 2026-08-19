#!/usr/bin/env bash
# Turns the raw Playwright capture into the delivered social files.
#
#   scripts/social-video/post.sh
#
# Steps: locate the content window inside the raw take, retime it back to the
# duration the shoot script actually scheduled (Playwright's webm timestamps run
# long), then encode an H.264/AAC MP4 that LinkedIn and X both accept.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT_DIR="${OUT_DIR:-$ROOT/build/social-video}"
RAW="$OUT_DIR/raw/capture.webm"
DIST="$OUT_DIR/dist"

# Wall-clock length the shoot script scheduled; keep in step with TOTAL in shoot.mjs.
TARGET="${TARGET:-34.5}"

[ -f "$RAW" ] || { echo "missing raw capture: $RAW (run shoot.mjs first)" >&2; exit 1; }
mkdir -p "$DIST"

eval "$(node "$HERE/find-window.mjs" "$RAW")"
echo "content window: START=$START DURATION=$DURATION -> retiming to ${TARGET}s"

FACTOR=$(python3 -c "print(f'{$TARGET/$DURATION:.6f}')")
echo "setpts factor: $FACTOR"

FADE_OUT=$(python3 -c "print(f'{$TARGET-0.5:.2f}')")

# A silent stereo track ships with the cut: some feed players treat a
# video-only MP4 as broken rather than as muted.
ENC=(-c:v libx264 -profile:v high -level 4.1 -preset slow -crf 19
     -pix_fmt yuv420p -movflags +faststart
     -c:a aac -b:a 128k -shortest)

# --- 16:9, the main cut -----------------------------------------------------
ffmpeg -hide_banner -loglevel error -y \
  -i "$RAW" \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -filter_complex "[0:v]trim=start=${START}:end=${END},setpts=(PTS-STARTPTS)*${FACTOR},\
fps=30,scale=1920:1080:flags=lanczos,\
fade=t=in:st=0:d=0.35,fade=t=out:st=${FADE_OUT}:d=0.5,format=yuv420p[v]" \
  -map "[v]" -map 1:a \
  "${ENC[@]}" \
  "$DIST/zoom-momentum-demo-16x9.mp4"

echo "wrote $DIST/zoom-momentum-demo-16x9.mp4"

ls -la "$DIST"
