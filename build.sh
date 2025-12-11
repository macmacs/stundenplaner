#!/usr/bin/env bash
set -euo pipefail

SRC="web"
OUT="dist"

rm -rf "$OUT"
mkdir -p "$OUT"

echo "Minifying JS..."
npx --yes terser "$SRC/app.js" \
    --compress --mangle \
    --output "$OUT/app.js"

echo "Minifying CSS..."
npx --yes clean-css-cli "$SRC/styles.css" \
    --output "$OUT/styles.css"

echo "Minifying HTML..."
npx --yes html-minifier-terser "$SRC/index.html" \
    --collapse-whitespace \
    --remove-comments \
    --minify-css true \
    --minify-js true \
    --output "$OUT/index.html"

echo "Done. Output in $OUT/"
