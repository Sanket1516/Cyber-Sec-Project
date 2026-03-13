"""
Dataset loader: imports rockyou.txt (or sample) into MongoDB.

Usage:
    python utils/dataset_loader.py [--full]

Without --full, uses rockyou_sample.txt (10K passwords).
With --full, uses rockyou.txt (must be placed in backend/data/).
"""
import os
import sys
import time

# Allow running as a script from the backend directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pymongo import MongoClient
from config import MONGODB_URI, DATABASE_NAME, COLLECTION_NAME, ROCKYOU_SAMPLE_PATH, ROCKYOU_FULL_PATH


def load_dataset(use_full=False):
    file_path = ROCKYOU_FULL_PATH if use_full else ROCKYOU_SAMPLE_PATH

    if not os.path.exists(file_path):
        print(f"Error: Dataset file not found at {file_path}")
        if use_full:
            print("Please place rockyou.txt in the backend/data/ directory.")
            print("You can obtain it from: https://github.com/brannondorsey/naive-hashcat/releases")
        return

    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    # Drop existing collection for clean import
    print(f"Dropping existing '{COLLECTION_NAME}' collection...")
    collection.drop()

    # Create indexes before inserting so insert_many(ordered=False) skips dupes
    print("Creating indexes...")
    collection.create_index("password", unique=True)
    collection.create_index("line_number")

    print(f"Loading passwords from: {file_path}")
    start = time.time()

    batch = []
    batch_size = 10_000
    line_number = 0
    inserted = 0
    errors = 0

    # Use latin-1 encoding for rockyou.txt (contains non-UTF8 bytes)
    encoding = "latin-1" if use_full else "utf-8"

    with open(file_path, "r", encoding=encoding, errors="ignore") as f:
        for line in f:
            line_number += 1
            password = line.rstrip("\n\r")

            if not password:
                continue

            batch.append({"password": password, "line_number": line_number})

            if len(batch) >= batch_size:
                try:
                    result = collection.insert_many(batch, ordered=False)
                    inserted += len(result.inserted_ids)
                except Exception as e:
                    # ordered=False: duplicates cause BulkWriteError, but others still insert
                    if hasattr(e, "details"):
                        inserted += e.details.get("nInserted", 0)
                    errors += 1
                batch = []

                if line_number % 100_000 == 0:
                    elapsed = time.time() - start
                    print(f"  Processed {line_number:,} lines ({inserted:,} inserted) - {elapsed:.1f}s")

    # Insert remaining
    if batch:
        try:
            result = collection.insert_many(batch, ordered=False)
            inserted += len(result.inserted_ids)
        except Exception as e:
            if hasattr(e, "details"):
                inserted += e.details.get("nInserted", 0)

    elapsed = time.time() - start
    final_count = collection.count_documents({})
    print(f"\nDone! Inserted {final_count:,} passwords in {elapsed:.1f}s")
    print(f"Lines processed: {line_number:,}")

    client.close()


if __name__ == "__main__":
    use_full = "--full" in sys.argv
    load_dataset(use_full)
