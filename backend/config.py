import os

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = "password_platform"
COLLECTION_NAME = "passwords"

ROCKYOU_SAMPLE_PATH = os.path.join(os.path.dirname(__file__), "data", "rockyou_sample.txt")
ROCKYOU_FULL_PATH = os.path.join(os.path.dirname(__file__), "data", "rockyou.txt")

# Hardware guess rates (guesses per second)
HARDWARE_SPEEDS = {
    "cpu":     1_000_000,           # 1 million/sec
    "gpu":     1_000_000_000,       # 1 billion/sec
    "cluster": 100_000_000_000,     # 100 billion/sec
}

# Character set sizes
CHARSET_SIZES = {
    "digits": 10,
    "lowercase": 26,
    "uppercase": 26,
    "special": 33,
}

# Dictionary attack batch size for progress emission
DICT_BATCH_SIZE = 5000

# Hybrid attack: how many top passwords to use as base words
HYBRID_TOP_COUNT = 10000

# Socket.IO progress throttle
PROGRESS_INTERVAL_MS = 200

# Brute force animation duration (seconds)
BRUTEFORCE_ANIMATION_SECONDS = 30
