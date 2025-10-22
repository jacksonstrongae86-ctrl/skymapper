#!/bin/bash

# Skymapper Landing Pages - Quick Setup Script
# This script helps set up both variants with assets and dependencies

echo "🚀 Skymapper Landing Pages Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "variant-a" ] || [ ! -d "variant-b" ]; then
    echo "❌ Error: Please run this script from the standalone-landing-pages directory"
    exit 1
fi

# Function to copy assets
copy_assets() {
    echo "📦 Copying assets from main project..."

    # Check if source files exist
    if [ ! -f "../vfr/public/logo.png" ]; then
        echo "⚠️  Warning: logo.png not found in ../vfr/public/"
        echo "   You'll need to add logo.png manually to both variant public folders"
    else
        cp ../vfr/public/logo.png variant-a/public/
        cp ../vfr/public/logo.png variant-b/public/
        echo "✓ Copied logo.png to both variants"
    fi

    if [ ! -f "../vfr/public/videos/tutorial.mp4" ]; then
        echo "⚠️  Warning: tutorial.mp4 not found in ../vfr/public/videos/"
        echo "   You'll need to add tutorial.mp4 manually to both variant public/videos folders"
    else
        cp ../vfr/public/videos/tutorial.mp4 variant-a/public/videos/
        cp ../vfr/public/videos/tutorial.mp4 variant-b/public/videos/
        echo "✓ Copied tutorial.mp4 to both variants"
    fi

    echo ""
}

# Function to setup environment files
setup_env() {
    echo "⚙️  Setting up environment files..."

    # Get Skymapper URL from user
    read -p "Enter your Skymapper URL (e.g., https://skymapper.com): " SKYMAPPER_URL

    # Create .env.local for variant A
    cat > variant-a/.env.local << EOF
# Skymapper Landing Page - Variant A Configuration
NEXT_PUBLIC_SKYMAPPER_URL=${SKYMAPPER_URL}
NEXT_PUBLIC_VARIANT=A
EOF
    echo "✓ Created variant-a/.env.local"

    # Create .env.local for variant B
    cat > variant-b/.env.local << EOF
# Skymapper Landing Page - Variant B Configuration
NEXT_PUBLIC_SKYMAPPER_URL=${SKYMAPPER_URL}
NEXT_PUBLIC_VARIANT=B
EOF
    echo "✓ Created variant-b/.env.local"
    echo ""
}

# Function to install dependencies
install_deps() {
    echo "📥 Installing dependencies..."
    echo ""

    echo "Installing variant A dependencies..."
    cd variant-a
    npm install
    cd ..
    echo "✓ Variant A dependencies installed"
    echo ""

    echo "Installing variant B dependencies..."
    cd variant-b
    npm install
    cd ..
    echo "✓ Variant B dependencies installed"
    echo ""
}

# Main setup flow
echo "This script will:"
echo "  1. Copy assets (logo, video) from main project"
echo "  2. Set up .env.local files for both variants"
echo "  3. Install npm dependencies"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
copy_assets
setup_env
install_deps

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review the .env.local files in both variants"
echo "  2. Test locally:"
echo "     - Variant A: cd variant-a && npm run dev (port 3001)"
echo "     - Variant B: cd variant-b && npm run dev (port 3002)"
echo "  3. When ready, deploy both variants (see DEPLOYMENT.md)"
echo ""
echo "📚 Documentation:"
echo "  - README.md - Overview and usage"
echo "  - DEPLOYMENT.md - Deployment guide"
echo ""
