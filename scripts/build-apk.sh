#!/bin/bash
set -e

# ==============================================================================
# OFFFLINE MOBILE - ANDROID APK BUILD SCRIPT
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ANDROID_DIR="${MOBILE_DIR}/android"
OUTPUT_DIR="${MOBILE_DIR}/build-outputs/apk"

mkdir -p "${OUTPUT_DIR}"

MODE="${1:---release}"

echo "============================================================"
echo "  OFFFLINE.IN - Android APK Builder"
echo "  Mode: ${MODE}"
echo "============================================================"

cd "${ANDROID_DIR}"

if [ "${MODE}" == "--debug" ]; then
    echo "🔨 Building Android Debug APK..."
    ./gradlew assembleDebug
    
    SRC_APK="${ANDROID_DIR}/app/build/outputs/apk/debug/app-debug.apk"
    DEST_APK="${OUTPUT_DIR}/offfline-debug.apk"
    
    if [ -f "${SRC_APK}" ]; then
        cp "${SRC_APK}" "${DEST_APK}"
        APK_SIZE=$(du -h "${DEST_APK}" | cut -f1)
        echo "✅ Debug APK built successfully!"
        echo "📍 Path: ${DEST_APK} (${APK_SIZE})"
    else
        echo "❌ Error: Could not find generated APK at ${SRC_APK}"
        exit 1
    fi

elif [ "${MODE}" == "--all" ]; then
    echo "🔨 Building Android Debug & Release APKs..."
    ./gradlew assembleDebug assembleRelease
    
    SRC_DEBUG="${ANDROID_DIR}/app/build/outputs/apk/debug/app-debug.apk"
    DEST_DEBUG="${OUTPUT_DIR}/offfline-debug.apk"
    SRC_RELEASE="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"
    DEST_RELEASE="${OUTPUT_DIR}/offfline-release.apk"
    
    if [ -f "${SRC_DEBUG}" ]; then
        cp "${SRC_DEBUG}" "${DEST_DEBUG}"
        echo "✅ Debug APK: ${DEST_DEBUG} ($(du -h "${DEST_DEBUG}" | cut -f1))"
    fi
    if [ -f "${SRC_RELEASE}" ]; then
        cp "${SRC_RELEASE}" "${DEST_RELEASE}"
        echo "✅ Release APK: ${DEST_RELEASE} ($(du -h "${DEST_RELEASE}" | cut -f1))"
    fi

else
    echo "🔨 Building Android Release APK..."
    ./gradlew assembleRelease
    
    SRC_APK="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"
    DEST_APK="${OUTPUT_DIR}/offfline-release.apk"
    
    if [ -f "${SRC_APK}" ]; then
        cp "${SRC_APK}" "${DEST_APK}"
        APK_SIZE=$(du -h "${DEST_APK}" | cut -f1)
        echo "✅ Release APK built successfully!"
        echo "📍 Path: ${DEST_APK} (${APK_SIZE})"
    else
        echo "❌ Error: Could not find generated APK at ${SRC_APK}"
        exit 1
    fi
fi

echo "============================================================"
echo "  Android APK Build Complete 🎉"
echo "============================================================"
