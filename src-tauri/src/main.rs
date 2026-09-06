// LiberOS — Tauri v2 entry. The window loads the frozen static surface
// (frontendDist ../dist) at index.html; no custom commands, no plugins.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    liberos_lib::run()
}
