Expand-Archive -Path "$PSScriptRoot\IronFront-ZeroHour-PWA-v13-fixed.zip" -DestinationPath . -Force
git add index.html IronFront-ZeroHour.html sw.js manifest.json
git commit -m "Deploy Iron Front: Zero Hour v13 (audited)"
git push origin main
