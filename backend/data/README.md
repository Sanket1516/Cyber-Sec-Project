# RockYou Dataset

## Sample Dataset (Loaded)
The file `rockyou_sample.txt` contains ~496 common passwords organized by category:
- Common passwords (123456, password, qwerty, etc.)
- Keyboard patterns and numeric sequences
- Anime, gaming, and pop culture references
- Security/hacking tool names
- Leet speak and mutation variants (p@$$w0rd, P@ssw0rd, Admin@123, etc.)
- Short/simple passwords for edge-case testing

**Status**: Loaded into MongoDB — 492 unique passwords inserted into the `passwords` collection (database: `password_platform`). Indexed on `password` (unique) and `line_number`.

## Full Dataset
For the full experience with ~14 million passwords, obtain `rockyou.txt` and place it in this directory.

### Where to get it:
- **SecLists**: https://github.com/danielmiessler/SecLists
- **Direct**: https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt

### Loading the dataset:
```bash
# From the backend/ directory:

# Load sample (default) — already done:
python utils/dataset_loader.py

# Load full dataset:
python utils/dataset_loader.py --full
```

### Expected output (sample):
```
Dropping existing 'passwords' collection...
Creating indexes...
Loading passwords from: .../data/rockyou_sample.txt
Done! Inserted 492 passwords in 0.0s
Lines processed: 495
```
