# Web Testing Checklist — Career Memory V1

Complete this checklist before launching. Test on Chrome. Mark [x] as each passes.

---

## Auth & Onboarding

### Sign In
- [ ] Email + password fields work, eye icon toggles visibility
- [ ] Sign-in button disabled until both fields filled
- [ ] Loading spinner while authenticating
- [ ] Successful sign-in redirects to Home (or Onboarding if first time)
- [ ] Failed sign-in shows red error message
- [ ] "Sign up" link navigates to sign-up screen

### Sign Up
- [ ] Password strength meter updates (Too short / Moderate / Strong)
- [ ] Confirm password field present with its own eye toggle
- [ ] "Passwords don't match" error shows when fields differ
- [ ] Create account disabled until email filled + password >= 8 chars + passwords match
- [ ] Successful signup shows confirmation screen ("Check your email")
- [ ] "Go to sign in" button works from confirmation

### Onboarding
- [ ] Welcome step: gradient background, feature rows, "Get started" button
- [ ] Name step: first name required, continue disabled until filled, saves to DB
- [ ] Company step: optional, skip works, company saves with is_current=true
- [ ] Notifications step: cadence selection, day picker, time picker, timezone pills, saves schedule
- [ ] All Set step: "Log my first achievement" goes to /entry/new, "Take me to the app" goes to Home
- [ ] Progress dots update correctly across steps
- [ ] Back buttons work at each step

---

## Navigation & Layout

- [ ] Sidebar: 220px, logo, "Log achievement" CTA, 4 nav items, profile footer
- [ ] Active nav item highlighted in moss
- [ ] Settings opens as full-screen overlay (not a tab)
- [ ] Avatar tap on Home opens Settings
- [ ] Close button (X) on Settings returns to previous screen

---

## Home Screen

- [ ] Greeting matches time of day (morning/afternoon/evening)
- [ ] User's first name displays
- [ ] Loading spinner shows before stats/highlights load
- [ ] Recent Focus: "Add a few more entries..." if <3 entries, AI summary if >=3
- [ ] CTA card: moss green, mic icon, tap goes to /entry/new
- [ ] Stats: counts are correct, tappable:
  - [ ] Entries count goes to Entries tab (By Entry view)
  - [ ] Achievements count goes to Entries tab (By Achievement view)
  - [ ] Projects count goes to Projects tab
- [ ] Highlights: amber star icon, name, type label, chevron
  - [ ] Achievement highlight goes to /achievement/[id]
  - [ ] Project highlight goes to /project/[id]
- [ ] Empty highlights: "Mark an achievement as a highlight..."

---

## Add Entry Flow

### Step 1 — Input
- [ ] "What did you accomplish?" main input works
- [ ] Synthesize button disabled until >3 chars, hint text shows when disabled
- [ ] STAR accordion rows expand/collapse, green dot when filled
- [ ] Project picker: dashed pill, dropdown, select or create new
- [ ] Voice recorder: tap mic, recording with timer, stop, transcribing, text appears
- [ ] Voice transcript appends to existing text

### Step 2 — Processing
- [ ] Full-screen overlay, no interaction possible
- [ ] Pulsing orb animation (moss gradient)
- [ ] Step text cycles: Reading, Identifying, Building, Finalizing
- [ ] Progress dots fill as stages complete

### Step 3 — Review
- [ ] AI-generated name displays (tap to edit)
- [ ] AI Summary Card (moss gradient, white text)
- [ ] "Edit summary" link opens inline editor
- [ ] Bullets display
- [ ] STAR breakdown (4 cards: Situation, Task, Action, Result)
- [ ] Tags: removable chips, AI suggestions visible
- [ ] Completeness score shows percentage
- [ ] Project picker works
- [ ] Multi-split: if detected, amber prompt card appears
  - [ ] Expand to see splits with checkboxes
  - [ ] Accept splits: original soft-deleted, new achievements created
  - [ ] Dismiss: keeps single achievement
- [ ] "+ Add another" saves, resets to Step 1 (same entry date)
- [ ] "Save & done" saves, navigates home

### Error Handling
- [ ] Synthesis failure shows error view with Retry + Skip buttons
- [ ] Retry re-calls synthesis (user input already saved)
- [ ] Skip navigates to Entries (data preserved)

---

## Entry Detail

- [ ] Back button goes to Entries tab
- [ ] Date formatted correctly (no timezone shift)
- [ ] AI summary card displays if summary exists
- [ ] Achievements list with AchievementCards
- [ ] Not found: /entry/nonexistent-id shows "This entry could not be found." + "Go to Entries" button
- [ ] Empty achievements: no orphaned "ACHIEVEMENTS" label, shows subtle note

---

## Achievement Detail

