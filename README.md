# Samsung TV Remote (BN59-01301A) - iOS App

A React Native + TypeScript + Expo application that recreates the physical **Samsung Remote BN59-01301A** (matte black chassis, red power button, volume/channel rockers, 5-way D-pad, and color buttons) to control Samsung Smart TVs (Tizen 2016+) over Wi-Fi.

---

## Key Highlights & Architecture

- **Custom Swift Expo Module (`SamsungRemoteNative`)**:
  Samsung Smart TVs use self-signed TLS certificates on port 8002 (`wss://`), which default iOS `NSURLSessionWebSocketTask` rejects. This app includes an in-tree native Expo module implementing a custom `URLSessionDelegate` that selectively trusts the self-signed certificate **only for the user-configured TV IP address**, maintaining complete security for all other connections.
- **Wake-on-LAN (WoL) Engine**:
  Native UDP broadcast implementation that transmits 102-byte Magic Packets (6x `0xFF` followed by 16 repetitions of the TV's MAC address) over UDP ports 9 and 7. The Power button automatically transmits WoL when the TV is offline.
- **SSDP Auto-Discovery & Manual IP Guarantee**:
  M-SEARCH UDP scanner on port 1900 to discover Samsung Smart TVs (`urn:samsung.com:device:RemoteControlReceiver:1` / `ssdp:all`) on the local subnet, with manual IP input as the guaranteed connection path.
- **BN59-01301A Tactile Remote UI**:
  Physical layout matching the original remote top-to-bottom:
  1. Red circular **POWER** (top-left) & **SOURCE** (top-right)
  2. Number Pad (1-9, `-`, 0, `PRE-CH`)
  3. Tall physical **VOL** and **CH** rockers with continuous repeat-on-hold, center **MUTE** and **CH LIST**
  4. Quick access: **SLEEP**, **HOME**, **GUIDE**
  5. Navigation cluster: **SETTINGS**, curved **D-PAD** with center **ENTER**, **INFO**
  6. **RETURN** and **EXIT**
  7. Pill-shaped color buttons: **A** (Red), **B** (Green), **C** (Yellow), **D** (Blue)
  8. Function row: **E-MANUAL**, **P.SIZE**, **CC/VD**, **STOP**
  9. Media playback row: **<<**, **>**, **||**, **>>**
  10. Embossed **SAMSUNG** brand logo at the bottom
- **Haptic Feedback**:
  `expo-haptics` integration with tactile click response on touch and continuous pulse on rocker hold.
- **Tizen Protocol & Token Security**:
  Full support for `ms.channel.connect` handshake, authorization token extraction, and secure hardware storage via `expo-secure-store`.
- **Debug Inspector**:
  Built-in debug screen logging outgoing commands, raw payloads, incoming TV events, and arbitrary key transmitter to test and map unsupported keys.
- **Mock Mode**:
  Built-in simulated Tizen TV mode for development and UI inspection without physical hardware.

---

## Project Structure

```
SamsungRemote/
├── app.json                          # Expo config, InfoPlist permissions (NSLocalNetworkUsageDescription)
├── package.json                      # Dependencies and npm scripts
├── tsconfig.json                     # Strict TypeScript configuration
├── modules/
│   └── samsung-remote-native/        # Custom Swift Expo Module
│       ├── expo-module.config.json   # Expo Module autolinking descriptor
│       ├── SamsungRemoteNative.podspec
│       ├── index.ts                  # Typed TypeScript wrapper
│       └── ios/
│           └── SamsungRemoteNativeModule.swift   # Selective SSL trust & WoL UDP broadcast
├── app/                              # Expo Router file-based screens
│   ├── _layout.tsx                   # Safe area, dark theme provider & persistent state init
│   ├── index.tsx                     # Main remote screen
│   ├── settings.tsx                  # TV IP/MAC setup, SSDP scan, pairing, forget TV, mock toggle
│   ├── onboarding.tsx                # Setup instructions & TV permission guide
│   └── debug.tsx                     # Real-time event log, raw key tester, JSON inspector
└── src/
    ├── constants/
    │   ├── keys.ts                   # Samsung keycodes, fallbacks, and metadata
    │   └── theme.ts                  # BN59-01301A physical colors, typography, dimensions
    ├── services/
    │   ├── samsungTv.ts              # WebSocket lifecycle, reconnect backoff, token handshake
    │   ├── wol.ts                    # Wake-on-LAN magic packet generator & validator
    │   ├── discovery.ts              # SSDP discovery service
    │   └── mockTv.ts                 # Dev mock TV server simulating Tizen responses
    ├── store/
    │   └── tvStore.ts                # Zustand store (persisted IP, MAC, token, status, logs)
    ├── components/
    │   ├── RemoteButton.tsx          # Tactile button with animated scale and haptics
    │   ├── DPad.tsx                  # 5-way directional pad
    │   ├── Rocker.tsx                # Tall rocker for VOL and CH with hold-to-repeat
    │   ├── NumberPad.tsx             # 3x4 number grid
    │   ├── ColorKeys.tsx             # A, B, C, D buttons
    │   ├── StatusBadge.tsx           # Live connection state pill & WoL trigger
    │   └── RemoteChassis.tsx         # Physical remote body layout
    └── native/
        └── index.ts                  # Native module re-exports
```

---

## Prerequisites

- **macOS** with **Xcode 15+** installed
- **Node.js** v18+ (tested on Node v20/v24)
- **CocoaPods** (`gem install cocoapods` or Homebrew)
- A physical iPhone running iOS 15+ OR iOS Simulator (note: physical iPhone recommended for testing real Wi-Fi WebSocket and WoL UDP broadcasts)

---

## Quick Start & Development Build

Because this app utilizes a custom native Swift module for selective SSL certificate validation on port 8002, **it requires an Expo Development Build (`expo-dev-client`)** rather than standard Expo Go.

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify TypeScript & Lint
```bash
npm run typecheck
npm run lint
```

### 3. Generate the iOS Native Project
```bash
npx expo prebuild --platform ios --clean
```

### 4. Run on a Connected Physical iPhone
Connect your iPhone via USB, trust the computer, and run:
```bash
npx expo run:ios --device
```
*Note: Xcode will automatically configure codesigning for your Apple ID team.*

Alternatively, run in the iOS Simulator:
```bash
npx expo run:ios
```

### 5. Start the Metro Development Server
```bash
npx expo start --dev-client
```

---

## TV Setup & Pairing Guide

### Step 1: Ensure Same Wi-Fi Network
Connect your iPhone and Samsung Smart TV to the same Wi-Fi router (same SSID and subnet). Avoid guest networks that isolate client devices.

### Step 2: Configure Samsung TV Settings
On your Samsung TV with your physical remote:
1. Go to: **Settings > General > External Device Manager > Device Connection Manager**
2. Set **Access Notification** to **First Time** (or **Always Accept**).
3. Under **Device List**, ensure the iPhone or `SamsungRemoteApp` is not in the "Denied" list.
4. Enable **Power On with Mobile** (under *Network > Expert Settings* or *External Device Manager*) so the TV can receive Wake-on-LAN packets.

### Step 3: Find the TV IP Address
1. Go to: **Settings > General > Network > Network Status > IP Settings**
2. Note your TV's **IP Address** (e.g., `192.168.1.150`) and **MAC Address** (e.g., `AA:BB:CC:DD:EE:FF`).

### Step 4: Pair in the App
1. Open the app, tap the **Settings** icon (top right).
2. Enter your TV's **IP Address** (and optional **MAC Address** for Wake-on-LAN).
3. Tap **Pair with TV**.
4. Look at the top right of your TV screen: a popup will ask to allow **"SamsungRemoteApp"**.
5. Select **Allow** using your physical remote.
6. The app receives the pairing token, saves it securely to `expo-secure-store`, and the status updates to **Connected** (green).

---

## Key Mappings & Fallbacks (`src/constants/keys.ts`)

| Remote Function | Primary Keycode | Fallback Keycode | Description |
|---|---|---|---|
| **POWER** | `KEY_POWER` | — | Toggles power; sends Wake-on-LAN if TV is off |
| **SOURCE** | `KEY_SOURCE` | — | Switches input HDMI/TV |
| **0 - 9** | `KEY_0` - `KEY_9` | — | Numeric inputs |
| **-** | `KEY_PLUS100` | `KEY_MINUS` | Sub-channel separator |
| **PRE-CH** | `KEY_PRECH` | — | Previous channel |
| **VOL+ / VOL-** | `KEY_VOLUP` / `KEY_VOLDOWN` | — | Volume rocker with continuous repeat |
| **MUTE** | `KEY_MUTE` | — | Toggle mute |
| **CH+ / CH-** | `KEY_CHUP` / `KEY_CHDOWN` | — | Channel rocker with continuous repeat |
| **CH LIST** | `KEY_CH_LIST` | — | Opens TV channel list guide |
| **SLEEP** | `KEY_SLEEP` | — | Sleep timer |
| **HOME** | `KEY_HOME` | — | Smart Hub / Home dashboard |
| **GUIDE** | `KEY_GUIDE` | — | Program guide |
| **SETTINGS** | `KEY_MENU` | — | TV settings menu |
| **D-PAD (▲ ▼ ◀ ▶)** | `KEY_UP`, `KEY_DOWN`, `KEY_LEFT`, `KEY_RIGHT` | — | Directional navigation |
| **ENTER** | `KEY_ENTER` | — | Select / Confirm |
| **INFO** | `KEY_INFO` | — | OSD channel & signal info |
| **RETURN** | `KEY_RETURN` | — | Back / Return |
| **EXIT** | `KEY_EXIT` | — | Closes current menu/app |
| **A / B / C / D** | `KEY_RED`, `KEY_GREEN`, `KEY_YELLOW`, `KEY_CYAN` | — | Colored context buttons |
| **E-MANUAL** | `KEY_EMANUAL` | — | TV user guide |
| **P.SIZE** | `KEY_PICTURE_SIZE` | — | Aspect ratio / picture size |
| **CC/VD** | `KEY_CAPTION` | `KEY_SUB_TITLE` | Closed captions & audio description |
| **STOP** | `KEY_STOP` | — | Stop media playback |
| **REW / PLAY / PAUSE / FF**| `KEY_REWIND`, `KEY_PLAY`, `KEY_PAUSE`, `KEY_FF` | — | Media playback row |

---

## Troubleshooting

### 1. "Local Network Permission Denied"
When first launched, iOS prompts for permission to access devices on your local network. If accidentally dismissed:
1. On iPhone, open **Settings > Privacy & Security > Local Network**.
2. Find **Samsung Remote** and toggle it **ON**.

### 2. "Popup not appearing on the TV"
- Verify that your iPhone and TV are on the same Wi-Fi subnet (e.g., both `192.168.1.xxx`).
- On the TV, go to **Settings > General > External Device Manager > Device Connection Manager > Device List**. If `SamsungRemoteApp` is listed as **Denied**, delete it from the list and tap **Pair** again in the app.

### 3. "Port 8002 vs Port 8001"
- **Port 8002 (WSS)**: Standard for all Samsung TVs from 2016 to the present (Tizen OS). Requires self-signed SSL certificate trust, which this app handles natively.
- **Port 8001 (WS)**: Older models (pre-2016 or early Tizen builds). If port 8002 times out, go to **Settings** in the app and select **Port 8001 (WS Legacy)**.

### 4. "Wake-on-LAN does not power on the TV"
- Ensure you have saved the TV's physical **MAC address** in Settings.
- On your TV, verify that **Power On with Mobile** is enabled under **Settings > General > Network > Expert Settings**.
- Make sure the TV is connected to Wi-Fi with standby power enabled (not unplugged from the wall switch).

---

## Testing with Mock TV Mode

If you don't have a physical Samsung TV available during development:
1. Open the app and tap the **Settings** icon.
2. Toggle **Mock TV Mode** to **ON**.
3. The app will immediately simulate a live Samsung QLED Tizen TV, accept pairing handshakes, emit authorization tokens, process keypresses, and echo responses into the **Debug Screen**.
