import math
import re

# Common keyboard walks and sequences for pattern detection
KEYBOARD_WALKS = [
    "qwerty", "asdf", "zxcv", "qazwsx", "1qaz", "2wsx", "qwert", "asdfg",
    "zxcvb", "poiuy", "lkjhg", "mnbvc",
]
SEQUENCES = [
    "abc", "bcd", "cde", "def", "efg", "fgh", "ghi", "hij", "ijk", "jkl",
    "klm", "lmn", "mno", "nop", "opq", "pqr", "qrs", "rst", "stu", "tuv",
    "uvw", "vwx", "wxy", "xyz",
    "012", "123", "234", "345", "456", "567", "678", "789", "890",
]
COMMON_WORDS = [
    "password", "admin", "login", "welcome", "master", "letmein", "dragon",
    "monkey", "shadow", "sunshine", "princess", "football", "baseball",
    "soccer", "hockey", "batman", "trustno1", "iloveyou", "qwerty",
    "abc123", "111111", "123456", "password1",
]
LEET_MAP = {"a": "@", "e": "3", "i": "1", "o": "0", "s": "$", "t": "7", "l": "1"}


def _detect_patterns(password: str) -> list[str]:
    patterns = []
    lower = password.lower()

    # Keyboard walks
    for walk in KEYBOARD_WALKS:
        if walk in lower:
            patterns.append(f"Keyboard walk detected: '{walk}'")
            break

    # Sequential characters
    for seq in SEQUENCES:
        if seq in lower:
            patterns.append("Sequential characters detected")
            break

    # Repeated characters (3+ in a row)
    if re.search(r"(.)\1{2,}", password):
        patterns.append("Repeated characters detected")

    # Date patterns
    if re.search(r"\d{2}[/\-]\d{2}[/\-]\d{2,4}", password) or re.search(r"^(19|20)\d{6}$", password):
        patterns.append("Date-like pattern detected")

    # Leet speak check: de-leet and see if it's a common word
    de_leet = lower
    reverse_leet = {v: k for k, v in LEET_MAP.items()}
    for symbol, letter in reverse_leet.items():
        de_leet = de_leet.replace(symbol, letter)
    # Strip trailing digits for the check
    base_word = re.sub(r"\d+$", "", de_leet)
    if base_word in COMMON_WORDS and base_word != lower:
        patterns.append("Leet speak substitution of a common word")

    # Direct common word match
    if lower in COMMON_WORDS:
        patterns.append("Matches a commonly used password")

    return patterns


def _get_suggestions(analysis: dict) -> list[str]:
    suggestions = []
    if analysis["length"] < 12:
        suggestions.append("Increase password length to at least 12 characters")
    if not analysis["has_uppercase"]:
        suggestions.append("Add uppercase letters (A-Z)")
    if not analysis["has_lowercase"]:
        suggestions.append("Add lowercase letters (a-z)")
    if not analysis["has_digits"]:
        suggestions.append("Add numbers (0-9)")
    if not analysis["has_special"]:
        suggestions.append("Add special characters (!@#$%^&*)")
    if analysis["common_patterns"]:
        suggestions.append("Avoid keyboard walks, sequences, and common words")
    if analysis["entropy"] < 60:
        suggestions.append("Consider using a passphrase (e.g., 'correct-horse-battery-staple')")
    if not suggestions:
        suggestions.append("Your password is strong! Consider enabling multi-factor authentication for extra security.")
    return suggestions


def analyze_password(password: str) -> dict:
    length = len(password)

    has_lowercase = bool(re.search(r"[a-z]", password))
    has_uppercase = bool(re.search(r"[A-Z]", password))
    has_digits = bool(re.search(r"[0-9]", password))
    has_special = bool(re.search(r"[^a-zA-Z0-9]", password))

    charset_size = 0
    if has_lowercase:
        charset_size += 26
    if has_uppercase:
        charset_size += 26
    if has_digits:
        charset_size += 10
    if has_special:
        charset_size += 33

    # Prevent log2(0) if somehow no charset detected
    if charset_size == 0:
        charset_size = 1

    entropy = round(length * math.log2(charset_size), 2)

    # Detect common patterns
    common_patterns = _detect_patterns(password)

    # Strength score (0-100)
    score = min(100, entropy * 1.2)
    score -= len(common_patterns) * 10
    score = max(0, round(score))

    # Strength label
    if score < 20:
        label = "Very Weak"
    elif score < 40:
        label = "Weak"
    elif score < 60:
        label = "Fair"
    elif score < 80:
        label = "Strong"
    else:
        label = "Very Strong"

    analysis = {
        "length": length,
        "has_lowercase": has_lowercase,
        "has_uppercase": has_uppercase,
        "has_digits": has_digits,
        "has_special": has_special,
        "charset_size": charset_size,
        "entropy": entropy,
        "strength_score": score,
        "strength_label": label,
        "common_patterns": common_patterns,
    }
    analysis["suggestions"] = _get_suggestions(analysis)
    return analysis
