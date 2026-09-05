#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================================"
echo "  OFFFLINE.IN - Full Multi-Platform Build Pipeline"
echo "============================================================"

# 1. Android APK Build
"${SCRIPT_DIR}/build-apk.sh" --release

# 2. iOS App Build
"${SCRIPT_DIR}/build-ios.sh" --sim

echo "============================================================"
echo "  All Builds Finished Successfully!"
echo "  Artifacts available in mobile/build-outputs/"
echo "============================================================"
