# Technical Decisions Log — Career Memory App

> **How to use this file:**
> Search by area (e.g. "synthesis", "audio", "Supabase", "navigation") before making changes.
> Read all relevant entries before modifying existing behavior.
> After fixing a non-obvious bug or making a meaningful decision, add an entry.
> See `CLAUDE.md` Section 13 for the full entry format and usage guidelines.

Entries are in **reverse chronological order** (newest first).

---

## [2026-02-26] — Supabase client SSR fix for Expo web

**Area:** Supabase, Web
**Type:** Bug Fix

### What
AsyncStorage crashed during Expo web server-side rendering with `ReferenceError: window is not defined`. Replaced with a platform-aware storage adapter: localStorage on web client, no-op during SSR, AsyncStorage on native via lazy `require()`.

### Why
Expo Router uses SSR for the web build. AsyncStorage v3 accesses `window.localStorage` eagerly, which doesn't exist in Node. The Supabase client initializes at module scope, so storage must be safe to construct during SSR.

### Impact
Session persistence works on all three platforms: AsyncStorage on iOS/Android, localStorage on web. SSR gets a no-op adapter (sessions hydrate client-side after page load).

### Watch Out For
The `@react-native-async-storage/async-storage` package version (3.0.1) is newer than what Expo SDK 52 expects (2.2.0). If this causes issues, pin to 2.2.0. The lazy `require()` avoids the SSR crash regardless of version.

---

## [2026-02-26] — Color tokens updated to match prototype

**Area:** Design System
**Type:** Decision

### What
Updated all color tokens in `CLAUDE.md` Section 10 and `constants/colors.ts` to match the exact values from the `career-memory-app.jsx` prototype rather than the original project plan values.

### Why
The prototype is the working visual reference and uses refined values (e.g. `bg: #F5F0E8` not `#FAF8F5`, `moss: #5C7A52` not `#4A6642`, `amber: #C9941A` not `#D4A843`). Several tokens use `rgba()` values for subtle transparency effects (borders, shadows, faint fills). The prototype values create a warmer, more nuanced palette. Going forward, the prototype's design tokens (lines 4-12 of `career-memory-app.jsx`) are the single source of truth for colors.

### Impact
All UI components must import from `constants/colors.ts` which reflects the prototype values. The old CLAUDE.md values are now corrected.

### Watch Out For
Some tokens like `mossGlow`, `mossFaint`, `mossBorder`, and all `*Faint`/`*Border` variants are rgba() values, not hex. Ensure they work in all contexts (some React Native style APIs may not accept rgba strings in all positions).

---

## [2026-02-26] — Expo tabs template as project foundation

**Area:** Architecture
**Type:** Decision

### What
Initialized the project using `npx create-expo-app --template tabs` (Expo SDK 52+, Expo Router v4) then customized the generated scaffold. Removed unused template components (EditScreenInfo, Themed, StyledText) and rewrote the tab layout and root layout.

### Why
The tabs template provides Expo Router file-based routing with tab navigation out of the box, matching the app's navigation architecture. Starting from the template ensures correct Expo configuration (metro, tsconfig path aliases via `@/`, typed routes).

### Impact
File-based routing is established: `app/(tabs)/` for the 4 main tabs, `app/(auth)/` for auth screens. The root `_layout.tsx` handles auth guard redirects and font loading.

---

## [2026-02-26] — Font loading via expo-font with Google Fonts packages

**Area:** UI
**Type:** Decision

### What
Using `@expo-google-fonts/nunito` and `@expo-google-fonts/dm-sans` packages loaded via `expo-font` in the root layout. Specific weights loaded: Nunito 400/600/700, DM Sans 400/500.

### Why
These are the design system fonts (Nunito for headings/buttons/numbers, DM Sans for body/labels/captions). The Google Fonts Expo packages provide the correct font files without manual asset management. Loading in root layout ensures fonts are available before any screen renders.

### Impact
All components must use `fontFamily` strings matching the loaded names: `Nunito_400Regular`, `Nunito_600SemiBold`, `Nunito_700Bold`, `DMSans_400Regular`, `DMSans_500Medium`.

---

## [2026-02-26] — RLS policies on all tables with join-based checks for child tables

**Area:** Database, Security
**Type:** Decision

### What
Row Level Security is enabled on all 14 tables. Tables with a direct `user_id` column use simple `auth.uid() = user_id` policies. Child tables without `user_id` (achievement_responses, achievement_tags) use EXISTS subqueries to check ownership through the parent `professional_achievements` table. System records (questions, tags with `user_id IS NULL`) are readable by all authenticated users.

### Why
Direct `user_id` checks are the most efficient RLS pattern. For child tables, the JOIN-based EXISTS approach ensures data isolation without denormalizing `user_id` onto every child table. System data (questions, tags) must be globally readable for the app to function.

### Impact
The `achievement_responses` and `achievement_tags` tables have slightly more complex RLS policies that join to `professional_achievements`. These may be slower on very large datasets — monitor query performance and consider denormalizing `user_id` onto these tables if needed.

### Watch Out For
Hard delete policies (`FOR DELETE USING (false)`) are set on tables that should only use soft deletes (companies, entries, projects, achievements, notification_schedules, questions, tags, achievement_tags). This enforces the soft-delete rule at the database level.

---

## [2026-02-26] — Initial architecture established

**Area:** Architecture  
**Type:** Decision

