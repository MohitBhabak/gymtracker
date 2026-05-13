# Gym Tracker App — Build Specification

## Overview

A clean, intuitive single-page gym tracking web application built as a static HTML file. The app has two core modules: a **Calendar** for logging workout days, and a **Progress Tracker** for recording exercise sets/reps/weight and visualising progression over time. The two modules are deeply integrated — clicking a calendar day opens that day's detailed workout log.

The app should feel like a premium fitness companion: dark-mode first (gym aesthetic), functional and dense without being cluttered, with smooth micro-interactions that make logging feel satisfying.

---

## Tech Stack & Constraints

- **Single static HTML file** — no server, no backend, no build tools
- **All state stored in-memory** using a JavaScript state object (no localStorage)
- **Chart.js via CDN** for progress graphs
- **Lucide Icons via CDN** for all iconography
- **Fonts via Fontshare CDN**: `Cabinet Grotesk` (display/headings) + `Satoshi` (body/UI)
- **Hash-based routing** (`#calendar`, `#progress`) for navigation between views
- Light and dark mode with a toggle — **default to dark mode** (gym aesthetic)
- Fully responsive: designed mobile-first at 375px, scales to 1280px+

---

## Design Direction

**Concept:** A focused, athletic productivity tool. Think Nike Training Club meets Linear.app.

**Tone:** Dark, precise, energetic but not loud. A serious tool for serious training.

**Design tokens to use:**

```
Primary accent:     #4ade80  (vibrant green — "gains" energy, high contrast on dark)
Background:         #0f0f0f  (near-black)
Surface:            #161616
Surface-2:          #1e1e1e
Surface-offset:     #252525
Border:             rgba(255,255,255,0.08)
Text:               #f0f0f0
Text muted:         #888888
Text faint:         #444444
Accent hover:       #22c55e
```

**Typography:**
- Headings/labels: `Cabinet Grotesk`, bold/extrabold
- Body/UI text: `Satoshi`, regular/medium

**Radius:** Use tight radii — `6px` for cards/inputs, `4px` for badges, `999px` for pills/tags.

**Motion:** Subtle and fast. 150–200ms ease-out for state changes. No slow animations. A satisfying "pop" when logging a workout day.

---

## App Shell & Navigation

### Layout

The app uses a **top navigation bar** (not a sidebar) with two primary tabs:

```
┌──────────────────────────────────────────────────────┐
│  💪 GymLog        [ Calendar ]  [ Progress ]   [🌙]  │
└──────────────────────────────────────────────────────┘
│                                                      │
│                   [Active View]                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- **Logo:** "GymLog" in `Cabinet Grotesk ExtraBold` with a small inline dumbbell SVG icon
- **Navigation tabs:** `Calendar` and `Progress` — underline-style active indicator
- **Theme toggle:** moon/sun icon in the top-right corner

### Routing

Use `location.hash` for routing:
- `#calendar` → Calendar view (default)
- `#progress` → Progress Tracker view

---

## Module 1: Calendar

### Layout

The Calendar view is split into two columns on desktop, stacked on mobile:

```
┌──────────────────────────────┬──────────────────────┐
│                              │                      │
│        Monthly Calendar      │   Workout Summary    │
│                              │   Sidebar            │
│                              │                      │
└──────────────────────────────┴──────────────────────┘
```

On mobile (≤768px): Summary sidebar collapses to a compact strip below the calendar.

---

### Calendar Grid

- Displays the **current month** by default
- **Month navigation:** left/right arrow buttons to go to previous/next month. Display the month name and year as a heading above the grid (e.g., "May 2026")
- **7-column grid** with day-of-week headers: `Mon Tue Wed Thu Fri Sat Sun`
- Each day cell shows:
  - The date number (top-left of cell)
  - A **colour-coded workout tag** if a workout was logged (e.g., a small pill badge)
  - A subtle "rest" indicator if marked as rest day
  - Today's date is highlighted with the green accent border

