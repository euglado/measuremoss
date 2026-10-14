#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
command -v node >/dev/null || { echo 'Install Node.js 24 LTS / Node.js 24 LTS kurun'; exit 1; }
npm ci --ignore-scripts
npm run build
npm run setup
read -r -p 'Install using the link above, then Enter / Yukaridaki baglantiyla ekleyin, sonra Enter: ' answer
npm run register
echo 'Ready: ./start.sh / Hazir: ./start.sh'
