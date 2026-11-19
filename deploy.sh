#!/usr/bin/env bash
set -e
unzip -o "$(dirname "$0")/IronFront-ZeroHour-PWA-v13-fixed.zip" -d .
git add index.html IronFront-ZeroHour.html sw.js manifest.json
git commit -m "Deploy Iron Front: Zero Hour v13 (audited)"
git push origin main