**Day cell states:**
| State | Visual |
|-------|--------|
| Empty (future or unlogged) | Default dark surface, no badge |
| Today | Green accent border around cell |
| Logged workout | Coloured pill badge with workout type name |
| Rest day | Faint grey "Rest" pill badge |
| Selected (clicked) | Slightly brighter surface, accent border |

**Clicking a day cell** opens the **Day Detail Panel** (see below). If the day already has a workout logged, it opens the logged workout. If it is empty, it opens a form to log one.

---

### Workout Type Colour Palette

Each workout type has a distinct colour used consistently throughout the app (badge, calendar cell, graph lines):

| Workout | Colour | Hex |
|---------|--------|-----|
| Push | Orange | `#f97316` |
| Pull | Blue | `#60a5fa` |
| Legs | Purple | `#a78bfa` |
| Upper | Yellow | `#fbbf24` |
| Lower | Teal | `#2dd4bf` |
| Abs | Pink | `#f472b6` |
| Rest | Grey | `#4b5563` |

---

### Day Detail Panel

When a user clicks a calendar day, a **modal/drawer** slides up (mobile) or appears as an inline panel (desktop) showing:

**For an unlogged day:**
```
  [Date: Wednesday, May 13]

  What did you do today?

  [ Push ] [ Pull ] [ Legs ] [ Upper ] [ Lower ] [ Abs ] [ Rest ]

  [Mark as Rest Day]
```

- Large tap-friendly workout type buttons using the colour palette above
- Selecting a workout type immediately logs it and closes the modal
- "Mark as Rest Day" uses a grey style

**For a logged day:**
```
  [Date: Wednesday, May 13]    [ Edit ] [ Clear ]

  🟠 Push Day

  Exercises:
  ┌─────────────────────────────────────────────┐
  │  Chest Press                                │
  │  Set 1: 60kg × 10   Set 2: 65kg × 8        │
  │  Set 3: 65kg × 7                            │
  ├─────────────────────────────────────────────┤
  │  Overhead Press                             │
  │  Set 1: 40kg × 10   Set 2: 42.5kg × 9      │
  └─────────────────────────────────────────────┘

  [ + Add / Edit Exercises ]
```

- Shows all exercises logged for that day
- Each exercise shows all sets in a compact chips row: `60kg × 10`
- "Add / Edit Exercises" opens the exercise logger (see Progress Tracker section)

---

### Workout Summary Sidebar

A persistent sidebar (right column on desktop, strip below calendar on mobile) showing:

**Weekly Streak**
- A row of 7 small circles representing the last 7 days
- Filled green = gym day, grey = rest, empty = no log

**Monthly Breakdown**
A vertical list of workout type counts for the current month:
```
  Push   ████████  8
  Pull   ██████    6
  Legs   ██████    6
  Upper  ███       3
  Lower  ██        2
  Abs    █         1
  Rest   ████      4
```
Each bar uses the workout type colour. Bar width is proportional to the max count.

**Total Sessions This Month**
A large number stat: "26 sessions" in bold green

---

## Module 2: Progress Tracker

### Layout

```
┌─────────────────────┬────────────────────────────────┐
│                     │                                │
│  Exercise Library   │    Exercise Detail / Graph     │
│  (left panel)       │    (right panel)               │
│                     │                                │
└─────────────────────┴────────────────────────────────┘
```

On mobile: stacked. Left panel is a scrollable list; tapping an exercise expands into the detail view.

---

### Exercise Library Panel (Left)

A searchable, scrollable list of all exercises the user has ever logged. 

**Header:**
```
  Exercises          [+ New Exercise]
  [🔍 Search exercises...]
```

**Exercise list items:**
Each item shows:
- Exercise name (e.g., "Chest Press")
- A small colour dot indicating the workout type it's associated with (e.g., orange dot for Push)
- Last logged date (e.g., "3 days ago")
- Last best set (e.g., "65kg × 8")

