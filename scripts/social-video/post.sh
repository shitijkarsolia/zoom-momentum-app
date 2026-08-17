#!/usr/bin/env bash
# Turns the raw Playwright capture into the delivered social files.
#
#   scripts/social-video/post.sh
#
# Steps: locate the content window inside the raw take, retime it back to the
# duration the shoot script actually scheduled (Playwright's webm timestamps run
# long), then encode H.264/AAC MP4s that LinkedIn and X both accept.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT_DIR="${OUT_DIR:-$ROOT/build/social-video}"
RAW="$OUT_DIR/raw/capture.webm"
DIST="$OUT_DIR/dist"

# Wall-clock length the shoot script scheduled; keep in step with TOTAL in shoot.mjs.
TARGET="${TARGET:-42.7}"

[ -f "$RAW" ] || { echo "missing raw capture: $RAW (run shoot.mjs first)" >&2; exit 1; }
mkdir -p "$DIST"

eval "$(node "$HERE/find-window.mjs" "$RAW")"
echo "content window: START=$START DURATION=$DURATION -> retiming to ${TARGET}s"

FACTOR=$(python3 -c "print(f'{$TARGET/$DURATION:.6f}')")
echo "setpts factor: $FACTOR"

FADE_OUT=$(python3 -c "print(f'{$TARGET-0.5:.2f}')")

# A silent stereo track ships with both cuts: some feed players treat a
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

# --- 1:1 for the LinkedIn feed ---------------------------------------------
# The 16:9 cut sits in a branded 1080x1080 card rather than being cropped —
# cropping would cut either the meeting gallery or the Momentum panel.
FRAME_PNG="$OUT_DIR/square-frame.png"
FRAME_JSON="$OUT_DIR/square-frame.json"
if [ -f "$FRAME_PNG" ] && [ -f "$FRAME_JSON" ]; then
  SQ_X=$(node -p "require('$FRAME_JSON').x")
  SQ_Y=$(node -p "require('$FRAME_JSON').y")
  SQ_W=$(node -p "require('$FRAME_JSON').width")
  SQ_H=$(node -p "require('$FRAME_JSON').height")
  echo "square window: ${SQ_W}x${SQ_H} at ${SQ_X},${SQ_Y}"
  ffmpeg -hide_banner -loglevel error -y \
    -i "$RAW" \
    -loop 1 -i "$FRAME_PNG" \
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
    -filter_complex "[0:v]trim=start=${START}:end=${END},setpts=(PTS-STARTPTS)*${FACTOR},\
fps=30,scale=${SQ_W}:${SQ_H}:flags=lanczos,\
fade=t=in:st=0:d=0.35,fade=t=out:st=${FADE_OUT}:d=0.5[v];\
[1:v][v]overlay=x=${SQ_X}:y=${SQ_Y}:shortest=1,fps=30,format=yuv420p[out]" \
    -map "[out]" -map 2:a \
    "${ENC[@]}" \
    "$DIST/zoom-momentum-demo-1x1.mp4"
  echo "wrote $DIST/zoom-momentum-demo-1x1.mp4"
else
  echo "skipping 1:1 (no $FRAME_PNG — run make-square-frame.mjs)"
fi

ls -la "$DIST"
