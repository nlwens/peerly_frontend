# Peerly Prototype - Client App

A React Native/Expo app for the Peerly peer learning platform prototype. This app allows users to register, log in, browse other users, and manage study sessions.

## Prerequisites

Before running the app, ensure you have the following installed:

- **Node.js** (v18 or later): [Download here](https://nodejs.org/)
- **Expo CLI**: Install globally with `npm install -g @expo/cli`
- **Android Studio** (for emulator): [Download here](https://developer.android.com/studio)
  - Set up an Android Virtual Device (AVD) in Android Studio
- **Expo Go App**: Install on your Android device or emulator from the Google Play Store
- **Git** (optional, for cloning): [Download here](https://git-scm.com/)

## Setup Instructions

1. **Extract the Zip File**: Unzip the submitted `HD-ReactNative-Prototype` file to a directory on your machine.

2. **Install Dependencies**:
   Open a terminal/command prompt in the extracted folder, navigate to `apps/client` and run:

   ```
   npm install
   ```

   This may take a few minutes.

3. **Start the Development Server**:
   - Make sure to be in `apps/client` and run:

   ```
   npx expo start
   ```

   - The Expo DevTools will open in your browser.
   - You'll see a QR code in the terminal and browser.

## Running the App

### Option 1: Android Emulator

- Ensure Android Studio is running and an emulator is started.
- In the terminal, press a to open the emulator, the app will build and launch in the emulator.

### Option 2: Physical Android Device (Recommended)

- Connect your phone and computer to the **same Wi-Fi network** (important for connection).
- In the terminal, press s to switch to Expo go
- Open the Expo Go app on your phone.
- Scan the QR code displayed in the terminal.
- Click on Expo Go.
- The app will load on your device.

### Option 3: Browser

- After running npx expo start in the project terminal, there should be a line "Web is waiting on http://localhost:<port_number>"

## Credentials

| Email             | Password    |
| ----------------- | ----------- |
| alice@example.com | password123 |
| bob@example.com   | password123 |

Other credentials can be found in `apps\client\scripts\seedUsers.ts`

## Common Issues & Fixes

### 1. "Port xxxx is already in use"

- **Cause**: Another process is using the port.
- **Fix**: Kill the process or change port:
  ```
  npx expo start --port <port_number>
  ```
  Or find and kill the process using the port.

### 2. QR Code Unreachable on Phone

- **Cause**: Phone and computer not on the same network, or firewall blocking.
- **Fix**:
  - Ensure same Wi-Fi.
  - Disable Windows Firewall temporarily (Settings > Privacy & security > Windows Security > Firewall & network protection > Private network > Turn off).
  - Use tunnel mode: `npx expo start --tunnel` (requires Expo account).
  - Test by opening the Expo URL (e.g., http://192.168.x.x:8081) in your computer's browser.

### 3. Build Fails (e.g., react-native-reanimated errors)

- **Cause**: NDK or dependency issues.
- **Fix**:
  - Clean and rebuild: `npx expo run:android --no-build-cache`
  - Update dependencies: `npx expo install --fix`
  - Check Android Studio NDK version (use 25 or 26).

### 4. App Data Issues (e.g., duplicate users, errors)

- **Cause**: Stale AsyncStorage data.
- **Fix**:
  - Clear app data in emulator: Android Studio > Device Manager > Wipe Data.
  - Or via ADB: `adb shell pm clear com.anonymous.client`
  - Restart the app to reseed data.

### 5. Emulator Not Starting

- **Fix**: In Android Studio, ensure AVD is created and HAXM/Virtualization is enabled in BIOS.

### 6. General Troubleshooting

- Restart Expo: Stop the server (Ctrl+C) and run `npx expo start` again.
- Clear Expo cache: `npx expo r -c`
- Check logs in terminal for errors.

## Notes

- This is a prototype with local data only—no backend integration.
- For production, additional setup (e.g., backend server) would be required.
- If issues persist, ensure all prerequisites are met and try on a different machine/network.

For more help, refer to [Expo Documentation](https://docs.expo.dev/) or the project code.

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