**Clicking an exercise** opens it in the right panel.

**"+ New Exercise" button** opens a small inline form:
```
  Exercise name: [_________________]
  Category:      [ Push ▾ ]
  [ Add Exercise ]
```

---

### Exercise Detail Panel (Right)

When an exercise is selected, this panel shows:

#### Header
```
  Chest Press          [Push]          [+ Log Session]
  Last session: May 10, 2026 — 65kg × 8 (best set)
```

#### Progress Graph

A **line chart (Chart.js)** showing progression over time:

- **X-axis:** Session dates (last 12 sessions by default, with a date-range selector: 1M / 3M / 6M / All)
- **Y-axis:** Weight (kg or lbs — user preference toggle in settings)
- **Line:** Best set weight per session (heaviest set that day)
- **Data points:** Hoverable tooltips showing full set breakdown: `May 10 — 3 sets: 60×10, 65×8, 65×7`
- **Second toggle:** Switch between "Max Weight" and "Total Volume" (weight × reps × sets) on the Y-axis

Graph styling:
- Dark background matching app surface
- Green accent line with subtle fill gradient underneath
- Grid lines: very faint (`rgba(255,255,255,0.05)`)
- Smooth curved line (`tension: 0.4`)

#### Session History Table

Below the graph, a scrollable table of all logged sessions for this exercise:

```
  Date          Sets   Best Set    Total Volume    Notes
  May 13, 2026   3     65kg × 8    1,530 kg        —
  May 10, 2026   3     65kg × 7    1,470 kg        —
  May 6, 2026    3     62.5kg × 8  1,425 kg        Slight shoulder pain
  May 1, 2026    3     60kg × 10   1,440 kg        —
```

- Each row is clickable — clicking it navigates to that day in the Calendar view
- "Notes" column is optional per session

---

### Log Session Flow

Triggered by "**+ Log Session**" or "**+ Add / Edit Exercises**" from the Calendar.

A modal with the following form:

```
  Log: Chest Press
  Date: [May 13, 2026 ▾]   (defaults to today)

  ┌─────────────────────────────────────────────┐
  │  Set 1   Weight: [____] kg   Reps: [____]   │
  │  Set 2   Weight: [____] kg   Reps: [____]   │
  │  Set 3   Weight: [____] kg   Reps: [____]   │
  │                                             │
  │  [+ Add Set]                [− Remove Set]  │
  └─────────────────────────────────────────────┘

  Notes (optional): [_________________________________]

  [ Cancel ]                          [ Save Session ]
```

**UX details:**
- Starts with 3 sets by default (most common)
- "+ Add Set" appends a new row; "− Remove Set" removes the last row
- Weight input: numeric, supports decimals (e.g., 62.5)
- Reps input: numeric, whole numbers only
- Pressing Enter in a field advances to the next field (keyboard friendly)
- On save: updates the exercise history, recalculates the graph, updates the calendar day marker
- If the selected date doesn't have a workout type logged, prompt the user: "What type of workout was this? [Push] [Pull] [Legs]…" before saving

---

### Multi-Exercise Workout Log

From the Calendar's **"+ Add / Edit Exercises"** button, users should be able to log multiple exercises for that day in one flow:

```
  Push Day — May 13, 2026

  ┌── Exercise 1 ──────────────────────────────────┐
  │  [Chest Press ▾]         [Remove]              │
  │  Set 1: [60] kg × [10] reps                    │
  │  Set 2: [65] kg × [8]  reps                    │
  │  Set 3: [65] kg × [7]  reps                    │
  │  [+ Add Set]                                   │
  └────────────────────────────────────────────────┘

  ┌── Exercise 2 ──────────────────────────────────┐
  │  [Overhead Press ▾]      [Remove]              │
  │  Set 1: [40] kg × [10] reps                    │
  │  [+ Add Set]                                   │
  └────────────────────────────────────────────────┘

  [+ Add Another Exercise]

  [ Save All ]
```

