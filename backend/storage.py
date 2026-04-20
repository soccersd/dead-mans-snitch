import json
import os
import fcntl
from datetime import datetime
from typing import Dict, List, Any

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")


def _atomic_write(filepath: str, data: dict) -> None:
    """Write data atomically using a temporary file and rename."""
    temp_file = filepath + ".tmp"
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())
    os.replace(temp_file, filepath)


def _acquire_lock(f, exclusive: bool = False) -> None:
    """Acquire file lock (shared or exclusive)."""
    lock_type = fcntl.LOCK_EX if exclusive else fcntl.LOCK_SH
    fcntl.flock(f.fileno(), lock_type)


def _release_lock(f) -> None:
    """Release file lock."""
    fcntl.flock(f.fileno(), fcntl.LOCK_UN)


def load_data() -> Dict[str, List[Dict[str, Any]]]:
    """Load data from JSON file with shared lock."""
    if not os.path.exists(DATA_FILE):
        default_data = {"prisoners": [], "traitors": []}
        _atomic_write(DATA_FILE, default_data)
        return default_data
    
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        _acquire_lock(f, exclusive=False)
        try:
            content = f.read()
            if not content.strip():
                return {"prisoners": [], "traitors": []}
            return json.loads(content)
        finally:
            _release_lock(f)


def save_data(data: Dict[str, List[Dict[str, Any]]]) -> None:
    """Save data to JSON file with exclusive lock."""
    _atomic_write(DATA_FILE, data)


def add_prisoner(
    wallet: str,
    secret: str,
    score: int,
    initial_amount: str = "0",
    initial_multiplier: str = "0"
) -> Dict[str, Any]:
    """Add a new prisoner to storage."""
    data = load_data()
    
    # Check if wallet already exists as prisoner
    for p in data["prisoners"]:
        if p["wallet"].lower() == wallet.lower():
            raise ValueError(f"Wallet {wallet} is already a prisoner")
    
    prisoner = {
        "wallet": wallet,
        "secret": secret,
        "score": score,
        "locked_at": datetime.utcnow().isoformat() + "Z",
        "initial_amount": initial_amount,
        "initial_multiplier": initial_multiplier
    }
    
    data["prisoners"].append(prisoner)
    save_data(data)
    return prisoner


def get_prisoners(strip_secrets: bool = False) -> List[Dict[str, Any]]:
    """Get all prisoners. If strip_secrets is True, remove secret field."""
    data = load_data()
    prisoners = data.get("prisoners", [])
    
    if strip_secrets:
        return [
            {
                "wallet": p["wallet"],
                "score": p["score"],
                "locked_at": p["locked_at"]
            }
            for p in prisoners
        ]
    return prisoners


def get_traitors() -> List[Dict[str, Any]]:
    """Get all traitors."""
    data = load_data()
    return data.get("traitors", [])


def move_to_traitor(wallet: str, tweet_url: str) -> Dict[str, Any]:
    """Move a prisoner to traitors list."""
    data = load_data()
    
    # Find and remove prisoner
    prisoner = None
    for i, p in enumerate(data["prisoners"]):
        if p["wallet"].lower() == wallet.lower():
            prisoner = p
            data["prisoners"].pop(i)
            break
    
    if not prisoner:
        raise ValueError(f"Prisoner with wallet {wallet} not found")
    
    # Create traitor record
    traitor = {
        "wallet": prisoner["wallet"],
        "secret_preview": prisoner["secret"][:50] if len(prisoner["secret"]) > 50 else prisoner["secret"],
        "exposed_at": datetime.utcnow().isoformat() + "Z",
        "tweet_url": tweet_url
    }
    
    data["traitors"].append(traitor)
    save_data(data)
    return traitor


def update_prisoner_baseline(wallet: str, initial_amount: str, initial_multiplier: str):
    """Update a prisoner's baseline values."""
    data = load_data()
    for prisoner in data["prisoners"]:
        if prisoner["wallet"].lower() == wallet.lower():
            prisoner["initial_amount"] = initial_amount
            prisoner["initial_multiplier"] = initial_multiplier
            break
    save_data(data)
