# RightNow Conference Digital Program — Technical Plan

## Overview

A lightweight, mobile-first Progressive Web App (PWA) for ~3,200 attendees on shared/limited church wifi. The app serves as the conference program and schedule, with venue maps, speaker bios, and local recommendations.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Static HTML + Vanilla JS** | Zero build step, tiny payload, no framework overhead |
| Styling | **Single CSS file (mobile-first)** | Minimal requests, responsive by default |
| Data | **JSON files** (schedule.json, speakers.json, venues.json) | Cacheable, no server/database needed |
| Hosting | **GitHub Pages** (or any static host) | Free, CDN-backed, HTTPS out of the box |
| Offline/Caching | **Service Worker + Cache API** | Cache all assets on first load; works offline |
| Images | **WebP with lazy loading** | Small file sizes, native browser lazy-load |

### Why not React/Next.js/etc.?
With 3,200 people on the same wifi, every kilobyte matters. A vanilla approach keeps the total payload under ~200KB (before images), requires zero JS framework downloads, and is trivially cacheable.

---

## Pages & Navigation

All pages are separate HTML files linked with simple `<a>` tags (no client-side router). The service worker pre-caches them all on first visit.

### 1. Schedule Overview (`index.html`)
- **Day tabs** — 3 buttons to switch between Day 1, Day 2, Day 3
- **Event cards** for each session, showing:
  - Time (start–end)
  - Title
  - Location (room name — tappable, links to map)
  - Speaker name + circular headshot thumbnail (small, cached)
  - Badge: "Main Session" or "Breakout"
- Tapping a card → Event Detail page
- Days are rendered from `data/schedule.json`; switching days is instant (no network request after first load)

### 2. Event Detail (`event.html?id=...`)
- Session title, full time, location (linked to map)
- Topic description (1–3 paragraphs)
- Speaker section:
  - Larger headshot
  - Name, title/church
  - Bio paragraph
- "Other sessions by this speaker" links (auto-generated from shared speaker data)
- Speaker data comes from `data/speakers.json` (shared across sessions)

### 3. Venue Map (`map.html`)
- Full church floor-plan image (SVG preferred for crispness + small size)
- Rooms defined as clickable/tappable overlay regions
- When linked from a session (`map.html?room=roomA`), that room pulses/highlights
- Legend with room names
- Pinch-to-zoom support via CSS `touch-action` + lightweight JS

### 4. Local Guide (`explore.html`)
- Tabs or sections: Restaurants, Coffee Shops, Activities
- Each listing shows:
  - Name, photo thumbnail, cuisine/type
  - Address (linked to Google/Apple Maps)
  - Hours
  - Special deal badge (if applicable, e.g. "10% off with conference badge")
- Data from `data/local-guide.json`

### 5. Navigation
- Sticky bottom nav bar (mobile pattern) with 3 icons:
  - 📅 Schedule (index.html)
  - 🗺️ Map (map.html)
  - 🍽️ Explore (explore.html)

---

## Data Model (JSON files in `/data`)

### `schedule.json`
```json
{
  "days": [
    {
      "date": "2026-03-25",
      "label": "Day 1 — Wednesday",
      "events": [
        {
          "id": "evt-001",
          "title": "Opening Session",
          "type": "main",
          "startTime": "09:00",
          "endTime": "10:30",
          "room": "sanctuary",
          "description": "Full description of the session topic...",
          "speakerIds": ["spk-001"]
        }
      ]
    }
  ]
}
```

### `speakers.json`
```json
{
  "speakers": [
    {
      "id": "spk-001",
      "name": "John Smith",
      "title": "Lead Pastor",
      "church": "Grace Community Church",
      "bio": "John has been in ministry for 20 years...",
      "headshotUrl": "images/speakers/john-smith.webp"
    }
  ]
}
```

### `venues.json`
```json
{
  "rooms": [
    {
      "id": "sanctuary",
      "label": "Main Sanctuary",
      "capacity": 3200,
      "mapHighlight": "sanctuary"
    }
  ]
}
```

### `local-guide.json`
```json
{
  "categories": [
    {
      "name": "Restaurants",
      "listings": [
        {
          "name": "Pecan Lodge BBQ",
          "type": "BBQ",
          "address": "123 Main St, Dallas, TX",
          "mapsUrl": "https://maps.google.com/...",
          "hours": "11am–9pm",
          "photoUrl": "images/local/pecan-lodge.webp",
          "deal": "15% off with conference badge"
        }
      ]
    }
  ]
}
```