- [ ] Back button works
- [ ] AI name, date, company display
- [ ] Synthesis paragraph + bullets + STAR breakdown
- [ ] Edit mode: name, summary, STAR fields become editable
  - [ ] Save persists changes (live columns only, _ai untouched)
  - [ ] Cancel reverts
- [ ] Highlight toggle: star icon, amber tint when active
- [ ] Tags:
  - [ ] Confirmed tags show as filled chips
  - [ ] Remove tag sets is_confirmed=false (not hard delete)
  - [ ] Tag autocomplete: dropdown opens on focus, filters as you type
  - [ ] Already-linked tags excluded from suggestions
  - [ ] Select tag adds to achievement
  - [ ] Custom tag via Enter key (normalized slug)
- [ ] Project picker: add/change/remove project association

---

## Entries Tab

- [ ] "By Entry" / "By Achievement" segmented toggle
- [ ] By Entry: entry cards sorted by date desc, date + achievement count + company
- [ ] By Achievement: flat achievement list sorted by date desc
- [ ] Highlighted achievements show amber accent bar + star
- [ ] Tapping card goes to correct detail page
- [ ] Empty state: "You haven't logged anything yet." + CTA

---

## Summary Tab

- [ ] Grouped by company/role (RoleBlock)
- [ ] Each role: top moss bar, company name, role title, date range
- [ ] Achievements listed under roles with synthesis + bullets
- [ ] Copy: copies formatted text to clipboard, "Copied" toast
- [ ] Export: downloads as .txt
- [ ] Empty state: "Summaries will generate once you create an entry."

---

## Projects Tab

- [ ] Filter pills: All / Active / Completed
- [ ] Project cards: name, achievement count, status badge
- [ ] Highlighted projects: amber top bar + amber folder icon
- [ ] Tap goes to /project/[id]
- [ ] "New project" button opens modal (name required, description optional)
- [ ] Project creation saves and appears immediately
- [ ] Empty state with CTA

---

## Settings

### Profile
- [ ] Shows name, email, company pill
- [ ] Edit: first name (required), last name (optional), save works

### Notifications
- [ ] Schedule list with toggle switches
- [ ] Add schedule goes to notification editor
- [ ] Edit schedule goes to pre-filled editor
- [ ] Delete schedule: inline confirmation, soft delete
- [ ] Web info note: "Push notifications available on mobile only"

### Notification Editor
- [ ] Cadence selector (weekly/biweekly/monthly/quarterly)
- [ ] Day picker (for weekly/biweekly)
- [ ] Time picker: hour pills, minute pills, AM/PM
- [ ] Timezone pills (scrollable, auto-detects browser TZ)
- [ ] Preview card updates dynamically
- [ ] Save creates/updates schedule

### Preferences
- [ ] Synthesis format selection
- [ ] Save shows "Preferences saved" confirmation

### Tags
- [ ] List of all tags with usage counts
- [ ] Delete tag shows confirmation

### Companies
- [ ] List of companies with role, dates, "Current" badge
- [ ] Add company opens editor
- [ ] Edit company opens editor with fields pre-filled
- [ ] Mark as current: previous current auto-unset
- [ ] Dates display as "Mon YYYY" (no timezone shift)
- [ ] Delete shows confirmation modal

### Account
- [ ] Sign out clears session, navigates to sign-in
- [ ] Delete account: confirmation modal, deletes data, navigates to sign-in

---

## Error Handling & Edge Cases

- [ ] ErrorBoundary: force a render error shows "Something went wrong" + "Try again" / "Go home"
- [ ] No raw error messages or stack traces shown to user
- [ ] All error states have Retry buttons where applicable
- [ ] Navigating to invalid routes handles gracefully
- [ ] Very long achievement text (1000+ chars) synthesizes correctly
- [ ] Achievement with no synthesis shows fallback display
- [ ] Company with no role title or dates displays gracefully

---

## Data Integrity

- [ ] _ai columns never overwritten after first synthesis
- [ ] Soft deletes: deleted_at set, record hidden from all queries
- [ ] All queries filter user_id + deleted_at IS NULL
- [ ] Tag slugs normalized on write (lowercase, underscores, trimmed)
- [ ] is_confirmed=false on tag removal (not hard delete)
- [ ] Save-before-synthesize: raw responses in DB before AI call
- [ ] Company is_current constraint: only one true per user
- [ ] company_name_snapshot populated on achievement creation

---

## Visual Spot Checks

- [ ] Background: #F5F0E8 (warm parchment)
- [ ] Cards: #FAF7F2 with 14-16px radius, subtle border + shadow
- [ ] Moss green: #5C7A52 on buttons, active nav, accent bars
- [ ] Amber: #C9941A on highlights, stars
- [ ] Fonts: Nunito for headings/names, DM Sans for body/labels
- [ ] AI Summary Cards: moss gradient background, white text
- [ ] Left accent bars: 3px, moss (default) or amber (highlight)
