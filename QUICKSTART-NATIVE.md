# Quick Start Guide - React Native Android App

## For Quick Testing on Your Phone (5 minutes)

### Step 1: Install Expo Go on your phone
- Download **Expo Go** from Google Play Store
- Open the app

### Step 2: Setup the project
Run the setup script from the project root:

**On Linux/Mac:**
```bash
chmod +x setup-native.sh
./setup-native.sh
```

**On Windows:**
```bash
setup-native.bat
```

**Or manually:**
```bash
mkdir -p native/assets/cropImages
cp src/cropImages/*.jpg native/assets/cropImages/
```

### Step 3: Install dependencies
```bash
cd native
npm install
```

### Step 4: Start the development server
```bash
npm start
```

A QR code will appear in your terminal/browser.

### Step 5: Open on your phone
1. Open **Expo Go** app
2. Tap **Scan QR code**
3. Point camera at the QR code
4. Wait for app to load (first time may take 1-2 minutes)

## 🎉 That's it! The app should now be running on your phone.

## Quick Test Checklist

✅ Login/Signup works
✅ Crop recommendation form loads  
✅ Sensor page displays (even if no sensor connected)
✅ Profile page loads
✅ Can navigate between tabs

## Common Issues

**"Unable to resolve module"**
- Run: `cd native && rm -rf node_modules && npm install`

**"Network response timed out"**
- Make sure phone and computer are on same WiFi
- Try: `npm start -- --tunnel`

**Images not showing**
- Verify images copied: `ls native/assets/cropImages/`
- Should see 22 .jpg files

## Building APK

For actual APK file to install on phone:

```bash
cd native
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Download link will be provided after build completes (~10-15 minutes).

## Features to Test

1. **Authentication**
   - Sign up with new email
   - Login with existing credentials
   - Logout from profile

2. **Crop Recommendation**
   - Fill in all 7 parameters
   - Submit and see recommendations
   - Save prediction

3. **Sensor Page**
   - View sensor status
   - Try "Use for recommendation" button

4. **Profile**
   - Save profile information
   - View saved predictions
   - Delete predictions

## Need Help?

Check `native/README.md` for detailed documentation.

## Differences from Web

- Mobile-optimized UI with React Native Paper
- Touch-friendly navigation with bottom tabs
- Native Android look and feel
- Same functionality as web version
