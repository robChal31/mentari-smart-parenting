#!/usr/bin/env bash
# Regenerate the PDF version of the explainer deck.
#
# The deck is a single self-contained HTML file — the PDF is optional. Two ways:
#
#   1) Manually (recommended for the user):
#      open deck/index.html → "Simpan sebagai PDF" → Landscape, margin None,
#      background graphics ON.
#
#   2) Headless (used to produce docs/explainer/mentari-smartparent-penjelasan.pdf):
#      needs a Chromium/Chrome binary.
#
#        CHROME=/usr/bin/google-chrome ./build-pdf.sh
#        ./build-pdf.sh                 # tries common browser paths
#
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
out="$here/mentari-smartparent-penjelasan.pdf"

candidates=(
  "${CHROME:-}"
  /usr/bin/google-chrome
  /usr/bin/chromium
  /usr/bin/chromium-browser
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
)
chrome=""
for c in "${candidates[@]}"; do
  [ -n "$c" ] && [ -x "$c" ] && chrome="$c" && break
done

if [ -z "$chrome" ]; then
  echo "No Chrome/Chromium binary found. Set CHROME=/path/to/chrome or use the browser's Print dialog." >&2
  exit 1
fi

echo "Using: $chrome"
"$chrome" \
  --headless \
  --disable-gpu \
  --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw \
  --virtual-time-budget=5000 \
  --print-to-pdf="$out" \
  "file://$here/deck/index.html"

echo "Wrote: $out"
