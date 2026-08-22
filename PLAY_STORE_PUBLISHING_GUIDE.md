# 📱 Google Play Store & Android Installation Guide

This guide explains how **QuickCart** can be installed directly on any Android device and published to the **Google Play Store**.

---

## 🚀 Option 1: Instant Mobile Installation (PWA / No Store Needed)

QuickCart is fully configured as a **Progressive Web App (PWA)** with a Web App Manifest and Service Worker. Anyone on an Android or iOS phone can install it in seconds:

1. Open **Chrome** or your mobile browser.
2. Navigate to your QuickCart web URL (e.g., `https://your-domain.com` or local network IP `http://<YOUR_LOCAL_IP>:5173`).
3. Tap the **"Add QuickCart to Home screen"** banner or tap browser menu (⋮) ➔ **"Install app"**.
4. The native app icon appears on your home screen and launches standalone in full-screen mode like a native app.

---

## 📦 Option 2: Native Android App (Capacitor / Android Studio)

The project includes a complete native Android Studio project in [`frontend/android`](file:///c:/Users/HP/Desktop/new/frontend/android).

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed on your computer.
- Android SDK Platform 34 and Android Build-Tools.

---

### Step-by-Step Build Instructions

#### 1. Synchronize Web Assets with Android Project
Whenever you make updates to the frontend, run:
```bash
cd frontend
npm run build
npx cap sync android
```

#### 2. Open the Project in Android Studio
```bash
npx cap open android
```
*(Or open the `frontend/android` folder directly in Android Studio)*

#### 3. Build Debug APK for Direct Sideloading / Testing
In Android Studio:
- Select **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
- Or run in terminal:
  ```bash
  cd frontend/android
  ./gradlew assembleDebug
  ```
- Your installable `.apk` file will be generated at:
  `frontend/android/app/build/outputs/apk/debug/app-debug.apk`
- Transfer this file to any Android phone and tap to install!

---

## 🏪 Option 3: Publishing to Google Play Store Console

To make QuickCart publicly downloadable from the Google Play Store for everyone worldwide:

### Step 1: Create a Google Play Developer Account
1. Go to the [Google Play Console](https://play.google.com/console).
2. Sign in with your Google account and pay the one-time $25 registration fee.
3. Complete your developer profile details.

### Step 2: Generate a Signed Android App Bundle (.aab)
Google Play Store requires an **Android App Bundle (.aab)** format:
1. In Android Studio, go to **Build** ➔ **Generate Signed Bundle / APK**.
2. Select **Android App Bundle** and click **Next**.
3. Create a new Keystore (or choose an existing one):
   - Key store path: e.g. `quickcart-release-key.jks`
   - Password: Enter a secure password
   - Key alias: `quickcart`
4. Select **Release** build variant and click **Finish**.
5. The signed bundle will be generated in `frontend/android/app/release/app-release.aab`.

### Step 3: Create the Store Listing on Play Console
In the Google Play Console:
1. Click **Create app**:
   - **App name**: `QuickCart: 10-Min Grocery Delivery`
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
2. Fill out **Main Store Listing**:
   - **Short description** (up to 80 characters):
     *Instant 10-15 minute grocery & daily essentials delivery at your doorstep.*
   - **Full description** (up to 4000 characters):
     *QuickCart delivers 5,000+ groceries, fresh fruits, vegetables, dairy, snacks, and household essentials in 10-15 minutes with live GPS radar tracking.*
   - **App icon**: 512 x 512 px PNG
   - **Feature graphic**: 1024 x 500 px PNG
   - **Phone Screenshots**: Minimum 2 screenshots (1080 x 1920 px or 1080 x 2400 px).
3. Set up **Content Rating**, **Privacy Policy**, and **Target Audience** (13+ / General).

### Step 4: Upload & Release
1. Go to **Production** (or **Internal Testing**) ➔ **Create new release**.
2. Upload the `app-release.aab` file.
3. Add Release notes: `Initial release of QuickCart with instant delivery catalog, live GPS tracking, and promo discounts.`
4. Click **Review and rollout release** ➔ **Start rollout to Production**.

Once Google reviews the app (typically 1–3 business days), your app will be live on the Google Play Store!
