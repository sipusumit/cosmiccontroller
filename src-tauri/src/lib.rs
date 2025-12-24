use std::thread;
use std::time::Duration;
use hidapi::HidApi;
use tauri::Emitter;

const VENDOR_ID: u16 = 0x04D9;
const PRODUCT_ID: u16 = 0xA1CD;

// Define the payload for the event
#[derive(Clone, serde::Serialize)]
struct ConnectionEvent {
    connected: bool,
}

fn start_monitor_thread(app_handle: tauri::AppHandle) {
    thread::spawn(move || {
        // 1. Initialize API ONLY ONCE outside the loop
        let api_result = HidApi::new();
        
        if let Err(e) = &api_result {
            eprintln!("Failed to init HID monitor: {}", e);
            return;
        }
        
        let mut api = api_result.unwrap();
        let mut was_connected = false;

        loop {
            // 2. Refresh devices using the EXISTING api instance
            // Note: .refresh_devices() scans the OS for changes
            if let Ok(_) = api.refresh_devices() {
                
                let is_connected = api.device_list().any(|d| 
                    d.vendor_id() == VENDOR_ID && d.product_id() == PRODUCT_ID
                );

                if is_connected != was_connected {
                    was_connected = is_connected;
                    println!("Device state changed: Connected = {}", is_connected);
                    
                    let _ = app_handle.emit("device-status", ConnectionEvent { 
                        connected: is_connected 
                    });
                }
            } else {
                eprintln!("Failed to refresh devices");
            }
            
            // Check every 2 seconds
            thread::sleep(Duration::from_secs(2));
        }
        // api is dropped here only when app closes/thread dies
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Start the monitoring thread when the app launches
            start_monitor_thread(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_connection_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
