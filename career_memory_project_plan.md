# Career Memory App — Project Plan
**Version 1.2 · Living Document**

---

## 1. Product Vision

### The Problem
People do great work but it evaporates from memory. When it's time to update a resume, prepare for a performance review, or go through a job search, they struggle to recall and articulate what they actually accomplished. The pain is sharpest during job searches — when you need to be specific, confident, and detailed about your impact.

### The Solution
A voice-first career memory app that makes it effortless to capture accomplishments as they happen, and equally effortless to use them when it counts. The app captures what you did, helps you articulate why it mattered, and organizes it into a format that's immediately useful for resumes, LinkedIn updates, performance reviews, and interview prep.

### The One-Sentence Pitch
*A career memory layer that captures what you accomplish, synthesizes it into something usable, and makes it available exactly when you need it.*

### Origin Story (North Star)
The initial pain point was a job search where the user realized how hard it was to remember accomplishments across years of work — making it challenging to update LinkedIn, write a resume, and prepare for interviews. A secondary inspiration was a "one line a day" journal that showed how powerful a regular record of experiences can be for reflection. Both use cases are served by this app.

---

## 2. Target Audience

### V1 (Personal Use)
Built initially for personal use, but architected for multi-user from day one.

### B2C (Primary Commercial Goal)
Individuals tracking their own career progress. The primary user is a professional who wants a low-friction way to document their work and have it ready when career moments arise.

### B2B (Future)
A natural B2B extension exists — employees logging progress, managers viewing team highlights, achievements feeding into performance reviews. The individual flow being built now is the right foundation. The B2B layer adds a "share with manager" toggle and a manager dashboard later, with no architectural changes required.

### Design Principles
- Multi-user from day one
- Persistent across devices (mobile + web)
- Secure authentication
- Built to scale

---

## 3. Core Concepts and Mental Models

Understanding these concepts is critical for making good implementation decisions.

**Session** — A check-in moment. Either triggered by a scheduled notification or created manually (off-cadence). Sessions are the parent container.

**Entry** — The container within a session for a specific date and section type (professional/personal). Entries are identified by their date — they do not have an AI-generated name. An entry has an AI-generated summary that appears beneath the date on cards and in the entry detail view.

**Achievement** — The core unit. One discrete accomplishment. An entry can have multiple achievements. Each achievement has its own questions, responses, AI synthesis, STAR structure, tags, and an AI-generated name.

**Project** — A user-defined grouping that links related achievements across multiple entries and dates. Projects have their own AI-generated summary that updates as achievements are added.

**Highlights** — A flag on either an individual achievement or an entire project. Highlights are surfaced on the Home screen and represent the user's curated best-of list.

**Summary Page** — The resume view. Organized by company/role, with projects as sections and standalone achievements as bullets. This is the primary output surface for real-world use.

---

## 4. Technical Stack

### Frontend
**React Native with Expo** — iOS, Android, and web from one codebase. Expo handles push notifications cleanly. Web version runs in browser with a responsive layout.

### Backend / Database
**Supabase** — Postgres database, auth (including social sign-in), real-time, file storage for audio. Open source, not locked in, scales well for B2C.

### Transcription
**OpenAI Whisper API** — $0.006/minute, highly accurate, multilingual, simple REST API. Record → stop → transcribe flow. Not real-time streaming (Deepgram is an alternative if streaming is needed later).

### AI Synthesis
**Claude Haiku** — Fast, inexpensive, capable for synthesis, summarization, STAR extraction, tag suggestion, achievement naming, and project summary generation. Synthesis prompt is a core product asset — design it carefully and iterate.

### Push Notifications
Handled via Expo's notification infrastructure.

### Audio Storage
**Supabase Storage** — Audio files stored with a 30-day default expiry (`audio_expires_at` field). A Supabase Edge Function (cron) runs nightly to delete expired files. Users are informed that audio expires. Cost is negligible at early scale (~$0.021/GB/month).

### Billing (Future)
Stripe via Supabase integration. Subscriptions table is in schema from day one.

---

## 5. Visual Design System

### Color Palette — "Parchment & Moss"

