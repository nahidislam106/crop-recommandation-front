# 🌾 Crop Recommendation System - Complete Project

This repository contains both **Web** and **Android (React Native)** versions of the Crop Recommendation System.

## 📱 Project Structure

```
crop-recommandation-front/
├── 🌐 Web Version (React)
│   ├── src/                    # Web app source files
│   ├── public/                 # Web public assets
│   ├── build/                  # Production build
│   └── package.json            # Web dependencies
│
└── 📱 Native Version (React Native + Expo)
    └── native/
        ├── src/                # Native app source files
        ├── assets/             # Images and assets
        ├── App.js              # Main app entry point
        ├── package.json        # Native dependencies
        └── README.md           # Native detailed docs
```

## 🚀 Quick Start

### Web Version (Original)

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

Access at: http://localhost:3000

### Android Version (NEW!)

```bash
# Run setup script
./setup-native.sh           # Linux/Mac
# OR
setup-native.bat            # Windows

# Install dependencies
cd native
npm install

# Start Expo server
npm start

# Scan QR code with Expo Go app on your phone
```

**See [QUICKSTART-NATIVE.md](QUICKSTART-NATIVE.md) for detailed mobile setup.**

## ✨ Features

Both versions include:

✅ **User Authentication** - Firebase email/password login  
✅ **Crop Recommendation** - AI-powered suggestions based on soil data  
✅ **Sensor Integration** - Real-time NPK sensor data from ESP8266  
✅ **Profile Management** - Save user info and predictions  
✅ **Bengali Language** - Complete Bengali UI  
✅ **Prediction History** - Save and view past recommendations  

## 🛠️ Tech Stack

### Web Version
- React 19
- React Bootstrap
- React Router
- Firebase Auth
- Local Storage

### Android Version
- React Native 0.74
- Expo 51
- React Navigation
- React Native Paper
- Firebase Auth
- AsyncStorage

## 📚 Documentation

- **Web**: See this README and inline documentation
- **Native**: See [native/README.md](native/README.md)
- **Quick Start Native**: See [QUICKSTART-NATIVE.md](QUICKSTART-NATIVE.md)

## 📱 Testing on Phone

1. Install **Expo Go** from Play Store
2. Run `npm start` in native folder
3. Scan QR code with Expo Go
4. App loads on your phone

## 🚢 Building Android APK

```bash
cd native
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## 🔧 Setup Scripts

- `setup-native.sh` - Linux/Mac setup script
- `setup-native.bat` - Windows setup script

---

Made with 💚 for farmers in Bangladesh
