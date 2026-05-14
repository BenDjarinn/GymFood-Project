# 🥗 GymFood

> Your all-in-one fitness lifestyle app — order healthy meals, join the community, and get expert-level coaching powered by AI.

---

## 📱 About The Project

**GymFood** is a React Native mobile application built for people who take their health seriously. It brings together three core experiences in one place: a food delivery platform focused on healthy meals, a community forum for fitness discussions, and an AI-powered coaching service that delivers advice on par with a real professional coach.

### What You Can Do

- 🛒 **Order Healthy Meals** — Browse and order food curated for your fitness lifestyle, with a full cart and checkout flow
- 💬 **Join the Community** — Post, discuss, and share tips around healthy eating, diet strategies, and fitness
- 🤖 **Consult an AI Fitness Coach** — Book a chat session with an AI coach for personalized meal plans, workout advice, and diet breakdowns
- 📋 **Track Your History** — Review your past orders and consultation sessions in one place
- 👤 **Manage Your Profile** — Update your personal details, preferences, and account settings

---

## 🧭 The Story Behind GymFood

### The Problem

Anyone who's tried to eat healthy while training seriously knows the friction. You open a food delivery app — it's built for cravings, not macros. You search for a nutritionist — it costs hundreds per session. You join a fitness group online — the advice is scattered, unverified, and buried under noise.

The three things a fitness-focused person needs most — **clean food**, **real community**, and **expert guidance** — exist in completely separate places, each with their own cost and inconvenience. There's no single space that respects both your goals and your time.

### The Solution

GymFood brings all three into one app, purpose-built for the gym crowd.

Instead of a generic food delivery experience, you get a curated menu designed around fitness nutrition. Instead of a generic social feed, you get a community that speaks your language — macros, meal prep, training splits. And instead of paying premium rates for a human coach, you get an AI consultation experience powered by Claude that responds with the depth and nuance of a certified professional — available anytime, at no extra cost.

The goal wasn't to build three separate apps stitched together. It was to design a single, coherent experience where ordering a post-workout meal, asking about your protein intake, and sharing your progress all feel like they belong in the same place.

### Expected Impact

- **Accessibility** — Quality fitness nutrition advice shouldn't be gated behind expensive coaching fees. GymFood makes expert-level guidance available to anyone with a phone.
- **Consistency** — Having food, community, and coaching in one place reduces the friction that causes people to fall off their fitness routines.
- **Community-driven accountability** — A focused community of like-minded people creates organic motivation that generic social platforms can't replicate.
- **Smarter food choices** — When healthy options are as easy to order as fast food, the default choice changes.

---

## 🛠️ Tech Stack

| Technology | Reason |
|---|---|
| **React Native 0.81** | Cross-platform (iOS & Android) from a single codebase |
| **Expo SDK 54** | Simplifies builds, OTA updates, and native API access |
| **Expo Router v6** | File-based navigation with deep linking support |
| **Supabase** | Real-time database, storage, and backend out of the box |
| **Clerk** | Authentication with Google OAuth and secure session management |
| **Zustand** | Lightweight global state management |
| **React Hook Form + Zod** | Form handling with schema-based validation |
| **Stream Chat** | Real-time chat for the AI consultation feature |
| **React Native Maps** | Location and map support for meal delivery |
| **Gemini AI API (Google)** | AI coaching and meal analysis |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (for Android emulator) or Xcode (for iOS simulator)
- Expo Go app on your physical device (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BenDjarinn/GymFood-Project.git
   cd gymfood
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_STREAM_API_KEY=your_stream_api_key
   EXPO_PUBLIC_STREAM_TOKEN_URL=your_stream_token_endpoint
   ```

   **Where to get each key (all have free tiers):**

   | Variable | Where to get it |
   |---|---|
   | `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sign up at [clerk.com](https://clerk.com) → Create an application → Copy the **Publishable Key** from the API Keys page |
   | `EXPO_PUBLIC_SUPABASE_URL` | Sign up at [supabase.com](https://supabase.com) → Create a project → Go to **Settings > API** → Copy the **Project URL** |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same Supabase page → Copy the **anon/public** key |
   | `EXPO_PUBLIC_STREAM_API_KEY` | Sign up at [getstream.io](https://getstream.io) → Create a Chat app → Copy the **API Key** from the dashboard |
   | `EXPO_PUBLIC_STREAM_TOKEN_URL` | Deploy the `stream-token` Supabase Edge Function (see `supabase/` folder), then use your function URL: `https://<your-project>.supabase.co/functions/v1/stream-token` |

4. **Start the development server**
   ```bash
   npx expo start
   ```

### Running the App

| Platform | Command |
|---|---|
| Android Emulator | Press `a` after `expo start` |
| iOS Simulator | Press `i` after `expo start` |
| Physical Device | Scan the QR code with the **Expo Go** app |
| Web | Press `w` after `expo start` |

---

## 📂 Project Structure

```
gymfood/
├── app/                        # Screens & navigation (Expo Router)
│   ├── (auth)/                 # Onboarding, Login, Register, Forgot Password
│   ├── (tabs)/                 # Main tab navigator
│   │   ├── home/               # Food browsing & ordering
│   │   ├── forum/              # Community posts & discussions
│   │   ├── consultation/       # AI coach chat sessions
│   │   ├── history/            # Order & session history
│   │   └── profile/            # User profile & settings
│   ├── (checkout)/             # Checkout flow
│   └── (review)/               # Order review
├── src/
│   ├── modules/                # Feature modules
│   │   ├── cart/               # Cart state & logic
│   │   ├── checkout/           # Checkout logic
│   │   ├── consultation/       # AI coaching feature
│   │   ├── meals/              # Meal browsing & data
│   │   └── profile/            # Profile management
│   ├── shared/
│   │   ├── components/         # Reusable UI components
│   │   ├── constants/          # App-wide constants & theme
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   ├── assets/                 # Images, fonts, icons
│   └── data/                   # Static data & seeds
├── supabase/                   # Supabase config & migrations
├── assets/                     # Expo root assets
└── .env                        # Environment variables (not committed)
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Built with 💪 by <a href="https://github.com/BenDjarinn">BenDjarinn</a></p>