| Token | Hex | Usage |
|-------|-----|-------|
| `moss` | `#4A6642` | Primary brand color. Buttons, active states, nav highlights, status badges (active) |
| `moss-light` | `#5C7A52` | Gradient endpoint, hover states, secondary accents |
| `moss-faint` | `#EDF2EB` | Light tinted backgrounds, selected states, subtle fills |
| `parchment` | `#FAF8F5` | App background. Warm off-white base |
| `parchment-dark` | `#F0EDE8` | Card backgrounds, input fields, secondary surfaces |
| `amber` | `#D4A843` | Highlights. Star icons, highlight accent bars, highlight header tint |
| `amber-light` | `#FBF5E6` | Highlight card tint background |
| `umber` | `#8B7355` | Secondary text, muted labels, empty-state italic text, completed status badge |
| `umber-light` | `#B8A88A` | Borders, dividers, disabled states |
| `charcoal` | `#2C2C2C` | Primary text |
| `charcoal-light` | `#5A5A5A` | Secondary body text, descriptions |
| `white` | `#FFFFFF` | Card surfaces, overlays, text on dark backgrounds |
| `danger` | `#C0392B` | Destructive actions, clear filters, delete confirmation |
| `danger-light` | `#FDECEA` | Danger background tint |

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Headings | Nunito | Bold (700) | Page titles, section headers, greeting |
| Numbers | Nunito | Bold (700) | Stats row large numbers |
| AI names | Nunito | SemiBold (600) | Achievement names, project names on cards |
| Body | DM Sans | Regular (400) | Paragraphs, descriptions, synthesis text |
| Labels | DM Sans | Medium (500) | Button text, tag labels, field labels |
| Captions | DM Sans | Regular (400) | Dates, metadata, helper text |

### Card Design Language

- **Border radius:** 12px on all cards
- **Border:** 1px solid `umber-light`
- **Shadow:** `0 1px 3px rgba(0,0,0,0.06)` — subtle, never heavy
- **Background:** `white`
- **Left accent bar:** 3px wide, sits flush with the left edge of the card
  - `moss` — used on entry cards and achievement cards (default state)
  - `amber` — used on any card where the item is marked as a highlight
- **Top accent bar:** 3px wide, sits flush with the top edge of the card
  - `moss` — used on project cards and role blocks on the Summary page

### AI Summary Card

Used for Recent Focus on Home and project summaries on Project Detail.

- **Background:** Linear gradient from `#4A6642` (moss) to `#5C7A52` (moss-light), left to right
- **Text:** `white`, DM Sans Regular
- **Label:** "AI Summary" in small caps or uppercase `white` at 60% opacity, top-left of card
- **Body:** Light weight, generous line height (1.6). Readable and calm.
- **Border radius:** 12px, consistent with all cards

### Status Badges

- **Active:** Moss background (`moss-faint`), moss text (`moss`), rounded pill shape
- **Completed:** Umber background (light tint), umber text (`umber`), rounded pill shape
- **Archived:** Same as completed but with italic text

### Highlight Visual Treatment

- **Card left accent bar:** Switches from `moss` to `amber` when the item is a highlight
- **Star icon:** Filled `amber` star on highlighted cards and in the highlights reel
- **Header button:** When highlight toggle is active on Achievement Detail, the star button has a subtle `amber-light` tint behind it
- Consistent across all surfaces: Home highlights reel, Entry cards, Achievement cards, Project cards

---

## 6. Navigation Architecture

### Mobile — Bottom Tab Bar (4 tabs)
| Tab | Icon | Contents |
|-----|------|----------|
| **Home** | Home icon | Dashboard, recent focus summary, stats, highlights reel |
| **Summary** | Document icon | Resume view organized by role/company |
| **Entries** | List icon | Chronological entry/achievement library |
| **Projects** | Folder icon | Project list and project detail views |

**Settings** lives behind a profile/avatar icon in the top-right header of the Home screen. Not a tab.

### Web / Desktop — Left Sidebar
Mirrors the tab structure as a persistent left sidebar, similar to Claude.ai's layout. Navigation items: Home, Summary, Entries, Projects. Settings accessible from profile in the sidebar footer. Content area fills the remaining space.

