# GymLog 🏋️‍♂️

A clean, intuitive, privacy-first single-page web application designed for tracking workout sessions, bodyweight progression, bench press PRs, and progressive overload targets. Built with vanilla HTML/JS, zero build step required, and runs entirely in the browser.

---

## ✨ Features

- 📅 **Interactive Workout Calendar:** Log workout types (Push, Pull, Legs, Upper, Lower, Abs, Rest), duration, effort intensity, time of day, and track monthly consistency streaks.
- 📋 **Smart Quick Paste & Note Parser:** Copy raw workout notes from Apple Notes, Google Keep, Notion, or text messages and paste them directly into GymLog. Automatically detects exercises, weights, reps, decimal values, and bodyweight sets with zero API keys or external tokens.
- 🔍 **Instant Search & Quick Presets (`Ctrl+K` / `⌘K`):** Global command palette and search bar for instant non-AI lookups. Features fast preset calculators for all-time Exercise PRs (with estimated 1RM and lifetime volume), monthly workout volume/breakdown tallies, workout split filters, and notes search.
- ⚡ **Rapid Keyboard Set Logging:** Type weight, press `Tab`, type reps, and press `Tab` to automatically create and focus the next set for high-speed logging without touching the mouse.
- 📊 **Progress Tracker & Analytics:** Inspect exercise performance history with interactive Chart.js graphs (Estimated 1RM, Max Weight, Total Reps, and Volume).
- ⚖️ **Bodyweight Tracker with Trendline:** Log bodyweight entries over time with an automated linear regression trendline overlay to visualize long-term weight trends through daily fluctuations.
- 🏆 **Bench PR Tracker:** Dedicated Bench Press PR tracker featuring a progress graph and historical performance table.
- 🚀 **Progressive Overload Assistant:** Select planned exercises to view your all-time best scores to beat, with direct one-click export to Gmail.
- 🌙 **Dark-Mode First Design:** Sleek gym-aesthetic UI featuring `Cabinet Grotesk` and `Satoshi` typography, smooth micro-interactions, responsive mobile-first layout, and light/dark mode toggle.
- ☁️ **Google Drive Cross-Device Sync:** Sync workout logs, bodyweight entries, and PRs seamlessly across phones, tablets, and desktops using your personal Google account (`appDataFolder`).
- 💾 **Local Data Ownership:** All data persists locally in `localStorage` with full JSON backup export and import capabilities. No external backend server required.

---

## ☁️ Google Drive Cross-Device Sync Setup

GymLog uses Google's official Identity Services API to sync data directly to your personal Google Drive account in a hidden, secure `appDataFolder`.

1. Click **Drive Sync** (or open **Settings & Backup**).
2. Click **Connect Google Drive Sync** and authorize with your Google account.
3. Your data will now automatically sync across any browser or device where you sign into GymLog!

*Note for custom deployments:* If hosting on a custom domain, you can optionally paste your own Google OAuth 2.0 Client ID in **Settings** (created via Google Cloud Console under APIs & Services > Credentials).

## 🚀 Getting Started

Since **GymLog** is a static single-page application, no installation or package managers are required:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/MohitBhabak/gymtracker.git
   ```
2. Open `index.html` directly in any browser (Chrome, Safari, Firefox, Edge).

Alternatively, deploy `index.html` instantly on **GitHub Pages**, **Vercel**, or **Netlify**.

---

## 🛠️ Built With

- **HTML5 & CSS3** (Vanilla CSS Variables)
- **JavaScript (ES6+)**
- **[Chart.js](https://www.chartjs.org/)** — Data visualization
- **[Lucide Icons](https://lucide.dev/)** — Iconography
- **[Fontshare](https://www.fontshare.com/)** — Cabinet Grotesk & Satoshi fonts

---

## 📄 License

MIT License — Feel free to use, modify, and distribute for your personal training needs!
