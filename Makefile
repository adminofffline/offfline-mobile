# ==============================================================================
# OFFFLINE.IN - MOBILE DIRECTORY MAKEFILE
# ==============================================================================

.PHONY: help apk apk-debug aab ios ios-sim ios-archive all build-all clean check

SHELL := /bin/bash
OUTPUT_DIR := $(CURDIR)/build-outputs

help:
	@echo ""
	@echo "  ================================================================"
	@echo "    OFFFLINE.IN - MOBILE BUILD SYSTEM"
	@echo "  ================================================================"
	@echo ""
	@echo "  make apk            Build Android Release APK"
	@echo "  make apk-debug      Build Android Debug APK"
	@echo "  make aab            Build Android App Bundle (.aab)"
	@echo "  make ios            Build iOS Simulator .app bundle"
	@echo "  make ios-archive    Build iOS Release .xcarchive bundle"
	@echo "  make all            Build both Android Release APK and iOS app"
	@echo "  make check          Run TypeScript validation"
	@echo "  make clean          Clean build outputs"
	@echo ""

apk:
	@bash scripts/build-apk.sh --release

apk-debug:
	@bash scripts/build-apk.sh --debug

aab:
	@cd android && ./gradlew bundleRelease
	@mkdir -p $(OUTPUT_DIR)/bundle
	@cp android/app/build/outputs/bundle/release/*.aab $(OUTPUT_DIR)/bundle/ 2>/dev/null || true
	@echo "✅ Android AAB built in $(OUTPUT_DIR)/bundle/"

ios:
	@bash scripts/build-ios.sh --sim

ios-sim: ios

ios-archive:
	@bash scripts/build-ios.sh --archive

all:
	@bash scripts/build-all.sh

build-all: all

check:
	@npx tsc --noEmit
	@echo "✅ TypeScript check passed!"

clean:
	@cd android && ./gradlew clean
	@rm -rf $(OUTPUT_DIR)
	@rm -rf ios/build
	@echo "✅ Clean complete!"