### Navigation Decisions
- Achievements are NOT a top-level nav item. They are accessed by tapping into an Entry.
- Entries has a toggle: **By Entry** (default) | **By Achievement** (flat list of all achievements)
- Settings and Preferences are combined — no split between them
- The profile avatar on Home opens Settings as a full-screen overlay, not a tab.

### Deep-Link Navigation

| Trigger | Destination |
|---------|-------------|
| Tap "Entries" stat on Home | Entries tab, By Entry view |
| Tap "Achievements" stat on Home | Entries tab, By Achievement view |
| Tap "Projects" stat on Home | Projects tab |
| Tap achievement highlight on Home | That achievement's detail page directly |
| Tap project highlight on Home | That project's detail page directly |
| Tap project pill on Achievement Detail | That project's detail page |

---

## 7. Page-by-Page Specifications

---

### 7.1 Home

**Purpose:** Fast orientation, capture prompt, progress at a glance.

**Components (top to bottom):**

1. **Header** — "Welcome back, [First Name]" personalized using `first_name` from users table. Right side: avatar/initial circle. Tapping opens the Settings overlay.

2. **Recent Focus** — An AI-generated paragraph summarizing the last 3 entries. Cohesive, friendly, plain language. Not detailed — a "pump up" overview of what the person has been working on and any big achievements. Intelligent enough to recognize a project spanning multiple entries and summarize it as one thread rather than repeating it. If a project appears across multiple entries, it's referenced holistically. Displayed in the AI Summary Card style (green gradient, white text).
   - **Cold start (< 3 entries):** "Add a few more entries to get your overview."
   - **1–2 entries:** Summarizes what exists with a note that more entries will enrich it.

3. **Add Entry Button** — Prominent CTA. Takes user to the Add Entry dedicated page.

4. **Stats Row** — Three stats in a horizontal row. Large number (Nunito Bold), smaller label beneath. Clean and visually prominent. Each stat card is tappable and navigates to the corresponding view:
   - **Total Entries** → Entries tab, By Entry view
   - **Total Achievements** → Entries tab, By Achievement view
   - **Total Projects** → Projects tab
   - *Future: last month, last quarter, trends*

5. **Highlights Reel** — Vertical list of highlighted items (achievements and projects marked as highlights). Each row: filled amber star icon + AI-generated name. Tapping an achievement highlight deep-links directly to that achievement's detail page. Tapping a project highlight deep-links directly to that project's detail page.
   - **Empty state:** "Mark an achievement as a highlight and it'll appear here."

---

### 7.2 Summary

**Purpose:** The resume view. This is where users go to update their LinkedIn, write a resume, or prep for a review. The highest-value output surface in the app.

**Structure:**
- Organized by **Company / Role** (most recent at top)
- Within each role: **Projects** appear as named sections, each with their project summary
- **Standalone achievements** (not part of a project) appear as bullets under the role using the achievement summary text
- New achievements added to a project automatically trigger a regeneration of the project summary

**Auto-update behavior:**
- If an achievement belongs to a project → the project summary regenerates (AI updates `highlight_summary_ai`). If the user has ever manually edited `highlight_summary`, they receive an indicator: "New achievements added — tap to update your summary" rather than silently overwriting their edits.
- If an achievement is standalone → it appears automatically as a new bullet under the role.

**Copy / Export — Decided: Option D**
- **Copy icon at the role/company level** — copies everything under that role as formatted plain text
- **Copy icon at the project level** — copies the project summary and its bullets as formatted plain text
- No copy icon at the individual achievement level — users can grab individual content by tapping into the achievement itself
- **Export button at the top of the page** — opens a modal with "Copy all as text" as the one active V1 option, and a "More export options coming soon" placeholder that establishes the pattern for future integrations (PDF, Google Doc, LinkedIn, Notion)

**Future exports:** PDF, Google Doc, LinkedIn copy, Notion, resume bullet generator

**Empty state:** "Summaries will generate once you create an entry."

---

### 7.3 Entries

**Purpose:** Chronological library of everything logged.

**Header:** Page title with two action buttons to the right: "Add new" button (moss green with + icon, opens the Add Entry page) and a Filter button. The Filter button shows a "●" indicator when any filter is active.

**Default View: By Entry**
- Most recent at top
- Each Entry Card shows:
  - Date (primary identifier — entries do not have AI-generated names)
  - AI-generated entry summary (short paragraph beneath the date)
  - Number of achievements included
  - Company tag (if set)
