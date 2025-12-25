use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use cbkbd::{CbBrightness, CbColor, CbEffect, CosmicByteDevice, RGB};
use hidapi::HidApi;
use tauri::{Emitter, Manager, State};

const VENDOR_ID: u16 = 0x04D9;
const PRODUCT_ID: u16 = 0xA1CD;

// Define the payload for the event
#[derive(Clone, serde::Serialize)]
struct ConnectionEvent {
    connected: bool,
}

fn start_monitor_thread(app_handle: tauri::AppHandle) {
    // 1. Create a specific clone for the thread to OWN.
    //    AppHandle is cheap to clone (it's just a pointer).
    let thread_handle = app_handle.clone();

    thread::spawn(move || {
        // 2. Use 'thread_handle' inside this closure.
        //    It is now fully owned by this thread and satisfies the lifetime requirement.
        
        // You can grab the state using the cloned handle inside the thread
        let state = thread_handle.state::<AppState>();
        
        // Initialize HID API
        let api_result = HidApi::new();
        if let Err(e) = &api_result {
            eprintln!("Failed to init HID monitor: {}", e);
            return;
        }
        let mut api = api_result.unwrap();
        let mut local_connected = false;

        loop {
            if let Ok(_) = api.refresh_devices() {
                let device_exists = api.device_list().any(|d| 
                    d.vendor_id() == VENDOR_ID && d.product_id() == PRODUCT_ID
                );

                if device_exists != local_connected {
                    local_connected = device_exists;
                    println!("Device status changed. Connected: {}", local_connected);

                    let mut device_guard = state.device.lock().unwrap();

                    if local_connected {
                        match CosmicByteDevice::new() {
                            Ok(dev) => {
                                println!("Auto-connected!");
                                *device_guard = Some(dev);
                            },
                            Err(e) => {
                                eprintln!("Failed to open: {}", e);
                                local_connected = false; 
                            }
                        }
                    } else {
                        *device_guard = None;
                    }

                    // 3. Use 'thread_handle' to emit the event
                    let _ = thread_handle.emit("device-status", ConnectionEvent { 
                        connected: local_connected 
                    });
                }
            }
            thread::sleep(Duration::from_secs(2));
        }
    });
}

#[tauri::command]
fn get_connection_status() -> bool {
    // Re-use logic: Check if device exists right now
    if let Ok(api) = HidApi::new() {
        return api.device_list().any(|d| 
            d.vendor_id() == VENDOR_ID && d.product_id() == PRODUCT_ID
        );
    }
    false
}


struct AppState {
    // We keep the Option because the device might be unplugged
    device: Mutex<Option<CosmicByteDevice>>,
}

impl AppState {
    // --- The Magic Helper ---
    // This method handles the locking and checks if the device exists.
    // If connected, it runs your lambda (f). If not, it returns an error automatically.
    fn with_device<F, T>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&CosmicByteDevice) -> Result<T, String>, // The action you want to perform
    {
        // 1. Lock the Mutex
        let guard = self.device.lock().map_err(|_| "Internal State Error: Failed to lock mutex")?;

        // 2. Check if device is present
        if let Some(device) = &*guard {
            // 3. Run the command using the device
            f(device)
        } else {
            // 4. Auto-fail if disconnected
            Err("Device not connected".to_string())
        }
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState{
            device: Mutex::new(None)
        })
        .setup(|app| {
            // Start the monitoring thread when the app launches
            start_monitor_thread(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_connection_status, get_swatches, set_color_all, set_led_type])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn set_color_all(r: u8, g: u8, b: u8, state: State<AppState>) -> Result<(), String> {
    // "state.with_device" automatically gives you the 'device' or returns an error
    state.with_device(|device| {
        let colors = [RGB::new(r, g, b); 7];
        device.set_colors(colors).map_err(|e| e.to_string())
    })
}

#[tauri::command]
fn set_led_type(effect_index: u8, brightness: u8, speed: u8, color: CbColor, state: State<AppState>) -> Result<(), String> {

    #[cfg(debug_assertions)]
    println!("[SET_LED_TYPE]: {} {} {} {:#?}", effect_index, brightness, speed, color);
    // "state.with_device" automatically gives you the 'device' or returns an error
    state.with_device(|device| {
        device.set_led_type(CbEffect::from_index(effect_index), CbBrightness::from_index(brightness), speed, color).map_err(|e| e.to_string())
    })
}

#[tauri::command]
fn get_swatches(state: State<AppState>)-> Result<[RGB; 7], String>{
    state.with_device(|dev|{
        dev.get_colors()
    })
}