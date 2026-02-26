# CLAUDE.md — Career Memory App

> This file is the authoritative guide for Claude when working on this codebase. Read it fully before writing any code, making any architectural decisions, or modifying existing functionality. When in doubt about how something should be built, refer to the project plan (`career_memory_project_plan.md`) and schema (`career_memory_schema.md`) in the project files first.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Source of Truth Documents](#2-source-of-truth-documents)
3. [Technical Architecture](#3-technical-architecture)
4. [File Structure](#4-file-structure)
5. [Setup Instructions](#5-setup-instructions)
6. [Development Workflow](#6-development-workflow)
7. [Database & Schema Rules](#7-database--schema-rules)
8. [AI Integration Guidelines](#8-ai-integration-guidelines)
9. [Coding Best Practices](#9-coding-best-practices)
10. [Component & UI Guidelines](#10-component--ui-guidelines)
11. [Testing Guidelines](#11-testing-guidelines)
12. [Git Commit Guidelines](#12-git-commit-guidelines)
13. [Technical Decision Log](#13-technical-decision-log)

---

## 1. Project Overview

**Career Memory** is a voice-first mobile and web app that helps professionals capture accomplishments as they happen and surface them when it counts — during performance reviews, job searches, and resume updates.

### Core Value Proposition
Users forget great work. This app makes it effortless to log accomplishments via voice or text, synthesizes them using AI into structured, resume-ready content, and organizes them into a persistent career record.

### The Three Jobs This App Does
1. **Capture** — Low-friction voice or typed entry for logging accomplishments as they happen
2. **Synthesize** — Claude AI transforms raw notes into structured STAR-format achievements with summaries, bullets, and tags
3. **Surface** — Organized resume view, highlights reel, and project summaries ready for real-world use

### V1 Scope
Professional achievements only. Voice + typed input. AI synthesis. Projects. Highlights. Home dashboard. Summary (resume) view. Entries library. Notification schedules. Web + mobile.

See `career_memory_project_plan.md` Section 15 for the complete V1 feature list and what is explicitly post-V1.

---

## 2. Source of Truth Documents

Before implementing any feature, always re-read the relevant section of these docs. They contain finalized decisions that must not be second-guessed without explicit instruction.

| Document | What it contains |
|----------|-----------------|
| `career_memory_project_plan.md` | Product vision, visual design system, page-by-page specs, navigation architecture, Add Entry flow, AI synthesis specs, highlights system, empty states, outstanding decisions |
| `career_memory_schema.md` | Complete database schema for all 14 tables, field-level constraints, relationships, V1 implementation notes |
| `TECHNICAL_DECISIONS.md` | Log of every meaningful technical decision made during development — consult this before troubleshooting or changing existing behavior |
| `career-memory-app.jsx` | **Working React prototype.** Visual and interaction reference for all UI components — color values, component structure, navigation patterns, and animation behavior are implemented here. When implementing a component, check the prototype first for the intended design before building from scratch. |

**When there is a conflict** between this file and the project plan or schema, the project plan and schema win. Flag the conflict rather than resolving it silently.

---

## 3. Technical Architecture

### Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React Native + Expo | Single codebase for iOS, Android, and web |
| Backend / DB | Supabase | Postgres, Auth, Storage, Edge Functions, real-time |
| Transcription | OpenAI Whisper API | $0.006/min, accurate, simple REST |
| AI Synthesis | Claude Haiku (via Anthropic API) | Fast, cost-efficient, capable for synthesis tasks |
| Push Notifications | Expo Notifications | Handles scheduling cleanly across platforms |
| Audio Storage | Supabase Storage | 30-day default expiry, nightly cron cleanup |
| Billing (future) | Stripe via Supabase | Schema ready, not wired in V1 |

### Key Architectural Decisions

**Multi-user from day one.** Every table has `user_id`. Even in personal use, the system behaves as if it's multi-tenant. This is not optional.

**Save before synthesize.** Raw `achievement_responses` rows are written to the database BEFORE any AI call is made. This is non-negotiable. If synthesis fails, the user's words must be preserved.

**`_ai` columns are write-once.** Any column ending in `_ai` (e.g. `synthesis_paragraph_ai`, `star_situation_ai`, `highlight_summary_ai`) is written once on first synthesis and never overwritten. Only the corresponding live column (without `_ai`) is updated on edits. This enables future "revert to original" functionality.

**Soft deletes everywhere.** Never hard delete user data. All major tables have `deleted_at`. Set `deleted_at = now()` on deletion. Filter `WHERE deleted_at IS NULL` on all reads.

**Supabase Row-Level Security (RLS).** Enable RLS on all tables. Users can only read and write their own data. No exceptions.

**Web layout = left sidebar. Mobile layout = bottom tab bar.** These are different navigation patterns for the same content. The four nav items are: Home, Summary, Entries, Projects. Settings is accessible from a profile icon, not a nav tab.

---

## 4. File Structure

```
career-memory/
├── CLAUDE.md                          # This file
├── TECHNICAL_DECISIONS.md             # Decision log (see Section 13)
├── career_memory_project_plan.md      # Product spec (read-only reference)
├── career_memory_schema.md            # DB schema (read-only reference)
├── career-memory-app.jsx              # React prototype (visual reference)
│
├── app/                               # Expo Router app directory
│   ├── (auth)/                        # Auth screens (sign in, sign up, onboarding)
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/                        # Main app tab navigator
│   │   ├── _layout.tsx                # Tab bar config (mobile) / sidebar (web)
│   │   ├── index.tsx                  # Home tab
│   │   ├── summary.tsx                # Summary (resume view) tab
│   │   ├── entries.tsx                # Entries tab
│   │   └── projects.tsx               # Projects tab
│   ├── entry/
│   │   ├── new.tsx                    # Add Entry full-page experience
│   │   └── [id].tsx                   # Entry detail
│   ├── achievement/
│   │   └── [id].tsx                   # Achievement detail
│   ├── project/
│   │   └── [id].tsx                   # Project detail
│   ├── settings/
│   │   ├── index.tsx                  # Settings home (full-screen overlay)
│   │   ├── profile.tsx
│   │   ├── companies.tsx
│   │   ├── notifications.tsx
│   │   ├── preferences.tsx
│   │   └── tags.tsx
│   └── _layout.tsx                    # Root layout (auth guard)
│
├── components/                        # Reusable UI components
│   ├── achievements/
│   │   ├── AchievementCard.tsx
│   │   └── AchievementDetail.tsx
│   ├── entries/
│   │   ├── EntryCard.tsx
│   │   └── EntryDetail.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectDetail.tsx
│   │   └── InlineProjectPicker.tsx
│   ├── home/
│   │   ├── RecentFocus.tsx
│   │   ├── StatsRow.tsx
│   │   └── HighlightsReel.tsx
│   ├── entry-flow/                    # Add Entry multi-step flow
│   │   ├── EntryStep.tsx
│   │   ├── ProcessingStep.tsx
│   │   ├── ReviewStep.tsx
│   │   └── VoiceRecorder.tsx
│   └── ui/                            # Generic UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Tag.tsx
│       ├── EmptyState.tsx
│       └── LoadingIndicator.tsx
│
├── lib/                               # Core logic, clients, utilities
│   ├── supabase.ts                    # Supabase client initialization
│   ├── anthropic.ts                   # Anthropic API client + synthesis functions
│   ├── whisper.ts                     # OpenAI Whisper transcription
│   ├── notifications.ts               # Expo notification scheduling
│   └── audio.ts                       # Audio recording utilities
│
├── hooks/                             # Custom React hooks
│   ├── useAuth.ts
│   ├── useAchievements.ts
│   ├── useEntries.ts
│   ├── useProjects.ts
│   └── useSynthesis.ts
│
├── stores/                            # Zustand state stores (if used)
│   └── userStore.ts
│
├── types/                             # TypeScript types derived from schema
│   ├── database.ts                    # Generated or hand-written Supabase types
│   └── app.ts                         # App-specific types
│
├── constants/                         # App-wide constants
│   ├── colors.ts
│   ├── layout.ts
│   └── questions.ts                   # System question keys
│
├── supabase/
│   ├── migrations/                    # SQL migration files
│   └── functions/                     # Edge Functions
│       └── cleanup-audio/             # Nightly audio expiry cron
│
├── assets/                            # Static assets
│   └── images/
│
├── app.json                           # Expo config
├── package.json
├── tsconfig.json
└── .env.local                         # Never commit. See .env.example
```

---

## 5. Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo`)
- Supabase CLI (`npm install -g supabase`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app

### Environment Variables
Copy `.env.example` to `.env.local` and populate:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key   # Server-side only — never expose to client

# OpenAI (Whisper)
OPENAI_API_KEY=your_openai_api_key         # Server-side only — never expose to client
```

> **Security note:** `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` must NEVER be prefixed with `EXPO_PUBLIC_`. They must only be called from Supabase Edge Functions or a server-side proxy — never from the client bundle.

### Install & Run

```bash
# Install dependencies
npm install

# Start Supabase locally
supabase start

# Run migrations
supabase db push

# Start Expo dev server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Run on web
npx expo start --web
```

### Database Setup
1. Create a new Supabase project at supabase.com
2. Run all migrations in `supabase/migrations/` in order
3. Confirm RLS is enabled on all tables
4. Seed system questions and system tags (SQL seed scripts in `supabase/migrations/`)
5. Deploy the `cleanup-audio` Edge Function cron

---

## 6. Development Workflow

### Before Writing Any Code
1. Re-read the relevant section of `career_memory_project_plan.md` for the feature you're building
2. Re-read the relevant table(s) in `career_memory_schema.md`
3. Check `TECHNICAL_DECISIONS.md` for any prior decisions that affect this area
4. Check Section 16 of the project plan for decision status. Most decisions are resolved (entry flow, onboarding, AI name timing, export/copy UX, web layout, schema). The remaining open item is #8: company-specific defaults when creating entries. Do not implement unresolved items unless explicitly decided.
5. Check `career-memory-app.jsx` for the visual reference when building UI components

### Feature Development Order (Recommended)
Build in this sequence to avoid blockers:

1. Supabase setup, auth, RLS policies
2. Database migrations (all tables)
3. System question and tag seeds
4. Core data fetching hooks
5. Add Entry flow (most complex, most important)
6. AI synthesis pipeline
7. Entries page
8. Home dashboard
9. Projects page
10. Summary page
11. Settings
12. Notifications
13. Polish: empty states, error states, loading states

### When Making a Technical Decision
Any time you make a meaningful technical decision — choosing a library, changing an architectural approach, fixing a non-obvious bug, deviating from the project plan — you must record it in `TECHNICAL_DECISIONS.md`. See Section 13 for format.

### Code Review Checklist (before committing)
- [ ] `deleted_at IS NULL` filter on all Supabase reads
- [ ] `user_id` filter on all Supabase reads
- [ ] Raw responses saved to DB before synthesis is called
- [ ] No `_ai` columns overwritten after first write
- [ ] Error states handled with plain English + Retry button
- [ ] Empty states handled per the spec in project plan Section 12
- [ ] TypeScript — no `any` types unless absolutely unavoidable
- [ ] Sensitive API keys not in client bundle

---

## 7. Database & Schema Rules

These rules are non-negotiable and must be enforced in app logic, not just convention.

### Hard Rules

**Soft deletes only.** Never `DELETE` a row from a user-facing table. Always `UPDATE deleted_at = now()`. Always filter `WHERE deleted_at IS NULL`.

**Save before synthesize.** Write all `achievement_responses` rows to the database before calling the Anthropic API. If the synthesis call throws, the user's input is safe.

**`_ai` columns are write-once.** After first generation, these fields must never be overwritten:
- `synthesis_paragraph_ai`
- `synthesis_bullets_ai`
- `star_situation_ai`, `star_task_ai`, `star_action_ai`, `star_result_ai`
- `ai_generated_name_ai` (on achievements)
- `ai_generated_summary_ai` (on entries)
- `highlight_summary_ai` (on projects)

Only the corresponding live column (without `_ai` suffix) is editable by the user.

**One `is_current = true` company per user.** When a new company is marked `is_current = true`, set all other companies for that user to `is_current = false` and populate their `end_date`. Enforce this in app logic — do not rely on the DB to catch it.

**Subscriptions row on signup.** Every new user gets a `subscriptions` row with `plan_type = 'free'` and `status = 'active'` created at the same time as their `users` row.

**Tag slugs normalized on write.** Lowercase, spaces to underscores, trim whitespace. Example: `"Cost Reduction"` → `"cost_reduction"`. Prevents duplicate tags.

**`is_confirmed = false`, not delete, for removed AI tags.** When a user removes an AI-suggested tag from an achievement, update `is_confirmed = false` on the `achievement_tags` row. Do not delete the row.

**Achievement count on projects is always computed live.** Never store a denormalized count field. Query `professional_achievements WHERE project_id = ? AND deleted_at IS NULL`. This matters because the count updates immediately when achievements are added or deleted without needing a separate update step.

### Column Naming Conventions
- `_ai` suffix = original AI-generated, write-once
- No suffix (matching field) = live version, user-editable
- `_snapshot` suffix = denormalized copy captured at creation time (e.g. `company_name_snapshot`, `question_text_snapshot`)

### Denormalized Fields to Always Populate
When creating a `professional_achievement`:
- `company_name_snapshot` — copy from the current company name at time of creation
- `role_title` — copy from user's `default_role_title`

When creating an `achievement_response`:
- `question_text_snapshot` — copy the full question text at time of answer
- `question_key` — copy the `question_key` from the questions table

---

## 8. AI Integration Guidelines

### Model: Claude Haiku
Use `claude-haiku-*` for all synthesis tasks. It is fast and cost-efficient for this use case. Do not use Opus or Sonnet unless a specific task requires it and is explicitly approved.

### What Claude Produces Per Achievement (Single API Call)
The synthesis prompt must return all of the following in a single structured response:
1. `ai_generated_name` — 4–7 words, descriptive, no punctuation
2. `synthesis_paragraph` — cohesive readable summary paragraph
3. `synthesis_bullets` — array of bullet strings (key accomplishments)
4. `star_situation`, `star_task`, `star_action`, `star_result` — STAR breakdown
5. `tag_suggestions` — array of tag slugs mapped to the existing tag taxonomy
6. `completeness_score` — integer 0–100
7. `completeness_flags` — array of missing components (e.g. `["metrics", "situation"]`)

Return structured JSON. Validate the response shape before writing to DB.

### Synthesis Prompt is a Core Product Asset
The synthesis prompt is as important as the UI. It determines output quality. Iterate carefully. Document every meaningful prompt change in `TECHNICAL_DECISIONS.md` with the before/after and the reason.

### Entry-Level AI (After Achievements Are Synthesized)
- `ai_generated_summary` on `entries` — short cohesive paragraph summarizing all achievements in the entry. Generated after achievement synthesis completes. Entries are identified by date in the UI — they do not have an AI-generated name. Only the summary is generated.

### Project Summary Regeneration
When a new achievement is added to a project:
1. Regenerate `highlight_summary_ai` is NOT overwritten — check first if it already has a value
2. If `highlight_summary_last_edited_at` is NULL → auto-update `highlight_summary` (live field)
3. If `highlight_summary_last_edited_at` is NOT NULL → show "New achievements added — update your summary?" prompt. Do not auto-overwrite.

### Home "Recent Focus"
- Triggered on every Home screen load
- Summarizes the last 3 entries
- Recognizes cross-entry projects and summarizes them holistically (not repetitively)
- Output: 2–4 sentences, friendly and plain language
- Cold state (<3 entries): show "Add a few more entries to get your overview."

### API Key Security
Anthropic API key and OpenAI API key must ONLY be called from Supabase Edge Functions or a secure server-side handler. Never include them in the client bundle or expose them to the frontend.

### Error Handling for AI Calls
- Always wrap in try/catch
- On failure: show a plain English error in the UI with a Retry button
- The user's input must already be saved before the AI call — so Retry just re-calls synthesis, it never asks the user to re-enter anything

---

## 9. Coding Best Practices

### TypeScript
- Strict mode enabled. No `any` unless absolutely necessary and commented with why.
- Generate or maintain Supabase types in `types/database.ts` — keep them in sync with schema changes.
- Use `Database['public']['Tables']['table_name']['Row']` types from Supabase for all DB row types.

### Supabase Queries
Always include both filters on reads:
```typescript
// ✅ Correct
const { data } = await supabase
  .from('professional_achievements')
  .select('*')
  .eq('user_id', userId)
  .is('deleted_at', null)

// ❌ Wrong — missing soft delete filter
const { data } = await supabase
  .from('professional_achievements')
  .select('*')
  .eq('user_id', userId)
```

### Error Handling
- Never show raw error messages, stack traces, or technical jargon to the user
- All user-facing errors must be plain English
- All error states must include a Retry button where applicable
- Log full errors to console in development for debugging

### State Management
- Prefer React Query or Supabase's real-time hooks for server state
- Use Zustand for lightweight client-only global state (auth user, preferences)
- Avoid prop drilling beyond 2 levels — use context or a store

### Component Patterns
- One component per file
- Keep components focused — if a component exceeds ~200 lines, split it
- Separate data-fetching logic from rendering logic (use custom hooks)
- All components must handle: loading state, empty state, error state, and populated state

### Async/Await
- Always use `async/await` over `.then()` chains
- Always handle errors — never let a promise silently reject

### Constants Over Magic Strings
```typescript
// ✅ Correct
import { SYNTHESIS_STATUS } from '@/constants/app'
achievement.synthesis_status === SYNTHESIS_STATUS.COMPLETE

// ❌ Wrong
achievement.synthesis_status === 'complete'
```

---

## 10. Component & UI Guidelines

### Design System — "Parchment & Moss"

The visual reference prototype is in `career-memory-app.jsx`. Check it first when implementing any component.

**Color Tokens** (define in `constants/colors.ts`):

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#F5F0E8` | App background (warm parchment) |
| `card` | `#FAF7F2` | Card surfaces |
| `cardHover` | `#F2EBE0` | Card hover/press state |
| `cardBorder` | `rgba(173,156,142,0.18)` | Card border color |
| `cardShadow` | `rgba(42,33,24,0.04)` | Card shadow (0 1px 4px) |
| `moss` | `#5C7A52` | Primary brand. Buttons, active nav, status badges (active), left accent bars |
| `mossDeep` | `#4A6642` | Button press state, darker accents, gradient start |
| `mossGlow` | `rgba(92,122,82,0.22)` | Gradient endpoint, hover states |
| `mossFaint` | `rgba(92,122,82,0.08)` | Light tinted backgrounds, selected states |
| `mossBorder` | `rgba(92,122,82,0.2)` | Borders on moss-tinted elements |
| `amber` | `#C9941A` | Highlights. Star icons, highlight accent bars, highlight header tint |
| `amberFaint` | `rgba(201,148,26,0.1)` | Highlight card tint background |
| `amberBorder` | `rgba(201,148,26,0.18)` | Borders on amber-tinted elements |
| `umber` | `#AD9C8E` | Secondary text, muted labels, empty-state italic, completed status badge |
| `walnut` | `#2A2118` | Primary text (dark walnut) |
| `blush` | `#D9BBB0` | Decorative accent, soft warm tone |
| `divider` | `rgba(173,156,142,0.2)` | Divider lines, secondary surfaces |
| `danger` | `#B05A40` | Destructive actions, clear filters, delete confirmation |
| `dangerFaint` | `rgba(176,90,64,0.08)` | Danger background tint |
| `dangerBorder` | `rgba(176,90,64,0.2)` | Borders on danger-tinted elements |

**Typography:**

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Headings | Nunito | Bold (700) | Page titles, section headers, greeting |
| Numbers | Nunito | Bold (700) | Stats row large numbers |
| AI names | Nunito | SemiBold (600) | Achievement names, project names on cards |
| Buttons | Nunito | SemiBold (600) | Button text |
| Body | DM Sans | Regular (400) | Paragraphs, descriptions, synthesis text |
| Labels | DM Sans | Medium (500) | Tag labels, field labels, metadata |
| Captions | DM Sans | Regular (400) | Dates, helper text |

**Card Language:**

- Border radius: 14–16px on all cards
- Border: 1px solid `cardBorder`
- Shadow: `0 1px 3px cardShadow`
- Background: `card` (white)
- **Left accent bar:** 3px wide, flush with left edge
  - `moss` — default on entry cards and achievement cards
  - `amber` — on any card where the item is a highlight
- **Top accent bar:** 3px wide, flush with top edge
  - `moss` — on project cards and role blocks in Summary page

**AI Summary Card:**

Used for Recent Focus on Home and project summaries on Project Detail.
- Background: linear gradient from `#4A6642` (mossDeep) to `#5C7A52` (moss), left to right
- Text: white, DM Sans Regular, generous line height (1.6)
- Label: "AI Summary" in small caps or uppercase white at 60% opacity, top-left
- Border radius: 14–16px, consistent with all cards
- Used for all AI-generated summary displays throughout the app

**Status Badges:**
- **Active:** `mossFaint` background, `moss` text, rounded pill
- **Completed:** umber-tinted background, `umber` text, rounded pill
- **Archived:** same as completed but italic text

### Navigation
- **Mobile:** Bottom tab bar with 4 tabs — Home, Summary, Entries, Projects
- **Web:** Left sidebar with same 4 items
- Settings is accessed via profile/avatar icon in top-right (mobile) or sidebar footer (web) — NOT a tab
- Achievements are not top-level navigation — they are accessed by tapping into an Entry
- The profile avatar on Home triggers Settings as a **full-screen overlay**, not a sheet, drawer, or tab

**Tappable Stats on Home:** All three stats on the Home screen are tappable and navigate:
- "Entries" stat → Entries tab, By Entry view
- "Achievements" stat → Entries tab, By Achievement view
- "Projects" stat → Projects tab

**Deep-link navigation pattern:** Root state holds `targetProjectId` and `targetAchievementId`. Setting either value + switching tab causes the receiving tab to open that item's detail page on mount, then clears the target to `null`. This is how Home highlight taps navigate directly to an achievement or project without going through the list.

**Highlight taps on Home:** Achievement highlights navigate directly to Achievement Detail — not to the general Entries list (this was a deliberate fix; the general list drop was a bug). Project highlights navigate directly to Project Detail.

### Entries Page Toggle
The Entries page has two views toggled by a segmented control:
- **By Entry** (default) — shows EntryCards sorted by date desc
- **By Achievement** — flat list of all achievements across all entries sorted by date desc

### Add Entry Flow
Three steps: Entry → Processing → Review. Opens as a **dedicated full-page experience on all platforms** (mobile and web). Entry points: Home CTA button and "Add new" button on Entries tab header.

**Step 1 — Input:**
- Main input: "What did you accomplish?" with STAR-oriented helper subtext
- Voice (microphone button) and typed (keyboard toggle) input modes
- Optional STAR questions are **collapsible accordion rows**. A filled green dot appears on the row when that question has been answered.
- Project selector uses the **Inline Project Picker** component (same component used in Achievement Detail)
- **Synthesize button** is disabled (grey) until >3 characters exist in the main input. Hint text beneath when disabled: "Write something above to continue." Prominent moss green once activated.

**Step 2 — Processing:**
- **Full-screen overlay**, not a spinner or inline indicator
- **Pulsing animated orb** — moss gradient (`#4A6642` → `#5C7A52`), scale + opacity loop animation, centered vertically
- Step text cycles through 4 stages: "Reading your entry…" → "Identifying achievements…" → "Building your synthesis…" → "Finalizing…"
- **Progress dots** — 4 dots that fill/elongate as each step completes
- User cannot interact during processing

**Step 3 — Review:**
- Achievement card with AI-generated name (editable), synthesis paragraph in AI Summary Card style, bullets, STAR breakdown
- **"Edit summary"** link beneath the AI Summary Card for inline editing
- AI-suggested tags shown as removable chips. Below them: up to 5 system tag suggestions displayed as dashed `+ Tag name` pills — tapping adds them. Enter key in the tag input also adds a custom tag.
- Multi-achievement detection: "Looks like you covered a few things. Want to split these into separate achievements?"
- **Bottom bar** has two buttons:
  - **"+ Add another"** (secondary) — saves current achievement, resets Step 1 for another achievement under the same entry date
  - **"Save & done"** (primary) — saves and closes

### Inline Project Picker
A reusable component used in both Achievement Detail (edit mode) and the Add Entry Review step.

**States:**
- **No project + closed:** Dashed-border pill with "Add to project" text
- **Dropdown open:** List of user's active projects + "New project…" row at bottom
- **Project selected:** Solid pill with folder icon + project name + navigate chevron (tapping chevron navigates to project detail)

Creating a new project inline triggers a ProjectSheet (name + optional description) without leaving the current flow. The new project is immediately available in the picker.

### Empty States
All empty states must use the exact copy specified in project plan Section 12. Do not invent copy. Always include a contextual CTA button where applicable.

### Highlight Visual Treatment
- **Achievement cards:** Amber left accent bar (replaces moss), filled amber star icon
- **Project cards:** Amber top accent bar + amber folder icon when highlighted
- **Highlight toggle button** on Achievement Detail: subtle `amberFaint` tinted background when active
- **Home Highlights Reel:** Amber star in amber-tinted square, item name, type label ("achievement" or "project"), chevron
- Consistent across all surfaces. Scannable without being visually loud.

### Loading States
- **AI processing (Add Entry Step 2):** Full-screen pulsing orb experience with step text and progress dots — not an inline spinner or bar. See Add Entry Flow Step 2 above for full spec.
- Cards with loading AI name/summary: subtle skeleton or loading state — fallback text is `[Date] achievement`
- General data loading: skeleton screens preferred over spinners for content areas

### Settings
Settings opens as a **full-screen overlay** from the Home avatar tap — not routed like a normal screen, it layers on top.

**Main list structure:**
- **Profile card** at top — shows user's name, email, avatar. Tappable to edit.
- **App group:** Notifications, Preferences, Tags
- **Account group:** Company history, Sign out
- **Delete account** — footer link in `danger` color. Requires a confirmation modal — never immediate.

**Key behavioral specs:**
- Audio retention in Preferences is a **slider** (7–90 days, step 7, default 30) — not a fixed value. This is user-configurable, so the nightly audio cleanup cron must respect `user_preferences.audio_retention_days` per user, not a hardcoded 30.
- Company history: when marking a new company as current, the previous current company auto-sets `is_current = false` and prompts for `end_date`.
- See project plan Section 7.5 for full Settings page specifications.

### Responsive Layout
- The app must work on iOS, Android, and web from one codebase
- Test web layout at multiple breakpoints — the web layout is sidebar-based, not tab-based
- Use `Platform.OS` sparingly — prefer styling abstractions

---

## 11. Testing Guidelines

### What to Test
- AI synthesis pipeline: mock the Anthropic API, test that all output fields are correctly parsed and written to DB
- Save-before-synthesize: test that responses are persisted before synthesis is called, and that a synthesis failure does not lose user data
- Write-once `_ai` columns: test that re-calling synthesis does not overwrite `_ai` columns
- Soft delete: test that deleted records do not appear in query results
- Tag normalization: test that slugs are correctly normalized

### Approach
- Unit tests for pure logic (synthesis parsing, slug normalization, etc.)
- Integration tests for Supabase interactions (use Supabase local dev)
- Manual testing on both iOS and web before any PR

---

## 12. Git Commit Guidelines

**CRITICAL:** When committing to GitHub:

- All commits are authored by **Steph**
- **NO references** to "Claude Code", "AI-generated", "with assistance from Claude", or any AI tool mentions — in commit messages, PR descriptions, or code comments
- Commit messages describe **what was changed**, not how it was created
- Keep messages professional and clear

### Commit Message Format
```
<type>: <short description>

[optional body with more detail]
```

**Types:**
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code change that doesn't add a feature or fix a bug
- `style:` — formatting, whitespace, no logic change
- `chore:` — dependency updates, config changes, tooling
- `docs:` — documentation only

**Examples:**
```
feat: add voice recording to entry flow

fix: prevent synthesis from overwriting _ai columns on retry

refactor: extract achievement synthesis into useSynthesis hook

chore: add Supabase migration for projects table
```

---

## 13. Technical Decision Log

> This section describes the `TECHNICAL_DECISIONS.md` file and how to use it. The actual log lives in that file.

### What `TECHNICAL_DECISIONS.md` Is For

`TECHNICAL_DECISIONS.md` is a running log of every meaningful technical decision made during the development of this app. Its purpose is threefold:

1. **Memory** — Understand why something was built a certain way, even months later
2. **Troubleshooting** — If something breaks or behaves unexpectedly, this log explains the reasoning behind the original implementation and may point toward the cause
3. **Guidance** — Before making a change to existing behavior, check here first to avoid re-introducing a known problem

### When to Add an Entry

Add an entry to `TECHNICAL_DECISIONS.md` whenever you:
- Choose one library, pattern, or approach over another
- Make a non-obvious implementation choice
- Fix a bug that required real investigation (especially if it wasn't obvious why it broke)
- Deviate from a straightforward interpretation of the project plan for a technical reason
- Change the AI synthesis prompt in any meaningful way
- Discover a gotcha, edge case, or Supabase/Expo/RN quirk that affected implementation

**When in doubt, log it.** The cost of an unnecessary entry is low. The cost of a missing entry when debugging a mysterious regression is high.

### How to Add an Entry

Entries go in `TECHNICAL_DECISIONS.md` in reverse chronological order (newest first). Use this format:

```markdown
## [YYYY-MM-DD] — <Short title describing the decision or fix>

**Area:** <e.g. AI Synthesis, Supabase, Navigation, Audio, Schema, etc.>
**Type:** Decision | Bug Fix | Prompt Change | Refactor

### What
<One to three sentences describing what was done or changed.>

### Why
<The reasoning. Why was this approach chosen? What alternatives were considered and rejected?>

### Impact
<What does this affect? What should a future developer know when working in this area?>

### Watch Out For
<Optional. Any gotchas, edge cases, or failure modes to be aware of.>
```

### How to Use This File When Troubleshooting

1. Search `TECHNICAL_DECISIONS.md` for the area you're working in (e.g. "synthesis", "audio", "Supabase", "navigation")
2. Read all relevant entries before making changes
3. If a bug seems "impossible" given the code, check if a prior decision explains the behavior
4. After fixing the bug, add a new entry documenting what broke and why

### `TECHNICAL_DECISIONS.md` Initial Entry

The file should be created with the following initial entry before any code is written:

```markdown
# Technical Decisions Log — Career Memory App

Entries are in reverse chronological order (newest first).
See CLAUDE.md Section 13 for usage guidelines and entry format.

---

## [YYYY-MM-DD] — Initial architecture established

**Area:** Architecture
**Type:** Decision

### What
React Native + Expo for cross-platform frontend. Supabase for backend, auth, and storage.
Claude Haiku for AI synthesis. OpenAI Whisper for transcription. Expo Notifications for push.

### Why
React Native + Expo gives iOS, Android, and web from one codebase with clean notification
support. Supabase provides auth, Postgres, storage, and edge functions without lock-in.
Claude Haiku is fast and cost-effective for synthesis workloads. Whisper is accurate and
simple at $0.006/min.

### Impact
All features are built on this stack. Deviations require strong justification and a log entry.

### Watch Out For
Anthropic and OpenAI API keys must never be in the client bundle — only called from
Supabase Edge Functions or server-side handlers.
```

---

*Last updated: 2026-02-25*
*Maintained by: Steph*