- Tapping an entry card goes to Entry Detail

**Toggle View: By Achievement**
- Flat list of all achievements across all entries
- Each Achievement Card shows:
  - Date
  - AI-generated achievement name
  - Achievement summary (short)
  - Parent entry date (smaller, beneath)
  - Highlight indicator (star icon) if flagged
- Tapping goes to Achievement Detail

**Filters (V1):**
- Filter by Project (dropdown)
- Date range picker
- "Clear filters" button appears in `danger` color when any filter is active

**Future filters:** Company, Tag, Highlight only

**Entry Detail Page:**
- Entry date (large, at top)
- AI-generated entry summary paragraph (editable)
- List of Achievement Cards below (each tappable)

**Achievement Detail Page:**
- Breadcrumb text is dynamic: shows the entry date when navigating from Entries, shows the project name when navigating from Projects
- AI-generated achievement name (editable by user)
- Synthesis paragraph (editable)
- Synthesis bullets (editable)
- STAR breakdown (situation, task, action, result — each editable). Empty STAR fields show "Not captured" in italic `umber` text.
- Tags (AI-suggested chips + ability to add/remove). Tapping the project pill navigates to that project's detail page.
- Project association (if any)
- Company tag
- Date
- Highlight toggle (star icon)
- "Your notes" section — shows each question and the user's answer (typed or transcribed). Labelled "Your notes" not "Questions and answers." **Not shown at all if no notes/responses exist** (not just collapsed — completely hidden).
- Completeness flags (V2 — data stored now, UI ships later)

**Achievement count note:** Achievement count displayed on project cards and entry cards is computed live from the database — never stored as a denormalized count field.

**Highlight visual treatment:** Amber left accent bar + filled amber star icon on cards (consistent across Entries, Projects, and Home). Must be scannable without being loud.

---

### 7.4 Projects

**Purpose:** Achievement library organized by theme rather than date.

**Project List View:**
- Each Project Card shows:
  - Project name
  - Status badge (Active / Completed / Archived)
  - Achievement count (computed live, not stored)
  - Company association (if set)
  - Highlight indicator (if project is marked as highlight)
- Tapping goes to Project Detail

**Project Detail Page:**
- Project name (large, at top)
- AI-generated project summary (updates as achievements are added)
- All achievements for this project listed in chronological order as Achievement Cards
- Each achievement card is tappable into Achievement Detail

**Empty state:** "Create a project and tag achievements to it — your project summary will appear here."

---

### 7.5 Settings

**Entry point:** Opens as a full-screen overlay from the Home avatar/initial circle tap.

**Main List Layout:**
- **Profile card** at top — shows user's name, email, and avatar. Tappable to edit.
- **App group:**
  - Notifications
  - Preferences
  - Tags
- **Account group:**
  - Company history
  - Sign out
- **Delete account** — footer link in `danger` color

**Profile:**
- First name (editable)
- Last name (editable)
- Email (read-only display)
- Current company (read-only, shows current company name — edit via Company history)
- Default role title (editable)
- Timezone (editable dropdown, IANA format)

**Notifications:**
- List of existing notification schedules, each with:
  - Label, cadence, day, time summary
  - Toggle switch to enable/disable (`is_active`)
  - Tap to edit schedule details
- "Add schedule" button at bottom

**Preferences:**
- Synthesis format: segmented control or radio group — Paragraph / Bullets / STAR / All (default: All)
- Theme: segmented control — Light / Dark / System (default: System)
- Notification sound: toggle switch (default: on)
- Audio retention: slider, 7–90 days (default: 30). Label shows current value: "Audio files are deleted after [N] days"

**Tags:**
- System tags displayed as read-only chips (grouped by category)
- Custom tags section below with add/remove capability
- "Add tag" input with name field and category dropdown

**Company History:**
- List of all companies (active and past), sorted with current company first
- Each row shows: company name, role title, date range, "Current" badge if `is_current = true`
- Tap to edit: name, role title, start date, end date, `is_current` toggle
- "Add company" button at bottom
- When marking a new company as current: previous current company auto-sets `is_current = false` and prompts for `end_date`

