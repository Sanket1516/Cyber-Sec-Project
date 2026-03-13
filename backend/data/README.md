# RockYou Dataset

## Sample Dataset
The file `rockyou_sample.txt` contains ~500 common passwords for development and testing.

## Full Dataset
For the full experience with ~14 million passwords, obtain `rockyou.txt` and place it in this directory.

### Where to get it:
- **SecLists**: https://github.com/danielmiessler/SecLists
- **Direct**: https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt

### Loading the dataset:
```bash
# From the backend/ directory:

# Load sample (default):
python utils/dataset_loader.py

# Load full dataset:
python utils/dataset_loader.py --full
```
