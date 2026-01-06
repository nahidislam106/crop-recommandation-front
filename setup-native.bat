@echo off
REM Setup script for React Native Crop Recommendation App
REM This script copies crop images from web version to native version

echo Setting up React Native Crop Recommendation App...

REM Create assets directory
echo Creating assets directory...
if not exist "native\assets\cropImages" mkdir native\assets\cropImages

REM Check if source images exist
if not exist "src\cropImages" (
    echo Error: src\cropImages directory not found!
    echo Please run this script from the project root directory.
    exit /b 1
)

REM Copy crop images
echo Copying crop images...
copy src\cropImages\*.jpg native\assets\cropImages\ >nul

echo Successfully copied crop images!

REM Check for icon files
if not exist "native\assets\icon.png" (
    echo Note: You need to add icon.png (1024x1024) to native\assets\
)

if not exist "native\assets\splash.png" (
    echo Note: You need to add splash.png to native\assets\
)

echo.
echo Setup complete! Next steps:
echo 1. cd native
echo 2. npm install
echo 3. npm start
echo 4. Scan QR code with Expo Go app on your phone
echo.
echo See native\README.md for detailed instructions
pause