### What
React Native + Expo for cross-platform frontend. Supabase for backend, auth, real-time, and storage. Claude Haiku for AI synthesis. OpenAI Whisper API for voice transcription. Expo Notifications for push notification scheduling.

### Why
React Native + Expo provides iOS, Android, and web from one codebase with mature notification support via Expo's infrastructure. Supabase provides Postgres, auth (including social sign-in), storage, and edge functions in a single open-source platform — avoiding vendor lock-in while minimizing infrastructure overhead. Claude Haiku is fast and cost-efficient for synthesis workloads (naming, paragraphs, bullets, STAR extraction, tags). Whisper is highly accurate, multilingual, and simple at $0.006/min via REST API.

### Impact
All V1 features are built on this stack. Any deviation from these choices requires a strong technical justification and a new entry in this log.

### Watch Out For
- `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` must **never** be included in the client bundle. They must only be called from Supabase Edge Functions or a server-side handler. Using `EXPO_PUBLIC_` prefix on these variables would expose them — do not do this.
- Expo's web support has limitations compared to native — test key flows on web explicitly, especially the Add Entry flow and audio recording (microphone APIs differ by platform).

---

## [2026-02-25] — Save-before-synthesize enforced as non-negotiable rule

**Area:** AI Synthesis, Data Integrity  
**Type:** Decision

### What
All `achievement_responses` rows must be written to the Supabase database before any call to the Anthropic API is made. The synthesis call is only triggered after the database write is confirmed successful.

### Why
If the AI synthesis call fails, times out, or returns malformed data, the user's input must already be safely persisted. The user should never have to re-type or re-record their answer because of an AI failure. This is the most important data integrity rule in the app.

### Impact
Every implementation of the synthesis pipeline must follow this order: (1) write responses to DB → (2) confirm write success → (3) call Anthropic API → (4) write synthesis results to DB. Any code that calls synthesis before confirming the DB write is incorrect and must be fixed.

### Watch Out For
Do not combine the response save and synthesis trigger into a single async function that could partially fail. Keep them as sequential, explicitly awaited steps with error handling at each stage.

---

## [2026-02-25] — `_ai` columns are write-once after first generation

**Area:** AI Synthesis, Schema  
**Type:** Decision

### What
Any column ending in `_ai` (e.g. `synthesis_paragraph_ai`, `star_situation_ai`, `highlight_summary_ai`, `ai_generated_name_ai`) is written once on first synthesis and never overwritten by any subsequent operation.

### Why
These columns represent the original AI output for each achievement. Preserving them enables a future "revert to original AI version" feature. They also serve as an audit trail for AI output quality. If we allowed overwrites, this history would be permanently lost.

### Impact
- Before writing to any `_ai` column, always check if it already has a value. If it does, skip the write.
- When a user edits synthesis content, only the live column (without `_ai` suffix) is updated.
- When synthesis is re-run (e.g. via Retry), the `_ai` columns must not be touched.
- App logic — not the database — is responsible for enforcing this rule.

### Watch Out For
The most common mistake would be re-running synthesis on a Retry and overwriting `_ai` columns. Write a check: `if (!achievement.synthesis_paragraph_ai) { /* write _ai */ }`.

---

## [2026-02-25] — Soft deletes on all major tables

**Area:** Schema, Data Integrity  
**Type:** Decision

### What
No user-facing data is ever hard deleted. All major tables have a `deleted_at TIMESTAMPTZ nullable` column. Deletion sets `deleted_at = now()`. All read queries filter `WHERE deleted_at IS NULL`.

### Why
Hard deletes are permanent and unrecoverable. Soft deletes allow for future undo functionality, support investigation if a user believes their data was lost, and provide a safer user experience. Storage cost at this scale is negligible.

### Impact
Every Supabase query that reads user data must include `.is('deleted_at', null)`. Missing this filter will cause deleted records to appear in the UI. This is a common source of bugs — check this first if "deleted" data is reappearing.

### Watch Out For
Forgetting `.is('deleted_at', null)` on joins and secondary table reads (not just the primary table). For example, if fetching achievements for an entry, also filter soft-deleted achievements even if the entry itself is not deleted.

---

## [2026-02-25] — Project summary update logic: prompt vs. auto-overwrite

**Area:** AI Synthesis, Projects  
**Type:** Decision

### What
When a new achievement is added to a project, the project summary update behavior depends on whether the user has manually edited the summary:
- If `highlight_summary_last_edited_at IS NULL` → auto-update `highlight_summary` (live field) with the new AI-generated summary
- If `highlight_summary_last_edited_at IS NOT NULL` → show a "New achievements added — update your summary?" prompt. Do not auto-overwrite.

### Why
Auto-overwriting a user's manual edits without warning would be a destructive action that erodes trust. Users who have invested effort in crafting their project summary should not have it silently replaced. The `highlight_summary_last_edited_at` timestamp acts as a "has the user touched this" flag.

### Impact
The project summary regeneration flow must always check `highlight_summary_last_edited_at` before deciding whether to auto-update or show the prompt. `highlight_summary_ai` (original) is never overwritten regardless.

### Watch Out For
Make sure that when a user *accepts* the "update summary" prompt, the new AI summary is written to `highlight_summary` (live field) only — not to `highlight_summary_ai`. Also update `highlight_summary_last_edited_at` if the user accepts the prompt-driven update, since they've now "touched" the summary.

---

*This log is maintained throughout development. Every meaningful decision, bug fix, and prompt change should be recorded here.*
*See CLAUDE.md Section 13 for format and guidelines.*
