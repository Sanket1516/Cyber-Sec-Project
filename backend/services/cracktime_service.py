import math
from config import HARDWARE_SPEEDS


def format_duration(seconds: float) -> str:
    if seconds < 0.001:
        return "Instant"
    if seconds < 1:
        return f"{seconds * 1000:.1f} milliseconds"
    if seconds < 60:
        return f"{seconds:.1f} seconds"
    if seconds < 3600:
        return f"{seconds / 60:.1f} minutes"
    if seconds < 86400:
        return f"{seconds / 3600:.1f} hours"
    if seconds < 86400 * 365:
        return f"{seconds / 86400:.1f} days"
    if seconds < 86400 * 365 * 1000:
        return f"{seconds / (86400 * 365):.1f} years"
    if seconds < 86400 * 365 * 1_000_000:
        return f"{seconds / (86400 * 365 * 1000):.1f} thousand years"
    if seconds < 86400 * 365 * 1_000_000_000:
        return f"{seconds / (86400 * 365 * 1_000_000):.1f} million years"
    if seconds < 86400 * 365 * 1e12:
        return f"{seconds / (86400 * 365 * 1_000_000_000):.1f} billion years"
    return f"{seconds / (86400 * 365 * 1e12):.1f} trillion years"


def estimate_crack_time(charset_size: int, length: int) -> dict:
    total_combinations = charset_size ** length
    # Average case: attacker finds it about halfway through
    average_combinations = total_combinations / 2

    estimates = {}
    for tier, rate in HARDWARE_SPEEDS.items():
        seconds = average_combinations / rate
        estimates[tier] = {
            "rate": rate,
            "seconds": seconds,
            "display": format_duration(seconds),
        }

    return {
        "total_combinations": str(total_combinations),
        "estimates": estimates,
    }
