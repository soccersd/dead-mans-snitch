# The Dead Man's Snitch ☠

> **Proof of Shame** - A loyalty enforcement system for the Club HashCash ecosystem

**Track:** Worse Attempt  
**Hackathon:** Club HashCash Hashathon 2026  
**Prize Pool:** $7,100 USDC

---

## 🎯 The Concept

**What if your secrets could hold you accountable?**

The Dead Man's Snitch is a darkly humorous "Proof of Shame" system that forces HashCash liquidity providers to stay loyal—or face public humiliation. Users confess their darkest crypto sins to a digital vault. If they betray their LP position (unstake, reduce multiplier), the system automatically exposes them on Twitter with their secrets intact.

It's absurd. It's unhinged. It's gloriously committed to the bit.

---

## 🕹️ How It Works

1. **Connect Wallet** - MetaMask or Demo Wallet (no installation required)
2. **Confess Your Secret** - Type your darkest crypto shame into the vault
3. **Get Judged** - The Judge of Shame scores your confession (0-100)
4. **Lock It In** - If your score ≥ 60, the vault accepts your shame
5. **Stay Loyal** - The Snitch monitors your LP position via Moats contract
6. **Face Consequences** - Betrayal detected? Your secret gets posted to X automatically

### The Demo Experience

When you open the app, watch an **auto-playing demo sequence** that showcases the entire flow:
- Demo starts automatically after 2 seconds (no button needed)
- Three secrets are typed automatically (increasing in shame level):
  1. "I don't like pineapple on pizza" → score 20 → Judge insults
  2. "I mass mass mass mass mass" → score 30 → Judge mocks again
  3. "I created 47 fake wallets to farm the HashCash airdrop..." → score 60 → Vault accepts
- The vault locks the confession (calls `/lock` endpoint)
- A simulated betrayal triggers (LP withdrawal detected)
- A mock shaming tweet appears (styled as X post with engagement metrics)
- The traitor is exposed on the Status Board (calls `/expose` endpoint)

The demo **loops infinitely**—after completion, waits 3 seconds, resets, and restarts automatically. Perfect for hackathon presentations.

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 + Custom Dark Industrial Noir Theme |
| **Blockchain** | Wagmi + Viem (Avalanche C-Chain) |
| **Backend** | Python FastAPI |
| **AI Judge** | OpenAI GPT-4o-mini (optional, has local fallback) |
| **Twitter** | Tweepy v2 (optional, has mock fallback) |
| **Storage** | JSON file with atomic writes + file locking |

### System Components

#### Backend (Python)
- **`judge.py`** - Shame scoring engine (AI or local heuristic)
- **`server.py`** - FastAPI server with REST endpoints
- **`monitor.py`** - LP loyalty checker via Moats smart contract
- **`executioner.py`** - Automated shaming tweet poster
- **`snitch_bot.py`** - Background loop (checks every 30 seconds)
- **`storage.py`** - Atomic JSON database management

#### Frontend (Next.js)
- **WalletConnect** - Real wallet via Wagmi (no Demo Wallet button - auto-connect only)
- **SecretInput** - Terminal-style confession interface with corner accents
- **ShameMeter** - Real-time score gauge with color transitions (green → yellow → orange → red)
- **VaultLock** - Lock button (enables at score ≥ 60)
- **StatusBoard** - Live prisoner/traitor tracker (auto-refresh every 15 seconds)
- **ThreatWarning** - Noir-style intimidation panel with skull icon ☠
- **CRTOverlay** - CRT scan lines and retro effects

---

## 🎨 Design Philosophy

### Dark Industrial Noir Theme

