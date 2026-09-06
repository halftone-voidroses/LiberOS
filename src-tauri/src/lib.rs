// LiberOS — Tauri v2 app builder. Deliberately bare: the surface is the
// frozen web app, embedded verbatim from ../dist. No IPC, no plugins, so
// no capability files are required.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
