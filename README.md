# Perusall Heartbeat Booster

Perusall Heartbeat Booster is a Google Chrome extension designed to monitor active reading progress, display real-time assignment metrics, and manage automated heartbeat booster requests for Perusall assignments.

---

## Features

- **Booster Multipliers**: Choose between **2x, 3x, 4x, 5x, or 8x** booster profiles via a modern grid selector in the popup UI.
- **Master Enable Switch**: Toggle automated background heartbeats on or off at any time, allowing only original page heartbeats when disabled.
- **Assignment Detection**: Automatically captures and displays the active assignment name and unique assignment ID.
- **Live Progress Overview**: Fetches live reading statistics directly from Perusall each time the popup is opened:
  - **Active Time**: Total active reading time formatted in hours and minutes.
  - **Reading Percentage**: Current completion percentage.
  - **Annotations**: Number of submitted annotations and responses.
- **Modern UI**: Clean interface styled with blue accents, dark typography, and status indications (no emojis).
- **Visual Badge Indicator**: On-page visual badge in the lower-right corner of Perusall tabs showing extension state.

---

## Installation Guide

### Option 1: Install Pre-packaged ZIP (Recommended)

1. Go to the **Releases** page of this repository and download the latest `.zip` release asset (e.g., `perusall-booster-v1.0.0.zip`).
2. Extract the downloaded `.zip` file into a folder on your computer.
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle switch in the top-right corner.
5. Click **Load unpacked** in the top-left corner.
6. Select the extracted folder containing `manifest.json`.

---

### Option 2: Install from Source Code

1. Clone or download this repository locally:
   ```bash
   git clone https://github.com/ZaidX88/perusall_booster.git
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle switch in the top-right corner.
5. Click **Load unpacked** in the top-left corner.
6. Select the extracted folder containing `manifest.json`.

## How to Use

1. Navigate to any assignment page on `perusall.com`.
2. Click the **Heartbeat Booster** icon in your browser toolbar to open the extension popup.
3. Verify that the assignment name and ID are detected under **Current Assignment**.
4. Check your live statistics under **Progress Overview**.
5. Select your desired speed multiplier (**2x, 3x, 4x, 5x, or 8x**) using the multiplier grid.
6. Use the **Enable Booster** toggle to turn automated background heartbeats on or off.

## Booster Multiplier Timing Profiles

| **Multiplier**   | **Staggered Delay Offsets**              |
| ---------------- | ---------------------------------------- |
| **2x**           | 30s                                      |
| **3x**           | 20s, 40s                                 |
| **4x** (Default) | 15s, 30s, 45s                            |
| **5x**           | 12s, 24s, 36s, 48s                       |
| **8x**           | 7.5s, 15s, 22.5s, 30s, 37.5s, 45s, 52.5s |

## Extension Architecture

Plaintext

```
perusall-booster/
├── manifest.json      # Manifest V3 extension configuration
├── background.js     # Web request listener for header & assignment URL capture
├── content.js        # Tab execution script for batch heartbeats & metric fetching
├── popup.html        # Popup UI layout with modern styling
├── popup.js          # Interactive state management & storage listeners
└── rules.json        # DeclarativeNetRequest rules asset
```
