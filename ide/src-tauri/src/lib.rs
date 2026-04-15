use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::{Manager, State};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub role: String,
    pub content: String,
    pub timestamp: i64,
    pub chat_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub cursor_api_key: Option<String>,
    pub openai_api_key: Option<String>,
    pub anthropic_api_key: Option<String>,
    pub google_api_key: Option<String>,
    pub deepseek_api_key: Option<String>,
    pub selected_provider: String,
    pub selected_model: String,
    pub theme: String,
    pub font_size: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            cursor_api_key: None,
            openai_api_key: None,
            anthropic_api_key: None,
            google_api_key: None,
            deepseek_api_key: None,
            selected_provider: "openai".to_string(),
            selected_model: "gpt-4o".to_string(),
            theme: "dark".to_string(),
            font_size: 14,
        }
    }
}

// ─────────────────────────────────────────────
// App State
// ─────────────────────────────────────────────

pub struct AppState {
    pub config: std::sync::Mutex<AppConfig>,
    pub db_path: std::sync::Mutex<String>,
}

// ─────────────────────────────────────────────
// Tauri Commands — File System
// ─────────────────────────────────────────────

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn read_dir_recursive(path: String, depth: u32) -> Result<Vec<FileEntry>, String> {
    read_dir_entries(&path, depth, 0)
}

fn read_dir_entries(
    path: &str,
    max_depth: u32,
    current_depth: u32,
) -> Result<Vec<FileEntry>, String> {
    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
    let mut result = Vec::new();

    for entry in entries.flatten() {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files and common ignore dirs
        if name.starts_with('.') || name == "node_modules" || name == "target" || name == "__pycache__" {
            continue;
        }

        let is_dir = entry_path.is_dir();
        let path_str = entry_path.to_string_lossy().to_string();

        let children = if is_dir && current_depth < max_depth {
            Some(read_dir_entries(&path_str, max_depth, current_depth + 1).unwrap_or_default())
        } else {
            None
        };

        result.push(FileEntry {
            name,
            path: path_str,
            is_dir,
            children,
        });
    }

    result.sort_by(|a, b| {
        if a.is_dir == b.is_dir {
            a.name.cmp(&b.name)
        } else if a.is_dir {
            std::cmp::Ordering::Less
        } else {
            std::cmp::Ordering::Greater
        }
    });

    Ok(result)
}

#[tauri::command]
async fn create_dir_command(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn rename_file(from: String, to: String) -> Result<(), String> {
    fs::rename(&from, &to).map_err(|e| e.to_string())
}

#[tauri::command]
async fn file_exists(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).exists())
}

// ─────────────────────────────────────────────
// Tauri Commands — Config / Settings
// ─────────────────────────────────────────────

#[tauri::command]
async fn get_config(state: State<'_, AppState>) -> Result<AppConfig, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    Ok(AppConfig {
        cursor_api_key: config.cursor_api_key.clone(),
        openai_api_key: config.openai_api_key.clone(),
        anthropic_api_key: config.anthropic_api_key.clone(),
        google_api_key: config.google_api_key.clone(),
        deepseek_api_key: config.deepseek_api_key.clone(),
        selected_provider: config.selected_provider.clone(),
        selected_model: config.selected_model.clone(),
        theme: config.theme.clone(),
        font_size: config.font_size,
    })
}

#[tauri::command]
async fn save_api_key(
    provider: String,
    key: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    match provider.as_str() {
        "cursor" => config.cursor_api_key = Some(key),
        "openai" => config.openai_api_key = Some(key),
        "anthropic" => config.anthropic_api_key = Some(key),
        "google" => config.google_api_key = Some(key),
        "deepseek" => config.deepseek_api_key = Some(key),
        _ => return Err(format!("Unknown provider: {}", provider)),
    }
    Ok(())
}

#[tauri::command]
async fn update_settings(
    provider: String,
    model: String,
    theme: String,
    font_size: u32,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    config.selected_provider = provider;
    config.selected_model = model;
    config.theme = theme;
    config.font_size = font_size;
    Ok(())
}

// ─────────────────────────────────────────────
// Tauri Commands — Chat History (SQLite)
// ─────────────────────────────────────────────

#[tauri::command]
async fn get_chat_history(
    chat_id: String,
    state: State<'_, AppState>,
) -> Result<Vec<ChatMessage>, String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    let conn = rusqlite::Connection::open(db_path.as_str()).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, role, content, timestamp, chat_id FROM messages WHERE chat_id = ?1 ORDER BY timestamp ASC")
        .map_err(|e| e.to_string())?;

    let messages = stmt
        .query_map([&chat_id], |row| {
            Ok(ChatMessage {
                id: row.get(0)?,
                role: row.get(1)?,
                content: row.get(2)?,
                timestamp: row.get(3)?,
                chat_id: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(messages)
}

#[tauri::command]
async fn save_chat_message(
    message: ChatMessage,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    let conn = rusqlite::Connection::open(db_path.as_str()).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR REPLACE INTO messages (id, role, content, timestamp, chat_id) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![message.id, message.role, message.content, message.timestamp, message.chat_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn delete_chat_messages(
    chat_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    let conn = rusqlite::Connection::open(db_path.as_str()).map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM messages WHERE chat_id = ?1",
        rusqlite::params![chat_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// ─────────────────────────────────────────────
// Database Initialization
// ─────────────────────────────────────────────

fn init_database(db_path: &str) -> Result<(), rusqlite::Error> {
    let conn = rusqlite::Connection::open(db_path)?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            chat_id TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);

        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );",
    )?;
    Ok(())
}

// ─────────────────────────────────────────────
// Tauri App Entry
// ─────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");
            fs::create_dir_all(&app_dir).expect("Failed to create app data dir");

            let db_path = app_dir.join("xcursor.db");
            let db_path_str = db_path.to_string_lossy().to_string();

            init_database(&db_path_str).expect("Failed to initialize database");

            app.manage(AppState {
                config: std::sync::Mutex::new(AppConfig::default()),
                db_path: std::sync::Mutex::new(db_path_str),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            read_dir_recursive,
            create_dir_command,
            delete_file,
            rename_file,
            file_exists,
            get_config,
            save_api_key,
            update_settings,
            get_chat_history,
            save_chat_message,
            delete_chat_messages,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
