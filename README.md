# 🥗 GymFood

> Most fitness apps are built for people who already have everything figured out. GymFood is for everyone else.

---

## The Problem

Anyone who's trained seriously knows the friction.

You open a food delivery app — it's built for cravings, not macros. You look for a nutritionist — it's hundreds per session and booked two weeks out. You join a fitness community online — the advice is scattered, contradictory, and buried under noise.

The three things a serious gym-goer needs most — **clean food, real community, and expert guidance** — live in completely separate places. Each with their own cost, their own learning curve, their own inconvenience.

**GymFood puts all three in one place.**

---

## What It Does

| Feature | What it actually means |
|---|---|
| 🛒 **Healthy Meal Ordering** | A curated food delivery experience built around fitness nutrition — not just "salad options" slapped on a generic menu |
| 💬 **Fitness Community** | A focused forum for people who speak your language — macros, meal prep, training splits, recovery |
| 🤖 **AI Coaching** | Chat with an AI coach (powered by Gemini) that responds with the depth of a certified professional — available anytime, no booking required |
| 📋 **Order & Session History** | All your past meals and consultations in one place |
| 👤 **Profile Management** | Preferences, goals, account settings — everything in one spot |

---

## Why I Built This

This started as a portfolio project, but the problem it solves is real.

Fitness apps are either too broad (generic food delivery) or too niche (obsessive calorie trackers). The missing piece is an app that respects that fitness is a *lifestyle* — not just a macro number to hit. Food, community, and coaching all feed into each other. Separating them creates drop-off.

The design goal: make all three feel like they belong in the same place, not three apps stitched together.

---

## Tech Stack — and Why

| Technology | Why this, not the alternative |
|---|---|
| **React Native 0.81** | Cross-platform from one codebase — Flutter was considered but RN's ecosystem for this specific feature set (maps, chat, auth) was more mature |
| **Expo SDK 54** | Dramatically reduces native config overhead; OTA updates mean no re-submitting to the store for small fixes |
| **Expo Router v6** | File-based routing keeps navigation predictable at scale; deep linking comes for free |
| **Supabase** | Chose over Firebase for real SQL support and better Row Level Security — critical for user data isolation |
| **Clerk** | Handles Google OAuth + session management out of the box; saved ~2 days vs rolling custom auth |
| **Zustand** | Redux was overkill for this scope; Zustand's slice pattern gave clean state isolation without boilerplate |
| **React Hook Form + Zod** | Schema-first validation catches errors at the type level before they hit the API |
| **Stream Chat** | Production-grade real-time chat in ~1 day of integration vs building from scratch with WebSockets |
| **Gemini AI API** | Multimodal support (text + image) fit the coaching + food analysis use case; competitive with Claude for this specific task |

---

## Challenges & What I Learned

**Hardest integration:** Stream Chat + Clerk auth. Stream uses its own token system — wiring it to Clerk's session required a Supabase Edge Function as a token server middleware. Took longer than expected but the pattern is now reusable for any project.

**Biggest architecture decision:** Structuring the `src/modules/` folder by feature instead of by type (components/hooks/utils all together). Early on it felt overengineered — by the time the app had 5+ features, it saved significant cognitive overhead.

**What surprised me:** State management for a multi-screen app with cart, auth, and chat running simultaneously is genuinely complex. Learning when to use Zustand global state vs local component state vs server state (React Query) was the most transferable lesson from this project.

---

## Project Structure

```
gymfood/
├── app/                        # Screens & navigation (Expo Router)
│   ├── (auth)/                 # Onboarding, Login, Register, Forgot Password
│   ├── (tabs)/
│   │   ├── home/               # Food browsing & ordering
│   │   ├── forum/              # Community posts & discussions
│   │   ├── consultation/       # AI coach chat sessions
│   │   ├── history/            # Order & session history
│   │   └── profile/            # User profile & settings
│   ├── (checkout)/
│   └── (review)/
├── src/
│   ├── modules/                # Feature-first structure
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── consultation/
│   │   ├── meals/
│   │   └── profile/
│   ├── shared/
│   │   ├── components/         # Reusable UI components
│   │   ├── constants/          # Theme & app-wide constants
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript definitions
│   │   └── utils/
│   └── data/                   # Static data & seeds
├── supabase/                   # Config, migrations, edge functions
└── .env                        # Not committed — see setup below
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Expo CLI
- Android Studio (emulator) or Xcode (iOS simulator)
- Expo Go on physical device (optional)

### Installation

```bash
git clone https://github.com/BenDjarinn/GymFood-Project.git
cd gymfood
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STREAM_API_KEY=your_stream_api_key
EXPO_PUBLIC_STREAM_TOKEN_URL=your_stream_token_endpoint
```

All services have free tiers:

| Key | Where to get it |
|---|---|
| `CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) → Create app → API Keys |
| `SUPABASE_URL` + `ANON_KEY` | [supabase.com](https://supabase.com) → Settings → API |
| `STREAM_API_KEY` | [getstream.io](https://getstream.io) → Create Chat app → Dashboard |
| `STREAM_TOKEN_URL` | Deploy the `stream-token` Edge Function from `/supabase` folder |

### Run

```bash
npx expo start
```

| Target | How |
|---|---|
| Android | Press `a` |
| iOS | Press `i` |
| Physical device | Scan QR with Expo Go |
| Web | Press `w` |

---

## License

MIT — see `LICENSE`.

---

<p align="center">Built by <a href="https://github.com/BenDjarinn">BenDjarinn</a></p>
