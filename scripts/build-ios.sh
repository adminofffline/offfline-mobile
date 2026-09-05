#!/bin/bash
set -e

# ==============================================================================
# OFFFLINE MOBILE - IOS BUILD SCRIPT
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
IOS_DIR="${MOBILE_DIR}/ios"
OUTPUT_DIR="${MOBILE_DIR}/build-outputs/ios"

mkdir -p "${OUTPUT_DIR}"

MODE="${1:---sim}"

echo "============================================================"
echo "  OFFFLINE.IN - iOS App Builder"
echo "  Mode: ${MODE}"
echo "============================================================"

if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: iOS builds can only be performed on macOS."
    exit 1
fi

cd "${IOS_DIR}"

if [ "${MODE}" == "--archive" ] || [ "${MODE}" == "--release" ]; then
    echo "🔨 Creating iOS Release Archive..."
    ARCHIVE_PATH="${OUTPUT_DIR}/WaterAds.xcarchive"
    rm -rf "${ARCHIVE_PATH}"
    
    xcodebuild -workspace WaterAds.xcworkspace \
        -scheme WaterAds \
        -configuration Release \
        -destination 'generic/platform=iOS' \
        -archivePath "${ARCHIVE_PATH}" \
        archive \
        CODE_SIGNING_ALLOWED=NO \
        CODE_SIGNING_REQUIRED=NO
        
    if [ -d "${ARCHIVE_PATH}" ]; then
        ARCH_SIZE=$(du -sh "${ARCHIVE_PATH}" | cut -f1)
        echo "✅ iOS Archive created successfully!"
        echo "📍 Path: ${ARCHIVE_PATH} (${ARCH_SIZE})"
    else
        echo "❌ Error: Could not find generated archive at ${ARCHIVE_PATH}"
        exit 1
    fi

else
    echo "🔨 Building iOS Simulator App Bundle..."
    xcodebuild -workspace WaterAds.xcworkspace \
        -scheme WaterAds \
        -configuration Debug \
        -sdk iphonesimulator \
        -destination 'generic/platform=iOS Simulator' \
        build \
        CODE_SIGNING_ALLOWED=NO \
        CODE_SIGNING_REQUIRED=NO

    # Locate generated .app in DerivedData
    DERIVED_DATA_BUILD=$(xcodebuild -workspace WaterAds.xcworkspace -scheme WaterAds -configuration Debug -sdk iphonesimulator -showBuildSettings | grep " BUILD_DIR =" | awk '{print $3}')
    APP_BUNDLE="${DERIVED_DATA_BUILD}/Debug-iphonesimulator/Offfline.app"
    
    if [ -d "${APP_BUNDLE}" ]; then
        cp -R "${APP_BUNDLE}" "${OUTPUT_DIR}/Offfline.app"
        APP_SIZE=$(du -sh "${OUTPUT_DIR}/Offfline.app" | cut -f1)
        echo "✅ iOS Simulator App built successfully!"
        echo "📍 Path: ${OUTPUT_DIR}/Offfline.app (${APP_SIZE})"
    else
        echo "⚠️ Note: Built with success, check DerivedData."
    fi
fi

echo "============================================================"
echo "  iOS Build Complete 🎉"
echo "============================================================"