**Delete Account:**
- Tapping triggers a confirmation modal: "Are you sure you want to delete your account? This action cannot be undone."
- Requires explicit confirmation (type "DELETE" or tap-and-hold) — not immediate on tap

---

## 8. Add Entry Experience

### Entry Point
- "Add Entry" button on Home
- "Add new" button on Entries tab
- Opens as a **dedicated full-page experience on all platforms** (mobile and web/desktop). Consistent behavior across platforms. Back button / close to dismiss.

### Flow

**Step 1: The Entry**

A single screen with:
- Large input area at top labeled **"What did you accomplish?"**
- Helper subtext beneath (STAR-oriented guidance without using the word "STAR"):
  *"Think about what you were working on, why it mattered, what you specifically did, and what the outcome was."*
- A prominent **microphone button** for voice input
- A **keyboard toggle** for typed input
- Below the main input: the STAR questions listed as **collapsible accordion rows** — tappable to expand and answer. Framed as "Add more detail" not as required fields. A filled green dot appears on the row when that question has been answered.
  - What was the situation or challenge?
  - What did you specifically do?
  - What was the result or impact?
  - Do you have any numbers or metrics?
  - What skills did this highlight?
  - Anything else worth capturing?
- **Project selector** — uses the Inline Project Picker component (same component used in Achievement Detail). Optional, with ability to add new project inline. Lives below the questions.
- **Synthesize button** — sticky at bottom. Disabled (grey) until the main input has >3 characters. Hint text beneath when disabled: "Write something above to continue." Prominent moss green once activated.

**Critical implementation rule:** Raw responses are written to the database BEFORE synthesis is triggered. If synthesis fails, the user's words are never lost.

**Step 2: AI Processing**

Full-screen overlay (not a spinner or inline indicator). Centered vertically.

- **Pulsing animated orb** — moss green gradient (`#4A6642` → `#5C7A52`), scale + opacity loop animation
- **Step text** cycles through stages:
  - "Reading your entry…"
  - "Identifying achievements…"
  - "Building your synthesis…"
  - "Finalizing…"
- **Progress dots** — 4 dots below the text that fill/elongate as each step completes
- User cannot interact during processing

**Step 3: Post-synthesis Review**

- Achievement card appears with:
  - AI-generated name (editable)
  - AI Summary Card showing synthesis paragraph. "Edit summary" link beneath for inline editing.
  - Synthesis bullets (editable)
  - STAR breakdown (editable)
  - AI-suggested tags shown as removable chips. Below them: up to 5 system tag suggestions displayed as dashed `+ Tag name` pills. Tapping a suggestion adds it as a confirmed tag. Enter key in the tag input also adds a custom tag.
- If the AI detects multiple distinct achievements in the input, a single prompt appears: **"Looks like you covered a few things. Want to split these into separate achievements?"** Yes/No. If yes, AI proposes named splits the user accepts with one tap each.
- **Bottom bar** has two buttons:
  - **"+ Add another"** (secondary) — saves the current achievement and resets Step 1 for another achievement under the same entry date
  - **"Save & done"** (primary) — saves and closes, returns to previous screen

### Two Natural Usage Styles (same flow, different patterns)
- **Freeform user:** Opens app, hits record, talks for 3 minutes, hits Synthesize. AI does the work. Done in 4 minutes.
- **Structured user:** Opens app, answers each STAR question carefully, gets richer synthesis. More effort, higher output quality.

No mode choice required upfront. The flow accommodates both naturally.

### Error States
- Plain English error messages
- Styled as part of the UI (not a raw error alert)
- Always include a **Retry** button
- The user's responses are always preserved — they never have to re-enter

---

## 9. AI Synthesis Specifications

### What Claude Haiku Produces Per Achievement
All fields are generated in a **single API call** per achievement — not separate requests.

1. **AI-generated name** — short, descriptive title. 4–7 words, no punctuation. Generated in the same API call as synthesis. Fallback display while generating: "[Date] achievement". Examples: "Launched partner API integration", "Led Q3 cost reduction initiative"
2. **Synthesis paragraph** — cohesive readable summary
3. **Synthesis bullets** — key accomplishments as bullet points
4. **STAR breakdown** — situation, task, action, result extracted as structured fields
5. **Tag suggestions** — based on content, mapped to existing tag taxonomy
6. **Completeness flags** — array of missing STAR components (stored for V2 nudge)
7. **Completeness score** — 0–100 (stored for V2 nudge, not shown in V1 UI)

