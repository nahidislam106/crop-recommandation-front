#!/bin/bash

# Complete setup and run script for React Native app

echo "🌾 Crop Recommendation System - React Native Setup & Run"
echo "=========================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "src/cropImages" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Copy images
echo "📸 Step 1: Copying crop images..."
mkdir -p native/assets/cropImages
cp src/cropImages/*.jpg native/assets/cropImages/
IMAGE_COUNT=$(ls -1 native/assets/cropImages/*.jpg 2>/dev/null | wc -l)
echo "✅ Copied $IMAGE_COUNT images"
echo ""

# Step 2: Check if node_modules exists
if [ ! -d "native/node_modules" ]; then
    echo "📦 Step 2: Installing dependencies..."
    cd native
    npm install
    cd ..
    echo "✅ Dependencies installed"
else
    echo "✅ Step 2: Dependencies already installed (skipping)"
fi
echo ""

# Step 3: Start the app
echo "🚀 Step 3: Starting Expo development server..."
echo ""
echo "📱 Instructions:"
echo "1. Open Expo Go app on your phone"
echo "2. Scan the QR code that will appear"
echo "3. Wait for app to load"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd native
npm start
