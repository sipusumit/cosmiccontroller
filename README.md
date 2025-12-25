# Cosmic Controller

**Cosmic Controller** (internally `cb_rgb`) is a cross-platform desktop application designed to control the RGB lighting effects of compatible keyboards (specifically targeted at Cosmic Byte devices). Built with the performance of **Rust** and the flexibility of **Tauri**, it features a lightweight **Preact** frontend.

## 🚀 Features

* **Device Management**: Connect and disconnect from your supported keyboard seamlessly.
* **Visual Interface**: Interactive visual representation of the keyboard layout.
* **Lighting Effects**: Choose from over 10 preset lighting modes, including:
    * Static, Breathe, Fade, Neon, Wave, Ripple, RainDrop, and more.
* **Customization**:
    * **Color Picker**: Select custom colors for specific effects.
    * **Controls**: Adjust Brightness and Animation Speed.
    * **Per-Key UI**: Interactive "paint" mode on the visual keyboard (dragging supported).
* **Cross-Platform**: Built on Tauri for Windows and Linux support.

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


