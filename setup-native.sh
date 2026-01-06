#!/bin/bash

# Setup script for React Native Crop Recommendation App
# This script copies crop images from web version to native version

echo "🌾 Setting up React Native Crop Recommendation App..."

# Create assets directory
echo "📁 Creating assets directory..."
mkdir -p native/assets/cropImages

# Check if source images exist
if [ ! -d "src/cropImages" ]; then
    echo "❌ Error: src/cropImages directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Copy crop images
echo "📸 Copying crop images..."
cp src/cropImages/*.jpg native/assets/cropImages/

# Count copied files
IMAGE_COUNT=$(ls -1 native/assets/cropImages/*.jpg 2>/dev/null | wc -l)

if [ $IMAGE_COUNT -eq 0 ]; then
    echo "❌ Error: No images were copied!"
    exit 1
fi

echo "✅ Successfully copied $IMAGE_COUNT crop images!"

# Create placeholder icon files if they don't exist
if [ ! -f "native/assets/icon.png" ]; then
    echo "ℹ️  Note: You need to add icon.png (1024x1024) to native/assets/"
fi

if [ ! -f "native/assets/splash.png" ]; then
    echo "ℹ️  Note: You need to add splash.png to native/assets/"
fi

echo ""
echo "✨ Setup complete! Next steps:"
echo "1. cd native"
echo "2. npm install"
echo "3. npm start"
echo "4. Scan QR code with Expo Go app on your phone"
echo ""
echo "📖 See native/README.md for detailed instructions"