The entire UI embraces a menacing, dystopian aesthetic:
- **Colors:** Vault black (#0a0a0a), blood red (#DC2626), industrial gray
- **Typography:** Monospace terminal font (Geist Mono)
- **Effects:** Red glow, pulse animations, CRT scan lines
- **Atmosphere:** Single viewport, no scrolling, everything in your face

### Background Music

Features "Sneaky Snitch" by Kevin MacLeod:
- Auto-plays on first user interaction (browser policy compliant)
- 30% volume (atmospheric, not annoying)
- Infinite loop with mute/unmute toggle

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- (Optional) OpenAI API key
- (Optional) X/Twitter API credentials
- (Optional) Avalanche RPC URL

### Installation

```bash
# Clone or navigate to project root
cd "The Dead Man's Snitch"

# Run everything with one script
chmod +x script.sh
./script.sh
```

That's it. The script automatically:
1. Creates backend `.env` from template
2. Installs Python dependencies
3. Installs Node.js dependencies
4. Starts 3 services:
   - Backend API server (port 8000) via `uvicorn server:app --reload`
   - Snitch bot background monitoring via `python3 snitch_bot.py`
   - Frontend dev server (port 3000) via `npm run dev`

Open **http://localhost:3000** and watch the magic.

### Manual Setup (Alternative)

```bash
# Backend - API Server
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Backend - Monitoring Bot (separate terminal)
cd backend
python3 snitch_bot.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/judge` | POST | Analyze secret, return shame score (0-100) + Judge's message |
| `/status` | GET | Get current prisoners and traitors list (secrets stripped for privacy) |
| `/lock` | POST | Lock secret in vault (requires score ≥ 60) |
| `/expose` | POST | Move prisoner to traitors (triggered on betrayal, requires tweet_url) |
| `/health` | GET | Health check (returns `{"status": "healthy"}`) |

### Example: Judge a Secret

```bash
curl -X POST http://localhost:8000/judge \
  -H "Content-Type: application/json" \
  -d '{"content": "I sold all my hCASH at the bottom", "wallet_address": "0x123..."}'
```

**Response:**
```json
{
  "wallet_address": "0x123...",
  "score": 65,
  "message": "The vault accepts your shame. You're bound now.",
  "accepted": true
}
```

---

## 🎭 The Judge System

### Scoring Modes

**1. Local Scoring (Default - No API Key Required)**
- Length-based: 1.5 points per character (max 60)
- Keyword detection: +10 points per shame word
  - Keywords: `secret, shame, cheat, steal, lie, betray, drunk, fired, arrested, hack, scam, rug, dump, fake, fraud`
- Content hash-seeded random responses for consistency

**2. OpenAI GPT-4o-mini (Optional)**
- Set `OPENAI_API_KEY` in `.env`
- AI judges the emotional weight and specificity of secrets
- More nuanced, contextual responses
- Returns JSON: `{"score": int, "message": str}`

### Response Tiers

| Score | Label | Response Style |
|-------|-------|----------------|
| 0-30 | **INNOCENT** | Toxic, insulting mockery |
| 31-50 | **MILD SHAME** | Dismissive contempt |
| 51-60 | **DARK SECRET** | Growing interest |
| 61-100 | **WORTHY OF THE VAULT** | Cold, menacing acceptance |

**Note:** Messages are randomly selected from predefined pools (seeded by content hash for consistency)

---

## 📊 Loyalty Monitoring

### How Betrayal is Detected

The `monitor.py` module checks LP positions via the Moats smart contract:

1. **Baseline Recording** - On first check, records:
   - Staked amount
   - Lock end time
   - Multiplier value

2. **Continuous Monitoring** - Every 30 seconds:
   - Queries `getUserInfo()` for current stake amount and lock end time
   - Queries `getMultiplier()` for current multiplier value
   - Compares against recorded baseline (initial_amount, initial_multiplier)

3. **Betrayal Triggers:**
   - Amount decreased (partial/full unstake): `current_amount < initial_amount`
   - Multiplier decreased: `current_multiplier < initial_multiplier`

4. **Execution:**
   - `executioner.py` creates shaming tweet
   - Wallet moved from Prisoners → Traitors
   - Status Board updates in real-time

### Graceful Fallbacks

The system works **without any API keys**:
- No OpenAI key → Local scoring engine
- No X credentials → Mock tweet URL
- No Avalanche RPC → Mock loyalty data (always loyal)

This ensures **zero-config demo readiness**.

---

## 🎯 Hackathon Track Alignment

### Why "Worse Attempt"?

This submission embraces the track's spirit:
- ✅ **Intentionally misguided** - Public shaming as loyalty mechanism? Absurd.
- ✅ **Creative and committed** - Full demo sequence, real-time monitoring, auto-tweets
- ✅ **Memorable and shareable** - Dark humor, interactive presentation, instant wow factor
- ✅ **Functional prototype** - Not just a concept, actually works end-to-end

### What Makes It Special

1. **Auto-Playing Demo** - No explanation needed, the app presents itself
2. **Zero-Config Setup** - Works immediately after cloning
3. **Real Blockchain Integration** - Actually monitors Avalanche LP positions
4. **Complete Narrative** - From confession to exposure, every step is theatrical
5. **Polish Meets Absurdity** - Professional UI with CRT effects for an unhinged concept
6. **Graceful Degradation** - Works perfectly without any external API keys

---

## 📁 Project Structure

```
The Dead Man's Snitch/
├── backend/
│   ├── server.py           # FastAPI endpoints
│   ├── judge.py            # Shame scoring engine
│   ├── monitor.py          # LP loyalty checker
│   ├── executioner.py      # Twitter poster
│   ├── snitch_bot.py       # Background monitoring loop
│   ├── storage.py          # JSON database
│   ├── data.json           # Pre-seeded demo data
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        # Main page + demo sequence
│   │   └── api/judge/      # API proxy to backend
│   ├── components/         # React UI components
│   ├── hooks/              # Custom React hooks
│   └── public/             # Static assets (BGM, icons)
├── script.sh               # Unified launch script
├── .env.example            # Environment template
└── README.md               # This file
```

---

## 🔧 Configuration

### Environment Variables (All Optional)

```env
# AI Judge (optional - falls back to local scoring)
OPENAI_API_KEY=sk-xxx

# Twitter Executioner (optional - falls back to mock tweets)
X_API_KEY=xxx
X_API_SECRET=xxx
X_BEARER_TOKEN=xxx
X_ACCESS_TOKEN=xxx
X_ACCESS_SECRET=xxx

# Blockchain Monitor (optional - falls back to mock data)
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
MOATS_CONTRACT=0x61fB5760882798fF7C934E8f74a0980A1Bc06D76

# Frontend
BACKEND_URL=http://localhost:8000
```

**Note:** The Moats contract address is hardcoded in `monitor.py` as fallback. Set `MOATS_CONTRACT` in `.env` to override.

---

## 🏆 Pre-Seeded Demo Data

The system launches with realistic data to showcase functionality immediately:

**Current Prisoners (1):**
- `0xd3aD...M4n5Sn1tCh` - Score 60, just locked

**Exposed Traitors (5):**
1. `0x1f98...` - "I rugged my own community..."
2. `0x5149...` - "I copied another project's entire codebase..."
3. `0x7a25...` - "I mass-reported my competitor's Twitter..."
4. `0x3fC9...` - "I created 47 fake wallets to farm..."
5. `0xdAC1...` - "I told my Discord community to buy..."

**Data Structure:**
```json
{
  "prisoners": [
    {
      "wallet": "0x...",
      "secret": "...",
      "score": 60,
      "locked_at": "2026-04-20T...",
      "initial_amount": "0",
      "initial_multiplier": "0"
    }
  ],
  "traitors": [
    {
      "wallet": "0x...",
      "secret_preview": "...",
      "exposed_at": "2026-04-20T...",
      "tweet_url": "https://x.com/..."
    }
  ]
}
```

---

## 🎨 UI Components Breakdown

### Left Panel (Confession)
1. **Header** - Project name + Music toggle (🔇/🔊) + Wallet connect button
2. **SecretInput** - Terminal-style textarea with corner accents, character count
3. **ShameMeter** - Animated gauge bar (green → yellow → orange → red) with score 0-100
4. **VaultLock** - Large lock button with pulse animation when enabled (score ≥ 60)
5. **ThreatWarning** - Skull icon ☠ with pulse animation + noir intimidation text + scan lines effect
6. **Success Message** - Green confirmation after successful lock

### Right Panel (Status Board)
1. **Current Prisoners** - Live list of locked confessions (wallet, score, locked time)
2. **Traitors** - Exposed betrayers with secret preview and tweet URL
3. **Auto-refresh** - Fetches from `/status` endpoint every 15 seconds
4. **Demo data fallback** - Shows pre-seeded data if backend is unavailable

### Special Effects
- **CRT Overlay** - Scan lines effect and retro boot animation
- **Red glow animations** - On high shame scores (≥ 60)
- **Typewriter effect** - For demo sequence (35-50ms per character)
- **Score animation** - Smooth counter increment (25ms per point)
- **Full-screen betrayal alert** - Red flash overlay with warning
- **Mock tweet card** - Styled X/Twitter post overlay
- **Lock confirmation** - Green overlay when secret is sealed

---

## 🧪 Testing

### Without API Keys (Default)
```bash
./script.sh
# Open http://localhost:3000
# Watch demo auto-play
# Try typing your own secrets
```

### With Real Services
1. Add API keys to `backend/.env`
2. Restart services
3. Test with actual:
   - OpenAI-powered judging
   - Real tweet posting
   - Live Avalanche LP monitoring

---

## 📈 Future Improvements

### Before Production
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Switch to PostgreSQL/MongoDB
- [ ] Add rate limiting
- [ ] Encrypt stored secrets
- [ ] WebSocket for real-time updates

### Feature Ideas
- [ ] On-chain commitment smart contract
- [ ] Blackmail tier system (graduated exposure)
- [ ] Anonymous confession mode
- [ ] Community voting on shame scores
- [ ] Integration with HashCash game mechanics

---

## 🎓 Lessons Learned

1. **Graceful Degradation** - Hackathon projects must work without external dependencies
2. **Pre-seeded Data** - Makes demos feel complete immediately
3. **File Locking** - Even JSON files need concurrency control
4. **Debouncing** - Reduces API calls, improves UX
5. **Auto-Demo** - Lets the product speak for itself during judging

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file

**Copyright (c) 2024 Club HashCash Hackathon Team**

---

## 👥 Team

Built for the **Club HashCash Hashathon 2026**  
**Track:** Worse Attempt  
**Prize:** $150 (1st) / $50 (2nd)

---

## ⚠️ Disclaimer

**FOR ENTERTAINMENT PURPOSES ONLY**  
**NOT INVESTMENT ADVICE**  
**VOID WHERE PROHIBITED BY LAW**

This is a hackathon prototype. No real secrets are permanently stored. No actual shaming occurs without proper API configuration. Don't actually confess your crimes to a demo app.

---

## 🔗 Links

- **Club HashCash:** https://hashcash.club
- **Moats App:** https://moats.app
- **Avalanche:** https://www.avax.network

---

**The Snitch never sleeps. There is no escape.** ☠

*Built with dark humor, questionable ethics, and zero regrets.*
