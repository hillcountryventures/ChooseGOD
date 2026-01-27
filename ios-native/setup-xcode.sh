#!/bin/bash

# ChooseGOD iOS Native - Xcode Project Setup Script
# This script prepares the folder structure for Xcode

set -e

echo "🍎 ChooseGOD iOS Native Setup"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR/ChooseGODApp"

echo -e "${BLUE}📁 Creating Xcode project directory structure...${NC}"

# Create the main project directory
mkdir -p "$PROJECT_DIR"

# Copy all Swift files maintaining structure
echo -e "${BLUE}📋 Copying source files...${NC}"

# App files
mkdir -p "$PROJECT_DIR/App"
cp "$SCRIPT_DIR/App/"*.swift "$PROJECT_DIR/App/" 2>/dev/null || true

# Core files
mkdir -p "$PROJECT_DIR/Core/Models"
mkdir -p "$PROJECT_DIR/Core/Services/Protocols"
mkdir -p "$PROJECT_DIR/Core/Services/Supabase"
mkdir -p "$PROJECT_DIR/Core/Services/Mocks"
mkdir -p "$PROJECT_DIR/Core/Theme"
mkdir -p "$PROJECT_DIR/Core/Utilities"
mkdir -p "$PROJECT_DIR/Core/Extensions"

cp "$SCRIPT_DIR/Core/Models/"*.swift "$PROJECT_DIR/Core/Models/" 2>/dev/null || true
cp "$SCRIPT_DIR/Core/Services/Protocols/"*.swift "$PROJECT_DIR/Core/Services/Protocols/" 2>/dev/null || true
cp "$SCRIPT_DIR/Core/Services/Supabase/"*.swift "$PROJECT_DIR/Core/Services/Supabase/" 2>/dev/null || true
cp "$SCRIPT_DIR/Core/Services/Mocks/"*.swift "$PROJECT_DIR/Core/Services/Mocks/" 2>/dev/null || true
cp "$SCRIPT_DIR/Core/Theme/"*.swift "$PROJECT_DIR/Core/Theme/" 2>/dev/null || true
cp "$SCRIPT_DIR/Core/Utilities/"*.swift "$PROJECT_DIR/Core/Utilities/" 2>/dev/null || true

# Features
for feature in Auth Home Bible Chat Journey Prayers Devotionals Settings Onboarding; do
    mkdir -p "$PROJECT_DIR/Features/$feature/Views"
    mkdir -p "$PROJECT_DIR/Features/$feature/ViewModels"
    
    # Copy view files
    if [ -d "$SCRIPT_DIR/Features/$feature/Views" ]; then
        cp "$SCRIPT_DIR/Features/$feature/Views/"*.swift "$PROJECT_DIR/Features/$feature/Views/" 2>/dev/null || true
    fi
    
    # Copy viewmodel files
    if [ -d "$SCRIPT_DIR/Features/$feature/ViewModels" ]; then
        cp "$SCRIPT_DIR/Features/$feature/ViewModels/"*.swift "$PROJECT_DIR/Features/$feature/ViewModels/" 2>/dev/null || true
    fi
    
    # Copy coordinator files
    if [ -f "$SCRIPT_DIR/Features/$feature/${feature}Coordinator.swift" ]; then
        cp "$SCRIPT_DIR/Features/$feature/${feature}Coordinator.swift" "$PROJECT_DIR/Features/$feature/" 2>/dev/null || true
    fi
    
    # Copy any other swift files in feature root
    cp "$SCRIPT_DIR/Features/$feature/"*.swift "$PROJECT_DIR/Features/$feature/" 2>/dev/null || true
done

# Resources
mkdir -p "$PROJECT_DIR/Resources"
cp "$SCRIPT_DIR/Resources/"* "$PROJECT_DIR/Resources/" 2>/dev/null || true

# Create Assets.xcassets structure
mkdir -p "$PROJECT_DIR/Resources/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$PROJECT_DIR/Resources/Assets.xcassets/AccentColor.colorset"
mkdir -p "$PROJECT_DIR/Resources/Assets.xcassets/LaunchBackground.colorset"

# Create Contents.json for Assets
cat > "$PROJECT_DIR/Resources/Assets.xcassets/Contents.json" << 'EOF'
{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

# Create AccentColor (Purple)
cat > "$PROJECT_DIR/Resources/Assets.xcassets/AccentColor.colorset/Contents.json" << 'EOF'
{
  "colors" : [
    {
      "color" : {
        "color-space" : "srgb",
        "components" : {
          "alpha" : "1.000",
          "blue" : "0.965",
          "green" : "0.361",
          "red" : "0.545"
        }
      },
      "idiom" : "universal"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

# Create LaunchBackground (Dark)
cat > "$PROJECT_DIR/Resources/Assets.xcassets/LaunchBackground.colorset/Contents.json" << 'EOF'
{
  "colors" : [
    {
      "color" : {
        "color-space" : "srgb",
        "components" : {
          "alpha" : "1.000",
          "blue" : "0.059",
          "green" : "0.059",
          "red" : "0.059"
        }
      },
      "idiom" : "universal"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

# Create AppIcon placeholder
cat > "$PROJECT_DIR/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json" << 'EOF'
{
  "images" : [
    {
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo -e "${GREEN}✅ Project structure created at: $PROJECT_DIR${NC}"
echo ""
echo -e "${YELLOW}📱 Next Steps:${NC}"
echo ""
echo "1. Open Xcode"
echo "2. File → New → Project"
echo "3. Choose: iOS → App"
echo "4. Configure:"
echo "   - Product Name: ChooseGOD"
echo "   - Team: Your Team"
echo "   - Organization Identifier: com.choosegod"
echo "   - Interface: SwiftUI"
echo "   - Language: Swift"
echo "   - Storage: None"
echo ""
echo "5. Save to: $PROJECT_DIR (replace the default files)"
echo ""
echo "6. Delete the auto-generated ContentView.swift and ChooseGODApp.swift"
echo ""
echo "7. Add existing files to project:"
echo "   - Right-click on ChooseGOD in navigator"
echo "   - Add Files to \"ChooseGOD\"..."
echo "   - Select all folders: App, Core, Features, Resources"
echo "   - Check \"Copy items if needed\" = OFF"
echo "   - Check \"Create groups\""
echo ""
echo "8. Add Swift Packages (File → Add Package Dependencies):"
echo "   - https://github.com/supabase-community/supabase-swift (2.x)"
echo "   - https://github.com/RevenueCat/purchases-ios (4.x)"
echo ""
echo "9. Configure Signing & Capabilities:"
echo "   - Sign in with Apple"
echo "   - Push Notifications"
echo "   - Keychain Sharing"
echo "   - App Groups (group.com.choosegod.app)"
echo ""
echo "10. Update Info.plist with your Supabase credentials"
echo ""
echo -e "${GREEN}🚀 Then build and run!${NC}"