### AI Write-Once Rule
All `_ai` columns are **write-once after first generation**. App logic must enforce:
- Never overwrite `ai_generated_name_ai`, `synthesis_paragraph_ai`, `synthesis_bullets_ai`, `star_*_ai`, `ai_generated_summary_ai`, `highlight_summary_ai` after first write
- Only the live columns (without `_ai` suffix) are updated when users edit
- This enables "revert to original AI version" feature later

### Per-Entry AI Generation
- **Entry summary** — short cohesive paragraph summarizing all achievements in the entry. Generated after achievements are synthesized. Displayed beneath the entry date on cards and in entry detail. User-editable (live column), original preserved in `_ai` snapshot column.
- Entries do NOT have an AI-generated name — the date is the identifier.

### Per-Project AI Generation
- **Project summary** — generated or regenerated whenever a new achievement is added to the project
- If user has manually edited the project summary: show "New achievements added — update your summary?" instead of auto-overwriting

### Home "Recent Focus"
- Triggered on Home load
- Summarizes last 3 entries
- Recognizes cross-entry projects and summarizes them holistically
- Friendly, plain language, short (2–4 sentences)

---

## 10. Highlights System

### Two Types of Highlights
1. **Achievement highlight** — individual accomplishment flagged by user. Has an optional `highlight_note` (one-liner on why it matters).
2. **Project highlight** — entire project flagged. Has a `highlight_summary` (cross-achievement AI synthesis for the project as a whole).

### Where Highlights Surface
- **Home screen** — Highlights Reel: vertical list, filled amber star icon + AI-generated name, tappable to deep-link
- **Entries and Projects views** — amber left accent bar + filled amber star on cards
- **Summary page** — highlighted projects are visually distinguished in the resume view

### No Separate Highlights Tab
Highlights are a lens on existing data, not a separate data type. They surface contextually across the app.

---

## 11. Onboarding Flow

### Philosophy
Get the user to their first meaningful moment in the app as fast as possible while collecting the minimum information needed for the app to work. Onboarding ends with the user's first entry — but skipping is always allowed and the account is fully active regardless of completion status.

### 6-Screen Flow

**Screen 1 — Welcome + Sign-in**
Clean welcome screen with the app name and one-line value proposition. Sign-in options: email/password, Google, Apple (Apple required for iOS App Store).

**Screen 2 — Your Profile**
First name (required), last name (optional), timezone (auto-detected from device, shown as a confirmable dropdown). Progress indicator visible.

**Screen 3 — Your Current Role**
Company name (text input), role title (text input). Both optional. Framing: *"This helps us organize your achievements automatically. You can update this anytime in settings."* Skip link at bottom.

**Screen 4 — Your Reminder**
Cadence selector (weekly / monthly / quarterly), day picker, time picker. Pre-filled with smart default: weekly, Monday, 9am. Skip link available. One-liner: *"We'll send you a prompt so logging never slips through the cracks."*

**Screen 5 — Guided Tour (skippable)**
3-card value tour with left/right arrow navigation and a persistent Skip option visible at all times. Not a feature tour — a value tour.
- Card 1: *"Log what you accomplish — by voice or text, in seconds."*
- Card 2: *"Every entry gets organized into a searchable career library."*
- Card 3: *"When you need it, your Summary page is a ready-made resume."*

**Screen 6 — First Entry Prompt**
Framing: *"Let's log your first achievement. What's something you've worked on recently?"* Launches the full Add Entry experience as the final onboarding step. Completing it sets `onboarding_complete = true`.

### Skipping
An "I'll do this later" link on Screen 6 goes directly to Home. The account is fully active. `onboarding_complete` stays `false` but no persistent nudge is shown — the prominent Add Entry button on Home serves as the natural re-entry point.

### Page-Level Guided Tours
The first time a user lands on each main page, a connected tooltip sequence highlights specific UI elements one at a time. Arrow navigation advances through the sequence. Skip exits the entire tour. Each tour shows once — dismissed state tracked via `has_seen_*_tour` preference keys in `user_preferences`.

