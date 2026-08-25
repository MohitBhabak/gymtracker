# GymLog 🏋️‍♂️

A clean, intuitive, privacy-first application designed for tracking workout sessions, bodyweight progression, bench press PRs, and progressive overload targets. Built with vanilla HTML/JS, zero build step required, and runs entirely in the browser.

GymLog is available in two dedicated versions:
1. 🖥️ **Desktop & Web App (`index.html`):** Full multi-pane dashboard with advanced split management, instant keyboard commands (`⌘K`), Gmail export, and full charts.
2. 📱 **Mobile App (`mobile/`):** Mobile-first app designed specifically for iPhone & Android with bottom navigation, touch bottom-sheet drawers, offline PWA support, haptic feedback, and home-screen installability.

---

## ✨ Features

- 📅 **Interactive Workout Calendar:** Log workout types (Push, Pull, Legs, Upper, Lower, Abs, Arms & Delts, Rest), duration, effort intensity (RPE), time of day, and track monthly consistency streaks.
- 📋 **Smart Quick Paste & Note Parser:** Copy raw workout notes from Apple Notes, Google Keep, Notion, or text messages and paste them directly into GymLog. Automatically detects exercises, weights, reps, decimal values, and bodyweight sets with zero API keys or external tokens.
- 🔍 **Instant Search & Quick Presets (`Ctrl+K` / `⌘K`):** Global command palette and search bar for instant non-AI lookups. Features fast preset calculators for all-time Exercise PRs (with estimated 1RM and lifetime volume), monthly workout volume/breakdown tallies, workout split filters, and notes search.
- ⚡ **Rapid Set Logging:** High-speed set and rep logging with keyboard tabbing (desktop) and quick steppers / touch buttons (mobile).
- 📊 **Progress Tracker & Analytics:** Inspect exercise performance history with interactive Chart.js graphs (Estimated 1RM, Max Weight, Total Reps, and Volume).
- ⚖️ **Bodyweight Tracker with Trendline:** Log bodyweight entries over time with an automated linear regression trendline overlay to visualize long-term weight trends through daily fluctuations.
- 🏆 **Bench PR Tracker:** Dedicated Bench Press PR tracker featuring a progress graph and historical performance table.
- 🚀 **Progressive Overload Assistant:** Select planned exercises to view your all-time best scores to beat, with direct one-click export to Gmail.
- 🌙 **Dark-Mode First Design:** Sleek gym-aesthetic UI featuring `Cabinet Grotesk` and `Satoshi` typography, smooth micro-interactions, responsive mobile layout, and light/dark mode toggle.
- ☁️ **Google Drive Cross-Device Sync:** Sync workout logs, bodyweight entries, and PRs seamlessly across phones, tablets, and desktops using your personal Google account (`appDataFolder`).
- 💾 **Local Data Ownership:** All data persists locally in `localStorage` with full JSON backup export and import capabilities. No external backend server required.

---

## 📱 Mobile App Version (`mobile/`)

The mobile version in `mobile/` is built specifically for mobile screens (iOS & Android):
- **Native Bottom Navigation Bar:** Quick access to Calendar, Progress, Weight, Bench PR, and Settings.
- **100% Offline Capability:** Works underground in the gym via Service Worker (`mobile/sw.js`).
- **Tactile Haptic Feedback:** Vibrations on set creation, workout saves, and tab switches.
- **Touch-Friendly Bottom Sheets:** Fluid swipe-to-dismiss sheet drawers for logging sets and notes.
- **Safe Area Insets:** Optimized for iPhone Dynamic Island, notches, and home indicator gestures.

### 📲 How to Install on Phone Home Screen:
- **iPhone / iPad (Safari):** Open `mobile/index.html` (or deployed URL `/mobile/`), tap the **Share** button in Safari, scroll down and tap **Add to Home Screen**.
- **Android (Chrome):** Open `mobile/index.html` (or deployed URL `/mobile/`), tap the **three dots (⋮)** and tap **Install App** or **Add to Home Screen**.

### 🛠️ Optional: Native App Build (Capacitor for Xcode & Android Studio):
To package the mobile app into native `.ipa` (iOS) or `.apk` (Android) binaries:
```bash
cd mobile
npm install
npx cap add ios      # Creates native iOS Xcode project
npx cap add android  # Creates native Android Studio project
npx cap sync
```

---

## ☁️ Google Drive Cross-Device Sync Setup

GymLog uses Google's official Identity Services API to sync data directly to your personal Google Drive account in a hidden, secure `appDataFolder`.

1. Click **Drive Sync** (or open **Settings & Backup**).
2. Click **Connect Google Drive Sync** and authorize with your Google account.
3. Your data will now automatically sync across any browser or device where you sign into GymLog!

*Note for custom deployments:* If hosting on a custom domain, you can optionally paste your own Google OAuth 2.0 Client ID in **Settings** (created via Google Cloud Console under APIs & Services > Credentials).

---

## 🚀 Getting Started

Since **GymLog** is a static application, no build tools are required:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/MohitBhabak/gymtracker.git
   ```
2. Open either version in any modern browser:
   - **Desktop Web Version:** Open `index.html`
   - **Mobile App Version:** Open `mobile/index.html`

Alternatively, deploy directly to **GitHub Pages**, **Vercel**, or **Netlify**.

---

## 🛠️ Built With

- **HTML5 & CSS3** (Vanilla CSS Variables & Safe-Area Insets)
- **JavaScript (ES6+)**
- **[Chart.js](https://www.chartjs.org/)** — Data visualization
- **[Lucide Icons](https://lucide.dev/)** — Iconography
- **[Fontshare](https://www.fontshare.com/)** — Cabinet Grotesk & Satoshi fonts
- **[Capacitor](https://capacitorjs.com/)** — Optional native runtime

---

## 📄 License

MIT License — Feel free to use, modify, and distribute for your personal training needs!
