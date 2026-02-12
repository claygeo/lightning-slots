# Lightning Slots

A full-featured browser-based slot machine game built with Next.js, featuring a custom game engine with proper slot mathematics, a Lightning Round bonus mechanic, player progression, Supabase-backed leaderboards, and Framer Motion animations. Designed as a mobile-first social casino experience.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Configuration](#environment-configuration)
- [Game Mechanics](#game-mechanics)
- [Authentication & Leaderboards](#authentication--leaderboards)
- [Game Engine Architecture](#game-engine-architecture)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Project Structure](#project-structure)

## Features

- **Custom Slot Engine**: 5×3 reel grid with 20 paylines, configurable reel strips, and proper symbol distribution
- **Realistic Game Math**: 96% target RTP, 18% hit frequency, medium volatility with streak prevention
- **Lightning Round Bonus**: Power meter charges on consecutive wins, triggering a coin-catching mini-game with up to 10× multiplier
- **Player Progression**: XP-based leveling system (100 levels), unlockable achievements, and stat tracking
- **Supabase Integration**: Cloud-saved player profiles, PIN-based authentication, and real-time leaderboards
- **Animated UI**: Framer Motion reel spin animations, win celebrations, confetti effects, and floating elements
- **Sound System**: Howler.js-powered audio with separate SFX/music toggles and contextual sound effects
- **Flexible Betting**: 10 bet levels from $0.10 to $100 with quick-select options and balance-aware max bet
- **Mobile-First Design**: Responsive layout optimized for mobile play with touch-friendly controls
- **Auto-Play**: Configurable auto-spin with adjustable speed settings
- **State Persistence**: Zustand store with localStorage persistence for offline play

## Prerequisites

Before setting up the project, ensure you have the following:

- **Node.js (v18+) and npm**: Install from [nodejs.org](https://nodejs.org)
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- **Supabase Account** (optional): For cloud saves and leaderboards — the game works offline without it
- **Git**: For cloning the repository

## Setup

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lightning-slots.git
cd lightning-slots
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template and configure your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key. The game runs fully offline without these — cloud saves and leaderboards simply won't be available.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
```

## Environment Configuration

The application uses environment variables for Supabase connectivity:

```bash
# Supabase Configuration (optional — game works offline without these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Database Schema

If using cloud saves, create a `players` table with the following columns:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | Primary key |
| username | text | — | Unique player name |
| pin_hash | text | — | SHA-256 hashed 4-digit PIN |
| balance | numeric | 1000 | Current credit balance |
| level | integer | 1 | Player level |
| experience | integer | 0 | Current XP |
| total_spins | integer | 0 | Lifetime spin count |
| total_wins | integer | 0 | Lifetime win count |
| biggest_win | numeric | 0 | Largest single win |
| achievements | jsonb | [] | Unlocked achievement IDs |
| created_at | timestamptz | now() | Account creation |
| updated_at | timestamptz | now() | Last progress save |
| last_seen | timestamptz | now() | Last login |

## Game Mechanics

### Reel Configuration

The game uses a 5×3 grid with 20 symbols per reel strip. Symbol distribution is weighted to produce balanced outcomes:

| Symbol | Distribution | 3× Payout | 4× Payout | 5× Payout | Role |
|--------|-------------|-----------|-----------|-----------|------|
| 🍒 Cherry | 40% (low) | 1× | 3× | 6× | Low pay |
| 🍋 Lemon | 40% (low) | 2× | 5× | 10× | Low pay |
| 🔔 Bell | 30% (medium) | 3× | 8× | 20× | Medium pay |
| 🟦 Bar | 30% (medium) | 5× | 15× | 35× | Medium pay |
| 7️⃣ Seven | 20% (high) | 10× | 30× | 75× | High pay |
| 💎 Diamond | 10% (wild) | 25× | 100× | 250× | Wild / Jackpot |

### Paylines

20 paylines covering standard patterns: horizontal lines, V-shapes, W-shapes, zigzags, diagonals, waves, and specialty shapes (diamond, hourglass, cross, L-shape, J-shape).

### Lightning Round

Consecutive wins charge a power meter (10 segments). When full, a 5-second coin-catching mini-game activates where falling coins grant multiplier boosts up to 10×. The earned multiplier applies to subsequent spins.

### Win Categories

| Category | Multiplier Range | Effect |
|----------|-----------------|--------|
| WIN | 0–3× | Standard notification |
| NICE WIN | 3–15× | Enhanced display |
| BIG WIN | 15–50× | Big win sound |
| MEGA WIN | 50–150× | Confetti + big win sound |
| JACKPOT | 150×+ | Full confetti + jackpot sound |

### Achievements

| Achievement | Target | Reward |
|-------------|--------|--------|
| First Spin | 1 spin | 50 XP |
| Lucky Seven | Three 7s in a row | 100 coins |
| Lightning Master | 10 Lightning Rounds | 2× multiplier |
| High Roller | Place a max bet | 100 XP |
| Winning Streak | 5 consecutive wins | 500 coins |

## Authentication & Leaderboards

The game uses a lightweight PIN-based auth system backed by Supabase:

- **Sign Up**: Choose a username and 4-digit PIN
- **Sign In**: Username + PIN verification against SHA-256 hash
- **Leaderboards**: Ranked by level, balance, or biggest win
- **Cloud Saves**: Progress syncs to Supabase on key events

### Security Considerations

**Important**: This is a social casino authentication system — not production-grade:

- PINs are hashed client-side with SHA-256 + salt before storage
- No server-side session management or JWT tokens
- Supabase Row Level Security should be configured for production use
- Suitable for social/demo casino apps, not real-money gambling

## Game Engine Architecture

The slot engine is built with proper gambling mathematics:

### Core Components

- **SlotEngine**: Manages reel strips, generates outcomes based on hit frequency (18%), and tracks RTP
- **WinlineChecker**: Evaluates all 20 paylines for matching symbols, handles wild substitutions
- **RandomNumberGenerator**: Uses `crypto.getRandomValues()` for cryptographically secure randomness with `Math.random()` fallback
- **PayoutCalculator**: Computes win amounts with bet multipliers and lightning round bonuses

### RTP Control

- **Target RTP**: 96% (86% base game + 10% bonus)
- **Hit Frequency**: 18% (~1 in 5.5 spins)
- **Volatility**: Medium
- **Max Win**: 5,000× bet
- **Streak Prevention**: Tracks last 10 results, 70% chance to break streaks of 3+ consecutive wins

## Development

### Key Technologies

- **Next.js 14**: App Router with server/client components
- **React 18**: Hooks, context, and concurrent features
- **TypeScript**: Full type coverage across game engine and UI
- **Zustand**: Lightweight state management with localStorage persistence
- **Framer Motion**: Reel spin animations, page transitions, and win celebrations
- **Supabase**: PostgreSQL backend for player data and leaderboards
- **Howler.js**: Cross-browser audio engine for game sounds
- **canvas-confetti / react-confetti**: Win celebration effects
- **CSS Modules + Tailwind**: Scoped component styles with utility classes

### Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Run production server
npm run lint       # Run ESLint
npm test           # Run Jest tests
npm run test:watch # Run tests in watch mode
```

## Production Deployment

### Netlify (Configured)

The project includes a `netlify.toml` with Next.js plugin configuration, security headers, and static asset caching:

```bash
npm run build
# Deploy dist via Netlify CLI or Git integration
```

### Other Platforms

- **Vercel**: Zero-config Next.js deployment
- **Self-hosted**: `npm run build && npm start` behind Nginx/Apache

### Production Considerations

- **HTTPS**: Required for `crypto.subtle` API used in PIN hashing
- **Supabase RLS**: Enable Row Level Security policies on the `players` table
- **Environment Variables**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your hosting platform
- **Asset Caching**: Sound and image files are configured for immutable caching via Netlify headers

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── game/               # Main game page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Landing page with animations
├── components/
│   ├── game/               # Game components
│   │   ├── SlotMachine.tsx  # Main reel grid and spin logic
│   │   ├── ReelStrip.tsx    # Individual animated reel
│   │   ├── Symbol.tsx       # Symbol rendering with effects
│   │   ├── LightningRound.tsx # Coin-catching bonus game
│   │   ├── PowerMeter.tsx   # Lightning charge indicator
│   │   ├── WinDisplay.tsx   # Win amount animations
│   │   ├── Paylines.tsx     # Payline overlay rendering
│   │   └── PaylineIndicators.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx       # Top bar with balance/settings
│   │   ├── Footer.tsx       # Bottom navigation
│   │   └── MobileContainer.tsx # Responsive wrapper
│   └── ui/                 # Shared UI components
│       ├── BettingControls.tsx # Bet selection and spin button
│       ├── Balance.tsx      # Animated balance display
│       ├── LevelProgress.tsx # XP bar and level indicator
│       ├── Leaderboard.tsx  # Rankings display
│       ├── LoginModal.tsx   # Auth modal (sign in/up)
│       ├── AchievementPopup.tsx # Achievement unlock toast
│       ├── Modal.tsx        # Base modal component
│       ├── Button.tsx       # Styled button variants
│       └── Spinner.tsx      # Loading indicator
├── constants/
│   ├── config.ts            # Game config, symbols, reels, paylines
│   └── payouts.ts           # Payout tables and win calculations
├── contexts/
│   └── AuthContext.tsx       # Supabase auth provider
├── hooks/
│   ├── useAnimation.ts      # Reel spin animation state
│   ├── useBalance.ts        # Balance formatting and updates
│   ├── useGameState.ts      # Game state convenience hook
│   └── useSound.ts          # Sound effect triggers
├── lib/
│   ├── audio/
│   │   └── SoundManager.ts  # Howler.js audio controller
│   ├── game-engine/
│   │   ├── SlotEngine.ts    # Core spin logic and RTP control
│   │   ├── WinlineChecker.ts # Payline evaluation
│   │   ├── PayoutCalculator.ts # Win amount computation
│   │   └── RandomNumberGenerator.ts # Crypto-secure RNG
│   └── supabase.ts          # Supabase client and auth/progress services
├── store/
│   └── gameStore.ts         # Zustand store with persistence
├── styles/                  # CSS Modules for each component
├── types/
│   └── index.ts             # TypeScript type definitions
└── utils/
    ├── animations.ts        # Animation helper functions
    ├── formatters.ts        # Number/currency formatting
    ├── helpers.ts           # General utility functions
    └── validators.ts        # Input validation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
