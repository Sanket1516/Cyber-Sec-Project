# PassGuard - Password Strength Evaluation & Attack Simulation Platform

A full-stack cybersecurity education platform that evaluates password strength using information-theoretic entropy calculations and simulates real-world password cracking techniques — dictionary attacks, hybrid/mutation attacks, and brute force — with real-time visualization powered by WebSockets.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Tech Stack](#tech-stack)
6. [Prerequisites](#prerequisites)
7. [Installation & Setup](#installation--setup)
8. [Running the Application](#running-the-application)
9. [Application Walkthrough](#application-walkthrough)
10. [API Reference](#api-reference)
11. [Socket.IO Events](#socketio-events)
12. [Core Algorithms](#core-algorithms)
13. [Configuration](#configuration)
14. [How Each Attack Works](#how-each-attack-works)
15. [Frontend Architecture](#frontend-architecture)
16. [Database Schema](#database-schema)
17. [Extending the Project](#extending-the-project)

---

## Overview

PassGuard is designed as an **educational tool** to help users understand why password strength matters. Instead of just showing a colored bar, it:

- **Mathematically computes** password entropy using `H = L x log2(N)`
- **Detects exploitable patterns** (keyboard walks, sequences, leet speak, common words)
- **Runs simulated attacks** against the RockYou breach dataset (~14 million leaked passwords)
- **Shows real-time progress** of each attack via WebSocket streaming
- **Estimates crack times** across three hardware tiers (CPU, GPU, GPU Cluster)
- **Generates personalized recommendations** based on discovered weaknesses

---

## Features

### Password Analysis Engine
- **Entropy Calculation**: Shannon entropy via `H = L x log2(N)` where L = password length, N = character set size
- **Character Composition**: Detects lowercase (a-z), uppercase (A-Z), digits (0-9), special characters
- **Pattern Detection**: Keyboard walks (`qwerty`, `asdf`), sequential characters (`123`, `abc`), repeated characters, date patterns, leet speak (`p@$$w0rd`)
- **Strength Scoring**: 0-100 score with labels (Very Weak / Weak / Fair / Strong / Very Strong)
- **Live Client-Side Preview**: Instant feedback as you type, before server analysis

### Attack Simulation Engine
- **Dictionary Attack**: Scans the full RockYou dataset in MongoDB for exact matches
- **Hybrid Attack**: Takes top 10,000 most common passwords and applies ~230 mutations per word (capitalize, append digits 0-99, common suffixes, leet speak, reverse)
- **Brute Force Simulation**: Mathematical estimation with 30-second animated visualization showing random candidate generation
- **Sequential Orchestration**: Dictionary -> Hybrid -> Brute Force (stops early if found)
- **Cancel Support**: Stop any running attack mid-execution

### Real-Time Visualization
- **Socket.IO WebSockets**: Live attack progress streaming (attempts, rate, current candidate, elapsed time)
- **Progress Bars**: Per-attack animated progress indicators
- **Interactive Charts**: 4 Recharts visualizations (length vs crack time, charset entropy, charset size comparison, attack success rates)

### Crack Time Estimation
- **Three Hardware Tiers**: CPU (1M guesses/sec), GPU (1B guesses/sec), GPU Cluster (100B guesses/sec)
- **Comparison Benchmarks**: Side-by-side comparison against common password types (4-digit PIN, 6-char lowercase, 8-char mixed, etc.)
- **Human-Readable Formatting**: Converts raw seconds to "3.2 million years" etc.

### Security Recommendations
- **Priority-Based**: High / Medium / Low priority recommendations
- **Context-Aware**: Recommendations change based on patterns found and attack outcomes
- **Attack-Informed**: If dictionary/hybrid attacks succeed, specific breach-related warnings are shown

---

## Architecture

```
                  +------------------+
                  |   React Frontend |
                  | (Vite Dev Server)|
                  |   localhost:5173 |
                  +--------+---------+
                           |
              HTTP /api/*  |  WebSocket /socket.io/*
              (proxied)    |  (proxied)
                           v
                  +--------+---------+
                  |   Flask Backend  |
                  |  + Flask-SocketIO|
                  |   localhost:5000 |
                  +--------+---------+
                           |
                           v
                  +--------+---------+
                  |     MongoDB      |
                  | password_platform|
                  |   localhost:27017|
                  +------------------+
```

**Data Flow for Attack Simulation:**

```
1. User clicks "Start Attacks"
2. Frontend sends POST /api/attack/dictionary {password, sessionId}
3. Backend spawns a background thread
4. Thread scans MongoDB, emits Socket.IO events:
   - attack_progress (every 200ms): {attempts, percent, current_word, rate}
   - attack_complete: {found, match, attempts, elapsed_ms, message}
5. Frontend receives events via Socket.IO, updates UI in real-time
6. On completion, frontend triggers next attack (hybrid, then bruteforce)
```

---

## Project Structure

```
Cyber Sec Project/
|
+-- backend/                          # Flask + Socket.IO server
|   +-- app.py                        # Flask factory, MongoDB init, blueprint registration
|   +-- config.py                     # All configuration constants
|   +-- wsgi.py                       # Entry point: python wsgi.py
|   +-- requirements.txt              # Python dependencies
|   |
|   +-- data/
|   |   +-- rockyou_sample.txt        # 496 sample passwords from RockYou dataset
|   |   +-- README.md                 # Dataset attribution
|   |
|   +-- routes/
|   |   +-- analysis_routes.py        # POST /api/analyze
|   |   +-- attack_routes.py          # POST /api/attack/{dictionary,hybrid,bruteforce}
|   |   +-- cracktime_routes.py       # POST /api/crack-time
|   |   +-- visualization_routes.py   # GET  /api/visualization-data
|   |   +-- recommendation_routes.py  # POST /api/recommendations
|   |
|   +-- services/
|   |   +-- analysis_service.py       # Entropy calc, pattern detection, scoring
|   |   +-- dictionary_service.py     # MongoDB scan with Socket.IO progress
|   |   +-- hybrid_service.py         # Top-N words x mutations
|   |   +-- bruteforce_service.py     # 30s animated simulation
|   |   +-- cracktime_service.py      # H = L*log2(N) / guess_rate
|   |   +-- recommendation_service.py # Priority-based security tips
|   |
|   +-- sockets/
|   |   +-- attack_events.py          # Socket.IO event handlers (join, start, stop)
|   |
|   +-- utils/
|       +-- dataset_loader.py         # CLI: import rockyou into MongoDB
|       +-- mutations.py              # Generator yielding ~230 mutations per word
|
+-- frontend/                         # React 19 + Vite 6 + Tailwind CSS 4
|   +-- index.html                    # Entry HTML
|   +-- package.json                  # Dependencies and scripts
|   +-- vite.config.js                # Vite config with proxy + Tailwind plugin
|   |
|   +-- src/
|       +-- main.jsx                  # ReactDOM.createRoot with BrowserRouter
|       +-- App.jsx                   # Route definitions, providers, layout
|       +-- index.css                 # Tailwind CSS import
|       |
|       +-- pages/
|       |   +-- LandingPage.jsx       # /           Hero, features, CTA
|       |   +-- PasswordInputPage.jsx # /input      Password entry + live preview
|       |   +-- AnalysisPage.jsx      # /analysis   Score, entropy, patterns, crack time
|       |   +-- AttackDashboardPage.jsx # /attack-dashboard  Real-time attack panels
|       |   +-- AttackResultsPage.jsx # /attack-results  Summary of all attacks
|       |   +-- CrackTimePage.jsx     # /crack-time  CPU/GPU/Cluster estimates
|       |   +-- VisualizationPage.jsx # /visualizations  4 interactive charts
|       |   +-- RecommendationsPage.jsx # /recommendations  Security tips
|       |
|       +-- components/layout/
|       |   +-- Navbar.jsx            # Responsive nav with mobile hamburger
|       |   +-- Footer.jsx            # Footer with branding
|       |
|       +-- context/
|       |   +-- PasswordContext.jsx    # Global state: password, analysis, attack results
|       |   +-- SocketContext.jsx      # Socket.IO client singleton
|       |
|       +-- services/
|       |   +-- api.js                # Axios instance (baseURL: /api)
|       |
|       +-- utils/
|           +-- formatters.js         # formatDuration(), formatNumber()
|           +-- passwordUtils.js      # analyzeLocally(), getStrengthColor()
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| Flask | 3.1 | Web framework |
| Flask-SocketIO | 5.6 | WebSocket support |
| Flask-CORS | 6.0 | Cross-origin requests |
| PyMongo | 4.16 | MongoDB driver |
| simple-websocket | 1.1 | WebSocket transport |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI library |
| Vite | 6 | Build tool + dev server |
| Tailwind CSS | 4 | Utility-first CSS |
| React Router | 7 | Client-side routing |
| Recharts | 2 | Interactive charts |
| Socket.IO Client | 4.8 | WebSocket client |
| Framer Motion | 12 | Animations |
| React Hot Toast | 2.5 | Toast notifications |
| Axios | 1.8 | HTTP client |
| React Icons | 5.5 | Icon library (HeroIcons) |

### Database
| Technology | Purpose |
|---|---|
| MongoDB | Stores RockYou password dataset, attack logs, test history |

---

## Prerequisites

Before running PassGuard, ensure you have:

1. **Python 3.11+**
   ```bash
   python --version
   ```

2. **Node.js 18+** and **npm**
   ```bash
   node --version
   npm --version
   ```

3. **MongoDB** (Community Edition) running locally on port 27017
   ```bash
   # Verify MongoDB is running
   mongosh --eval "db.runCommand({ping:1})" --quiet
   # Should output: { ok: 1 }
   ```

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Cyber Sec Project"
```

### 2. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

The `requirements.txt` contains:
```
flask
flask-cors
flask-socketio
pymongo
simple-websocket
```

### 3. Install frontend dependencies
```bash
cd frontend
npm install
```

### 4. Load the password dataset into MongoDB
```bash
cd backend
python utils/dataset_loader.py
```

This loads the included `rockyou_sample.txt` (496 passwords) into MongoDB.

**For the full RockYou dataset (~14 million passwords):**
1. Download `rockyou.txt` from public breach archives
2. Place it in `backend/data/rockyou.txt`
3. Run: `python utils/dataset_loader.py --full`

Expected output:
```
Dropping existing 'passwords' collection...
Creating indexes...
Loading passwords from: .../data/rockyou_sample.txt
Done! Inserted 492 passwords in 0.0s
Lines processed: 495
```

---

## Running the Application

### Start the backend (terminal 1)
```bash
cd backend
python wsgi.py
```
Output:
```
 * Serving Flask app 'app'
 * Running on http://127.0.0.1:5000
```

### Start the frontend (terminal 2)
```bash
cd frontend
npm run dev
```
Output:
```
VITE v6.x.x ready
  -> Local: http://localhost:5173/
```

### Open the application
Navigate to **http://localhost:5173** in your browser.

The Vite dev server proxies API requests (`/api/*`) and WebSocket connections (`/socket.io/*`) to the Flask backend on port 5000, so everything works through a single origin.

---

## Application Walkthrough

### Page 1: Landing Page (`/`)
The entry point. Shows the platform's key features in a 4-card grid:
- **Password Analysis** - entropy-based strength evaluation
- **Attack Simulation** - dictionary, hybrid, brute force
- **Crack Time Estimation** - CPU, GPU, cluster benchmarks
- **Visual Reports** - interactive charts and metrics

A step-by-step "How it works" section and a call-to-action button leads to the input page.

### Page 2: Password Input (`/input`)
- Type any password to test
- **Show/hide toggle** for the password field
- **Live client-side analysis** updates as you type:
  - Strength bar with color coding (red -> orange -> yellow -> green -> cyan)
  - Character set indicators: `a-z`, `A-Z`, `0-9`, `!@#`
  - Real-time entropy and charset size display
- Click **"Analyze Password"** to send to the server

**What happens on submit:**
1. `POST /api/analyze` is called with the password
2. Server computes full entropy, patterns, strength score, crack time estimates
3. Response is stored in React context (PasswordContext)
4. A unique session ID is generated (UUID v4) for Socket.IO room isolation
5. User is navigated to the Analysis page

### Page 3: Analysis Results (`/analysis`)
Displays the full server-side analysis:
- **Strength Score** (0-100) with animated progress bar
- **Metrics Panel**: length, charset size, entropy in bits
- **Character Types**: checkmarks for each type present
- **Crack Time Preview**: estimated time on CPU, GPU, and GPU Cluster
- **Pattern Warnings**: yellow alerts for detected patterns (keyboard walks, sequences, leet speak, common words)
- **Actions**: "Run Attack Simulation" or "View Crack Time Details"

### Page 4: Attack Dashboard (`/attack-dashboard`)
The core real-time attack simulation interface.

**Connection indicator** shows Socket.IO status (green = connected).

**Each attack type has a dedicated panel showing:**
- Status badge: Waiting / Running / FOUND / Not Found
- Animated progress bar
- Live metrics: attempts, progress %, rate (attempts/sec), elapsed time
- Current word being tested (updates in real-time)

**Attack flow:**
1. Click **"Start Attacks"** to begin
2. **Dictionary Attack** runs first — scans the entire RockYou dataset
3. If not found, **Hybrid Attack** runs — tests ~230 mutations of top 10K passwords
4. If still not found, **Brute Force Simulation** runs — 30-second visual animation
5. If any attack finds the password, the sequence stops early
6. Click **"Stop"** at any time to cancel the current attack

### Page 5: Attack Results (`/attack-results`)
Summary of all three attack outcomes:
- **Overall verdict**: "Password Compromised" (red) or "Password Survived All Attacks" (green)
- **Per-attack cards** showing: status, attempts, time, rate, and matched word
- Navigation to crack time or recommendations

### Page 6: Crack Time Estimation (`/crack-time`)
Detailed crack time analysis:
- **Three hardware tier cards**:
  - CPU (1 million guesses/sec)
  - GPU (1 billion guesses/sec)
  - GPU Cluster (100 billion guesses/sec)
- **Comparison benchmarks table**: your password vs common password types
  - 4-digit PIN
  - 6-char lowercase
  - 8-char mixed case
  - 8-char full charset
  - 12-char full charset
  - Your password (highlighted)

### Page 7: Visualizations (`/visualizations`)
Four interactive Recharts in a 2x2 grid:
1. **Password Length vs Crack Time** (Line Chart) — log scale, CPU/GPU/Cluster curves for lengths 4-20
2. **Character Set vs Entropy Per Character** (Bar Chart) — digits, lowercase, mixed, alphanumeric, full charset
3. **Character Set Size Comparison** (Horizontal Bar Chart) — pool sizes for each charset type
4. **Attack Type Success Rates** (Grouped Bar Chart) — cracked vs survived counts per attack type

### Page 8: Recommendations (`/recommendations`)
Personalized security tips based on analysis and attack results:
- **High Priority** (red): password too short, keyboard patterns, found in breach databases, leet speak vulnerabilities
- **Medium Priority** (yellow): missing character types, length improvements, passphrase suggestion
- **Low/Suggestion** (blue): enable multi-factor authentication

If the password is strong and survived all attacks, a green "Excellent!" card is shown.

---

## API Reference

### POST `/api/analyze`
Analyze a password's strength.

**Request:**
```json
{
  "password": "MyP@ssw0rd"
}
```

**Response:**
```json
{
  "analysisId": null,
  "length": 10,
  "charset": {
    "uppercase": true,
    "lowercase": true,
    "digits": true,
    "special": true
  },
  "charsetSize": 95,
  "entropy": 65.66,
  "strengthScore": 69,
  "strengthLabel": "Strong",
  "commonPatterns": ["Leet speak substitution of a common word"],
  "suggestions": ["Avoid keyboard walks, sequences, and common words"],
  "crackTimeEstimates": {
    "cpu": { "rate": 1000000, "seconds": 2.98e+13, "display": "34.5 thousand years" },
    "gpu": { "rate": 1000000000, "seconds": 2.98e+10, "display": "34.5 days" },
    "cluster": { "rate": 100000000000, "seconds": 298435.37, "display": "3.5 days" }
  }
}
```

### POST `/api/attack/dictionary`
Start a dictionary attack (runs in background thread).

**Request:**
```json
{
  "password": "123456",
  "sessionId": "uuid-here"
}
```

**Response:**
```json
{
  "message": "Dictionary attack started",
  "sessionId": "uuid-here"
}
```

Results are delivered via Socket.IO events (`attack_progress`, `attack_complete`).

### POST `/api/attack/hybrid`
Start a hybrid mutation attack.

**Request/Response**: Same format as dictionary.

### POST `/api/attack/bruteforce`
Start a brute force simulation.

**Request/Response**: Same format as dictionary.

### POST `/api/crack-time`
Estimate brute force crack time.

**Request:**
```json
{
  "charsetSize": 95,
  "length": 10
}
```

**Response:**
```json
{
  "charsetSize": 95,
  "length": 10,
  "totalCombinations": "5987369392383451904",
  "estimates": {
    "cpu": { "rate": 1000000, "seconds": 2.99e+12, "display": "34.6 thousand years" },
    "gpu": { "rate": 1000000000, "seconds": 2993684696.19, "display": "34.6 days" },
    "cluster": { "rate": 100000000000, "seconds": 29936846.96, "display": "8.3 hours" }
  },
  "comparisonBenchmarks": [
    { "label": "4-digit PIN", "cpuSeconds": 5000, "cpuDisplay": "5.0 seconds", ... },
    { "label": "Your password", "cpuSeconds": 2.99e+12, "cpuDisplay": "34.6 thousand years", ... }
  ]
}
```

### GET `/api/visualization-data`
Get chart data for the visualization page.

**Response:**
```json
{
  "lengthVsCrackTime": [
    { "length": 4, "cpuSeconds": 40612692.5, "gpuSeconds": 40612.69, "clusterSeconds": 406.13 },
    ...
  ],
  "charsetVsSecurity": [
    { "charset": "Digits only", "size": 10, "entropyPerChar": 3.32 },
    { "charset": "Full (with special)", "size": 95, "entropyPerChar": 6.57 }
  ],
  "entropyVsStrength": [],
  "attackTypeVsSuccess": {
    "dictionary": { "total": 0, "found": 0, "successRate": 0 },
    "hybrid": { "total": 0, "found": 0, "successRate": 0 },
    "bruteforce": { "total": 0, "found": 0, "successRate": 0 }
  }
}
```

### POST `/api/recommendations`
Get personalized security recommendations.

**Request:**
```json
{
  "password": "password123",
  "attackResults": {
    "dictionary_found": true,
    "hybrid_found": false,
    "bruteforce_found": false
  }
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "priority": "high",
      "category": "Dictionary",
      "title": "Password exists in breach databases",
      "description": "Your exact password was found in the RockYou breach dataset..."
    },
    {
      "priority": "medium",
      "category": "Complexity",
      "title": "Add special characters",
      "description": "Special characters add 33 possible characters to the pool..."
    },
    {
      "priority": "low",
      "category": "General",
      "title": "Enable multi-factor authentication",
      "description": "Even strong passwords can be compromised. MFA adds..."
    }
  ]
}
```

### GET `/api/health`
Health check endpoint.

**Response:** `{ "status": "ok" }`

---

## Socket.IO Events

### Client -> Server

| Event | Payload | Description |
|---|---|---|
| `join_session` | `{ sessionId: "uuid" }` | Join a room for receiving attack events |
| `start_attack` | `{ attack_type, password, session_id }` | Trigger an attack via WebSocket |
| `stop_attack` | `{ session_id }` | Cancel a running attack |

### Server -> Client

| Event | Payload | Description |
|---|---|---|
| `attack_progress` | `{ attack_type, attempts, total, percent, current_word, rate, elapsed_ms }` | Real-time progress update (emitted every ~200ms) |
| `attack_complete` | `{ attack_type, found, match, attempts, elapsed_ms, message }` | Attack finished (found or exhausted) |

**Room-based isolation**: Each session gets a unique room ID (UUID v4). Attack events are only delivered to the Socket.IO room matching the session ID, so multiple users don't interfere with each other.

---

## Core Algorithms

### Entropy Calculation
```
H = L x log2(N)

Where:
  H = entropy in bits
  L = password length
  N = character set size (sum of active character classes)

Character class sizes:
  Lowercase (a-z):    26
  Uppercase (A-Z):    26
  Digits (0-9):       10
  Special (!@#$...):  33
```

**Example**: `Pa$$w0rd` (8 chars, all classes)
- N = 26 + 26 + 10 + 33 = 95
- H = 8 x log2(95) = 8 x 6.57 = 52.56 bits

### Strength Scoring
```
base_score = min(100, entropy x 1.2)
penalty    = detected_patterns_count x 10
final_score = max(0, round(base_score - penalty))

Labels:
  0-19:   Very Weak
  20-39:  Weak
  40-59:  Fair
  60-79:  Strong
  80-100: Very Strong
```

### Crack Time Estimation
```
Total Combinations = N^L
Average Attempts   = N^L / 2    (expected value for random search)
Time (seconds)     = Average Attempts / Guess Rate

Hardware tiers:
  CPU:         1,000,000 guesses/sec
  GPU:         1,000,000,000 guesses/sec
  GPU Cluster: 100,000,000,000 guesses/sec
```

### Pattern Detection
The analysis service checks for these patterns:
1. **Keyboard walks**: `qwerty`, `asdf`, `zxcv`, `qazwsx`, etc.
2. **Sequential characters**: `abc`, `123`, `456`, etc.
3. **Repeated characters**: 3+ of the same character in a row (e.g., `aaa`)
4. **Date patterns**: `DD/MM/YYYY`, `YYYYMMDD` formats
5. **Leet speak**: De-leets the password (`@`->`a`, `3`->`e`, etc.) and checks if the result is a common word
6. **Common words**: Direct match against a list of 23 most commonly used passwords

---

## Configuration

All configuration constants are in `backend/config.py`:

```python
# MongoDB connection
MONGODB_URI = "mongodb://localhost:27017"
DATABASE_NAME = "password_platform"
COLLECTION_NAME = "passwords"

# File paths for datasets
ROCKYOU_SAMPLE_PATH = "backend/data/rockyou_sample.txt"
ROCKYOU_FULL_PATH = "backend/data/rockyou.txt"

# Hardware guess rates (guesses per second)
HARDWARE_SPEEDS = {
    "cpu":     1_000_000,           # 1 million/sec
    "gpu":     1_000_000_000,       # 1 billion/sec
    "cluster": 100_000_000_000,     # 100 billion/sec
}

# Dictionary attack batch size for progress emission
DICT_BATCH_SIZE = 5000

# Hybrid attack: how many top passwords to use as base words
HYBRID_TOP_COUNT = 10000

# Socket.IO progress throttle (milliseconds)
PROGRESS_INTERVAL_MS = 200

# Brute force animation duration (seconds)
BRUTEFORCE_ANIMATION_SECONDS = 30
```

### Vite Proxy Configuration (`frontend/vite.config.js`)

```javascript
server: {
  proxy: {
    '/api':       { target: 'http://localhost:5000', changeOrigin: true },
    '/socket.io': { target: 'http://localhost:5000', changeOrigin: true, ws: true },
  }
}
```

This ensures the frontend dev server forwards API and WebSocket requests to the Flask backend, avoiding CORS issues during development.

---

## How Each Attack Works

### 1. Dictionary Attack (`dictionary_service.py`)

**Strategy**: Scan the entire RockYou password collection for an exact match.

**Process:**
1. Do an indexed MongoDB lookup first (`find_one`) to know if the password exists
2. Regardless, iterate through the collection sorted by `line_number` to simulate scanning
3. Emit `attack_progress` events every 200ms with: attempts, percent, current word, rate
4. If the indexed match is found at the current scan position, emit `attack_complete` with `found: true`
5. If full scan completes without match, emit `attack_complete` with `found: false`

**Why the indexed lookup?** It gives instant knowledge of the answer while still providing the visual experience of watching the scan progress. The attack stops at the exact database position where the password lives, creating a realistic demonstration.

### 2. Hybrid Attack (`hybrid_service.py`)

**Strategy**: Take the top N most common passwords and apply common mutations that real attackers use.

**Process:**
1. Fetch top 10,000 passwords from MongoDB (sorted by line_number, lower = more common)
2. For each base word, generate ~230 mutations via `utils/mutations.py`:
   - Original, Capitalized, UPPER
   - Append digits 0-99 (original + capitalized = 200 variants)
   - Append common suffixes: `!`, `!!`, `?`, `#`, `@`, `123`, `1234`, `!@#`, `1`, `12` (20 variants)
   - Leet speak: `a`->`@`, `e`->`3`, `i`->`1`, `o`->`0`, `s`->`$`, `t`->`7`, `l`->`1` (+ digits = ~13 variants)
   - Reversed (2 variants)
3. Compare each mutation against the target password
4. Emit progress events throughout
5. Total candidates: ~10,000 x 230 = ~2.3 million attempts

**Example mutations for base word `password`:**
```
password, Password, PASSWORD,
password0, password1, ..., password99,
Password0, Password1, ..., Password99,
password!, password!!, password123, password1234,
p@$$w0rd, P@$$w0rd, p@$$w0rd0, ...,
drowssap, Drowssap
```

### 3. Brute Force Simulation (`bruteforce_service.py`)

**Strategy**: Mathematical estimation + visual animation. Does NOT actually enumerate all combinations.

**Process:**
1. Calculate the total keyspace: `charset_size ^ length`
2. Compute crack time estimates for all three hardware tiers
3. Generate a deterministic "discovery fraction" using SHA-256 of the password (consistent results for same password)
4. Run a 30-second animation loop:
   - Generate random candidate strings for visual effect
   - Simulate attempt count based on elapsed time fraction
   - Emit progress events every 100ms
5. Always completes with `found: false` (brute force is theoretical)
6. Final message shows: "Would require X (CPU) to Y (GPU Cluster)"

**Why simulated?** Actual brute force of even an 8-character password with full charset (95^8 = 6.6 quadrillion combinations) would take years on a real CPU. The simulation demonstrates the concept visually while providing the mathematical facts.

---

## Frontend Architecture

### State Management

**PasswordContext** (`context/PasswordContext.jsx`):
```
State:
  - password: string         (the raw password being tested)
  - analysisResult: object   (server analysis response)
  - attackResults: {         (results from each attack)
      dictionary: object | null,
      hybrid: object | null,
      bruteforce: object | null
    }
  - sessionId: string        (UUID v4 for Socket.IO room)

Actions:
  - setPassword, setAnalysisResult, setAttackResults, setSessionId
  - reset()  (clears everything for a new password test)
```

**SocketContext** (`context/SocketContext.jsx`):
```
State:
  - socket: Socket.IO client instance
  - isConnected: boolean

Initialization:
  - Connects to `/` with transports: ['websocket', 'polling']
  - Auto-reconnects on disconnect
```

### Routing (`App.jsx`)

| Route | Page Component | Guard |
|---|---|---|
| `/` | LandingPage | None |
| `/input` | PasswordInputPage | None |
| `/analysis` | AnalysisPage | Redirects to `/input` if no analysisResult |
| `/attack-dashboard` | AttackDashboardPage | Redirects to `/input` if no password/sessionId |
| `/attack-results` | AttackResultsPage | Redirects to `/input` if no password |
| `/crack-time` | CrackTimePage | Redirects to `/input` if no password |
| `/visualizations` | VisualizationPage | None (uses server data) |
| `/recommendations` | RecommendationsPage | Redirects to `/input` if no password |

### Client-Side Analysis (`utils/passwordUtils.js`)

A lightweight version of the server analysis runs locally for instant feedback:
```
analyzeLocally(password) -> {
  length, charsetSize, entropy, score, label,
  hasLower, hasUpper, hasDigit, hasSpecial
}
```

This powers the live strength bar on the input page. The full server analysis (with pattern detection and multi-tier crack time) happens on form submission.

---

## Database Schema

### Collection: `passwords`
Stores the RockYou password dataset.

```javascript
{
  _id: ObjectId,
  password: "123456",       // The password string
  line_number: 1            // Position in original file (lower = more common)
}

Indexes:
  - password: unique        // For fast dictionary lookups
  - line_number: ascending  // For sorted scanning
```

### Collection: `attack_logs` (auto-created)
Stores attack results for visualization statistics.

```javascript
{
  _id: ObjectId,
  attackType: "dictionary",   // dictionary | hybrid | bruteforce
  status: "found",            // found | not_found
  // ... additional metadata
}
```

### Collection: `test_history` (auto-created)
Stores historical test data for entropy vs strength charts.

```javascript
{
  _id: ObjectId,
  entropy: 52.56,
  strengthLabel: "Strong",
  passwordLength: 8,
  testedAt: ISODate
}
```

---

## Extending the Project

### Adding the Full RockYou Dataset
1. Download `rockyou.txt` (~140MB, ~14 million passwords)
2. Place in `backend/data/rockyou.txt`
3. Run: `python utils/dataset_loader.py --full`
4. Loading takes 2-5 minutes depending on disk speed

### Adding New Attack Types
1. Create a new service in `backend/services/` (e.g., `rainbow_service.py`)
2. Implement a function: `def run_rainbow_attack(password, session_id, socketio):`
3. Add a route in `backend/routes/attack_routes.py`
4. Add a case in `_launch_attack()` and `attack_events.py`
5. Add a panel in `AttackDashboardPage.jsx`

### Adding New Mutation Rules
Edit `backend/utils/mutations.py`:
```python
def generate_mutations(word):
    # Add your new mutations:
    yield word + "2024"           # Append year
    yield word.replace("o", "0")  # Custom substitution
```

### Adjusting Hardware Speeds
Edit `backend/config.py`:
```python
HARDWARE_SPEEDS = {
    "cpu":     1_000_000,
    "gpu":     10_000_000_000,     # Updated to 10B for modern GPUs
    "cluster": 1_000_000_000_000,  # 1 trillion for large clusters
}
```

### Building for Production
```bash
# Build the frontend
cd frontend
npm run build

# The built files are in frontend/dist/
# Serve them with Flask or a reverse proxy (nginx)
```

---

## License

This project is built for educational purposes to demonstrate password security concepts. The RockYou dataset used is from a publicly disclosed data breach (2009) and is widely available for security research.

**Disclaimer**: This tool is intended for educational use only. Do not use attack techniques against systems you do not own or have explicit authorization to test.