| Page | Tour sequence |
|------|--------------|
| **Entries** | 1. Toggle — "Switch between entries and individual achievements" · 2. Filters — "Filter by project or date range to find what you need" · 3. Entry card — "Tap any entry to see its achievements" |
| **Projects** | 1. Project list — "Projects group related achievements together across time" · 2. Status badge — "Track whether a project is active, completed, or archived" · 3. Project card — "Tap in to see the AI-generated summary and all achievements" |
| **Summary** | 1. Role section — "Your achievements are organized by role, most recent first" · 2. Project section — "Projects appear as named sections with their own summary" · 3. Copy icon — "Copy any section directly to your clipboard" · 4. Export button — "Export everything at once from here" |

Home tour is covered by the onboarding flow itself — no separate page tour needed.

---

## 12. Empty States (Complete List)

| Location | Empty State Text |
|----------|-----------------|
| Home — Recent Focus | "Add a few more entries to get your overview." |
| Home — Stats | Show 0s |
| Home — Highlights Reel | "Mark an achievement as a highlight and it'll appear here." |
| Summary | "Summaries will generate once you create an entry." |
| Entries | "Add Entry" button + "Log your first achievement to get started." |
| Entries — filtered | "No entries match your filters." |
| Projects | "Create a project and tag achievements to it to see your project summary." |
| Project Detail — achievements | "No achievements linked to this project yet." |
| Achievement detail — Your notes | Not shown if no responses exist |

Every empty state includes a prompt explaining what the user needs to do, and where applicable, a direct action button.

---

## 13. Loading and Error States

### AI Processing
- Full-screen overlay with pulsing moss gradient orb
- Descriptive step text cycling through stages (see Section 8, Step 2)
- Progress dots fill as steps complete
- User cannot interact during processing

### Error States
- Plain English, no technical jargon
- Styled as native UI (not raw alerts)
- Always include a Retry button
- User's input is always preserved before synthesis is attempted

### AI Name / Summary Generation
- Achievement name and synthesis are generated in a single API call — they arrive together
- While processing, cards display "[Date] achievement" as a fallback
- Entry summary generates after all achievements in the entry are synthesized
- Both entry summary and achievement name are user-editable after generation; original AI versions preserved in `_ai` snapshot columns

---

## 14. Data Model Summary

Full schema documented in `career_memory_schema.md`. Key tables:

| Table | Purpose |
|-------|---------|
| `users` | Core identity, profile, timezone, current company |
| `companies` | Each company a user has worked at |
| `notification_schedules` | Multiple schedules per user (weekly, monthly, quarterly, custom) |
| `sessions` | A check-in moment (scheduled or manual) |
| `entries` | Container for achievements within a session. Identified by date + AI summary |
| `professional_achievements` | Core unit — one discrete accomplishment with AI-generated name |
| `achievement_responses` | Each question answer (one row per question) |
| `questions` | System and user-defined questions |
| `projects` | User-defined achievement groupings |
| `tags` | Tag definitions (system + user-created) |
| `achievement_tags` | Many-to-many join with AI vs. manual tracking |
| `user_preferences` | Key-value preference storage including guided tour state |
| `export_history` | Tracks exports (future feature, schema ready) |
| `subscriptions` | Billing / plan management (future, schema ready) |

Schema is finalized at v1.1. No pending updates.

---

## 15. V1 Feature Scope

### In V1
- Professional achievements only (personal section_type in schema, no UI)
- Voice and typed entry
- STAR-structured questions + freeform entry mode (single flow, no mode choice)
- AI synthesis (name, paragraph, bullets, STAR, tags) — single API call per achievement
- Projects with auto-updating AI summaries
- Highlights (achievement-level and project-level)
- Notification schedules (multiple per user)
- Home dashboard (greeting, recent focus, stats, highlights reel)
- Summary page (resume view by role/company, copy icons at role and project level, export modal)
- Entries page (by entry and by achievement toggle, filter by project and date range)
- Projects page
- Settings (profile, company history, notifications, preferences, tags)
- Onboarding flow (6 screens + page-level guided tours)
- Web + mobile (React Native + Expo)
- Supabase auth (email + social sign-in)
- Audio transcription (Whisper API), 30-day retention
- Soft deletes everywhere

