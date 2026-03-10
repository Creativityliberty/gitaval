import os
import json
from pathlib import Path

CONFIG_DIR = Path.home() / ".gitavale"
CONFIG_FILE = CONFIG_DIR / "config.json"

DEFAULT_CONFIG = {
    "api_endpoint": "https://gitaval.vercel.app",
    "api_key": ""
}

def load_config():
    """Load configuration from ~/.gitavale/config.json"""
    if not CONFIG_FILE.exists():
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    
    try:
        with open(CONFIG_FILE, 'r') as f:
            user_config = json.load(f)
            # Merge with defaults to ensure all keys exist
            config = DEFAULT_CONFIG.copy()
            config.update(user_config)
            return config
    except Exception:
        return DEFAULT_CONFIG

def save_config(config):
    """Save configuration to ~/.gitavale/config.json"""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=4)

def update_endpoint(endpoint):
    """Update the API endpoint in the config."""
    config = load_config()
    config["api_endpoint"] = endpoint.rstrip("/")
    save_config(config)

def update_api_key(api_key):
    """Update the API key in the config."""
    config = load_config()
    config["api_key"] = api_key
    save_config(config)

def get_endpoint():
    config = load_config()
    return config.get("api_endpoint", DEFAULT_CONFIG["api_endpoint"]).rstrip("/")

def get_api_key():
    config = load_config()
    return config.get("api_key", "")
