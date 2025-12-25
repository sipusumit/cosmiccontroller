# Cosmic Controller

**Cosmic Controller** (internally `cb_rgb`) is a cross-platform desktop application designed to control the RGB lighting effects of compatible keyboards (specifically targeted at Cosmic Byte devices). Built with the performance of **Rust** and the flexibility of **Tauri**, it features a lightweight **Preact** frontend.

## 🚀 Features (TODO)

### Device Management
- [x]  Connect to supported keyboard
- [ ]  Disconnect from keyboard safely

### Visual Interface
- [ ]  Interactive visual keyboard layout
- [ ]  Real-time key highlighting
 
### Lighting Effects
- [x]  Static effect
- [x]  Breathe effect
- [x]  Fade effect
- [x]  Neon effect
- [x]  Wave effect
- [x]  Ripple effect
- [x]  RainDrop effect
- [x]  Additional preset effects (10+ total)

### Customization
- [x]  Color picker for lighting effects
- [x]  Brightness control
- [x]  Animation speed control
- [ ]  Per-key RGB UI
- [ ]  Paint mode (click & drag on visual keyboard)

## 🛠️ Tech Stack

* **Core**: [Tauri](https://tauri.app/) (v2)
* **Backend**: Rust (using `hidapi` for device communication)
* **Frontend**: [Preact](https://preactjs.com/) + TypeScript
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Styling**: CSS Variables for neon/dark themes

## 📦 Prerequisites

Before running the project, ensure you have the following installed:

1.  **Rust**: [Install via rustup](https://www.rust-lang.org/tools/install)
2.  **Node.js**: [LTS Version](https://nodejs.org/)
3.  **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`.
4.  **System Dependencies**:
    * **Linux**: You need webkit2gtk and other build tools. [See Tauri Linux Guide](https://tauri.app/v1/guides/getting-started/prerequisites#linux).

## 🏃‍♂️ Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sipusumit/cosmiccontroller.git
    cd cosmiccontroller
    ```

2.  **Install Frontend Dependencies**
    ```bash
    pnpm install
    ```

3.  **Run in Development Mode**
    This will start the Vite server and the Tauri window.
    ```bash
    pnpm tauri dev
    ```

## 🐧 Linux Setup (udev rules)

To communicate with the HID device on Linux without root privileges, you need to configure `udev` rules.

1.  Copy the provided rule file to your system:
    ```bash
    sudo cp src-tauri/rules/99-cosmicbyte.rules /etc/udev/rules.d/
    ```
2.  Reload the rules:
    ```bash
    sudo udevadm control --reload && sudo udevadm trigger
    ```

*Note: The packaged `.deb` file handles this automatically during installation.*

## 🏗️ Building for Production

To create an optimized executable installer:

```bash
pnpm tauri build
```

The output bundles (Debian package, AppImage, or Windows Installer) will be located in src-tauri/target/release/bundle/