### Explicitly Post-V1
- Personal entries section
- Export to PDF, Google Doc, LinkedIn, Notion
- Resume bullet generator per role/company
- Completeness score UI and nudges (data stored in V1, UI in V2)
- Team / manager sharing
- Advanced filters (by company, tag, highlight only)
- Stats beyond totals (monthly trends, quarterly breakdown)
- Billing / subscriptions (schema ready, Stripe integration later)
- STAR follow-up questions (prompted after synthesis gaps detected)
- Full AI achievement extraction approval flow (V2 of freeform mode)
- Skills cloud / tag visualization
- Year in Review / Quarter in Review generated reports
- Integration imports (Slack, API, other platforms)

---

## 16. All Decisions — Status

| # | Decision | Status | Resolution |
|---|----------|--------|------------|
| 1 | New Entry flow | ✅ | Single flow, freeform + optional STAR questions, dedicated full page on all platforms |
| 2 | Onboarding flow | ✅ | 6-screen flow + page-level guided tours. See Section 11 |
| 3 | Project summary — manual edit vs. AI overwrite | ✅ | Show "update your summary?" prompt, never auto-overwrite |
| 4 | AI name generation timing and fallback | ✅ | Generated in same API call as synthesis — not a separate request. Fallback display while generating: "[Date] achievement". 4–7 words, no punctuation |
| 5 | Export / copy UX on Summary page | ✅ | Export dropdown on Summary with "Copy all" functional in V1. "Copy for LinkedIn", "Export .docx", "Export PDF" marked "Soon". Copy button also lives on each role block and each project section individually |
| 6 | Web layout for add entry experience | ✅ | Dedicated full page on all platforms (mobile and web) |
| 7 | Schema final update | ✅ | v1.1 finalized — see career_memory_schema.md |
| 8 | Settings page — company-specific defaults | ⬜ | Not yet decided — when creating a new entry, which company defaults? Currently defaults to current company. Confirm this is always correct or if user should be prompted |

---

## 17. Implementation Notes for Developers

- **Soft deletes everywhere** — all major tables have `deleted_at`. Never hard delete user data.
- **Save before synthesize** — raw responses written to DB before any AI call is triggered. Non-negotiable.
- **`_ai` columns are write-once** — never overwrite after first generation. App logic must enforce this.
- **AI name and synthesis are one call** — `ai_generated_name` and all synthesis fields generate together in a single Claude Haiku call per achievement.
- **Entry summary generates after achievement synthesis** — not before. Triggered once all achievements in an entry are complete.
- **Tag slugs normalized on write** — lowercase, underscores, prevents duplicate tags with different casing.
- **`is_confirmed = false` on `achievement_tags`** — when a user removes an AI-suggested tag, mark false, do not delete. This data feeds future prompt improvement.
- **Subscriptions row created for every new user** — `plan_type = free` from day one so billing logic is always consistent.
- **Timezone stored on notification_schedules independently** — copied from user at creation but stored separately in case user's timezone changes later.
- **`company_name_snapshot` on achievements** — denormalize company name at time of creation. Protects display if user renames a company record later.
- **`question_text_snapshot` on responses** — store full question text at time of answer. Protects display if questions are edited later.
- **Audio retention cron** — Supabase Edge Function runs nightly, deletes audio files where `audio_expires_at < now()`.
- **Guided tour state** — tracked via `has_seen_entries_tour`, `has_seen_projects_tour`, `has_seen_summary_tour` in `user_preferences`. Set to `true` on dismissal, never shown again.
- **`onboarding_complete`** — set to `true` only when user completes first entry. Account is fully active regardless of this value.
- **Achievement count on projects is computed live** — query `professional_achievements WHERE project_id = ? AND deleted_at IS NULL`. Never store as a denormalized count field.
- **Deep-link navigation pattern** — root state holds `targetProjectId` and `targetAchievementId`. Setting either + switching tab causes the receiving tab to open that item on mount, then clears the target to `null`.
- **Highlight toggle should be optimistic** — update local state immediately, persist in background. Do not wait for DB confirmation before reflecting the toggle in the UI.