---

## Caching & Performance Strategy

This is the most critical part given 3,200 users on shared wifi.

### Service Worker (`sw.js`)
1. **Install event**: Pre-cache the "app shell" — all HTML, CSS, JS, JSON data files, and the map SVG
2. **Activate event**: Clean up old caches when data is updated
3. **Fetch strategy**:
   - **HTML/CSS/JS/JSON**: Cache-first, fall back to network (instant loads after first visit)
   - **Images**: Cache-first with network fallback; lazy-loaded so they trickle in gradually rather than all at once
4. **Cache versioning**: A simple version string in `sw.js` (e.g., `CACHE_V1`) — bump it to push updates

### Image Optimization
- All speaker headshots: **100×100px WebP**, target ~5–8KB each
- Local guide photos: **300px wide WebP**, target ~15–20KB each
- Map: **SVG** (vector, resolution-independent, typically 20–50KB)
- `<img loading="lazy">` on all images below the fold

### Estimated Total Payload
| Asset | Size |
|-------|------|
| HTML (5 pages) | ~15KB |
| CSS | ~8KB |
| JS (main + SW) | ~10KB |
| JSON data files | ~30KB |
| Map SVG | ~30KB |
| Speaker headshots (~30 speakers) | ~200KB |
| Local guide images (~15) | ~250KB |
| **Total** | **~550KB** |

After the first load, all subsequent page views are served from cache with **zero network requests**.

### Additional Performance Measures
- No external fonts (use system font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)
- No external CDN dependencies
- Inline critical CSS if needed
- `<meta name="viewport">` for proper mobile rendering
- Minify JSON data files

---

## File Structure

```
RNC-Program/
├── index.html              # Schedule Overview (home)
├── event.html              # Event Detail
├── map.html                # Venue Map
├── explore.html            # Local Guide
├── css/
│   └── styles.css          # All styles (mobile-first)
├── js/
│   ├── app.js              # Shared utilities (data loading, nav, etc.)
│   ├── schedule.js         # Schedule page logic
│   ├── event-detail.js     # Event detail page logic
│   ├── map.js              # Map interaction logic
│   └── explore.js          # Local guide page logic
├── sw.js                   # Service Worker (root for scope)
├── manifest.json           # PWA manifest (add-to-homescreen)
├── data/
│   ├── schedule.json       # Conference schedule
│   ├── speakers.json       # Speaker bios
│   ├── venues.json         # Room definitions
│   └── local-guide.json    # Restaurants, coffee, activities
├── images/
│   ├── speakers/           # Headshot WebP files
│   ├── local/              # Local guide photos
│   ├── map/                # Church floor plan SVG
│   └── icons/              # PWA icons, nav icons
└── PLAN.md                 # This file
```

---

## PWA / Add-to-Homescreen

A `manifest.json` enables the "Add to Home Screen" prompt on mobile:
- App name: "RNC 2026 Program"
- Theme color: RightNow Media brand color
- Display: `standalone` (full-screen, no browser chrome)
- Icons at 192px and 512px

This makes it feel like a native app with no app store required.

---

## Content Management Workflow

To update the schedule, speakers, or local guide:
1. Edit the relevant JSON file in `/data`
2. Bump the cache version in `sw.js`
3. Push to GitHub — GitHub Pages deploys automatically
4. Attendees' service workers detect the new version on next visit and refresh the cache

---

## Design Direction

- **Clean, card-based layout** — easy to scan on a phone
- **RightNow Media brand colors** as accents (we can match exact hex values)
- **High contrast** for readability in varied church lighting
- **Large tap targets** (minimum 44×44px per Apple HIG)
- **Bottom navigation bar** — thumb-friendly on mobile

---

## What's NOT Included (by design)

- No user accounts or login
- No personal schedule builder (keeps it simple; could add later)
- No real-time updates / WebSocket (static data is sufficient)
- No analytics tracking (respects privacy, reduces requests)
- No server-side code (fully static)

---

## Next Steps

Once this plan is approved:
1. Scaffold the file structure and build the HTML pages
2. Create the CSS (mobile-first responsive design)
3. Implement the JS modules (data loading, page rendering, map interaction)
4. Set up the service worker and PWA manifest
5. Add placeholder/sample data to the JSON files
6. Test offline behavior and caching
7. Commit and push to the feature branch