- Exercise dropdown pulls from the Exercise Library (or user can type a new name to create one on the fly)
- "Save All" commits all exercises to that date in one action
- Exercises are saved individually into the progress tracker — each one gets its own entry in the exercise history

---

## Data Model (In-Memory JavaScript State)

All data lives in a single `appState` JS object:

```js
const appState = {
  unit: 'kg',  // or 'lbs'
  workoutLogs: {
    // key: 'YYYY-MM-DD'
    '2026-05-13': {
      type: 'Push',   // Push | Pull | Legs | Upper | Lower | Abs | Rest
      exercises: [
        {
          name: 'Chest Press',
          sets: [
            { weight: 60, reps: 10 },
            { weight: 65, reps: 8 },
            { weight: 65, reps: 7 }
          ],
          notes: ''
        }
      ]
    }
  },
  exercises: [
    // Master list of all known exercise names + their category
    { name: 'Chest Press', category: 'Push' },
    { name: 'Overhead Press', category: 'Push' }
  ]
};
```

**Derived data (computed on the fly, never stored):**
- Best set per session = `max(set.weight)` across all sets for that exercise on that date
- Total volume per session = `sum(set.weight × set.reps)` for that exercise on that date
- Monthly breakdown counts = count of each workout type in `workoutLogs` within the displayed month

---

## Pre-Populated Sample Data

On first load, populate `appState` with **realistic sample data spanning the past 6 weeks** so the app does not launch empty:

- Mix of Push, Pull, Legs, Upper, Lower, Abs, and Rest days
- 4–6 exercises per workout day
- 3–4 sets per exercise
- Progressive weight increases over time (to make the graphs interesting)
- Common exercises: Bench Press, Overhead Press, Lat Pulldown, Barbell Row, Squat, Deadlift, Leg Press, Leg Curl, Tricep Pushdown, Bicep Curl, Cable Fly, Face Pull, Romanian Deadlift, Calf Raise, Plank, Ab Wheel

---

## Empty States

Design empty states for:
- **No exercise selected** (right panel): A dumbbell icon + "Select an exercise to see your progress"
- **Exercise with no sessions yet**: A chart icon + "No sessions logged yet. Hit '+ Log Session' to get started."
- **Calendar month with no logs**: A calendar icon + "No workouts logged this month yet."

---

## Settings / Preferences

A small settings dropdown accessible from the top-right (gear icon or user avatar area):

- **Unit toggle:** kg / lbs (affects all weight displays and graph Y-axis labels)
- **Theme toggle:** also accessible here as a secondary location

---

## Interactions & Micro-interactions

- **Logging a workout day:** The calendar cell animates with a quick "pop" scale transform (`scale(1) → scale(1.05) → scale(1)`) when a workout type is selected
- **Graph data points:** Smooth appear animation on chart load (`animation.duration: 600`)
- **Modal open/close:** Fade + subtle translate-up (`opacity 0→1, translateY 8px→0`) over 180ms
- **Tab switching:** Active tab underline slides between tabs with a CSS transition
- **Set rows in log form:** Fade in when "+ Add Set" is clicked
- **Hover on calendar cells:** Subtle background lighten, cursor pointer

---

## Accessibility

- All interactive elements have `aria-label` attributes
- Keyboard navigation: Tab through all controls, Enter/Space to activate
- Focus-visible rings on all focusable elements (2px green outline)
- Color is never the *only* differentiator — workout type names always appear alongside colour
- Modal traps focus when open; Escape key closes it
- Minimum touch target size: 44×44px on all buttons

---

## File & Delivery

- Single file: `gym-tracker.html`
- All CSS in a `<style>` block in `<head>`
- All JS in a `<script>` block before `</body>`
- Chart.js loaded via CDN: `https://cdn.jsdelivr.net/npm/chart.js`
- Lucide Icons loaded via CDN: `https://unpkg.com/lucide@latest`
- Fonts loaded via Fontshare CDN

