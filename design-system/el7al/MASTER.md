# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> The full mobile reference (components, screens, motion, RTL) is `apps/mobile/DESIGN_SYSTEM.md`.
> The source of truth for the look is the prototype `el7al-prototype.html`.

---

**Project:** El7al
**Category:** On-demand home repair (plumber, electrician, mechanic, air conditioning, locksmith, painter) in Tunisia
**Roles:** client, artisan, admin. French first, Arabic (right-to-left) next, dark mode kept.
**Design Dials:** Variance 3/10 (centred, minimal) | Motion 4/10 (standard) | Density 4/10 (standard)

**Product rules:** minimal text; the request carries no price, the artisan declares the amount only at the end and the client confirms the cash payment; cash only; deliberate actions use a slide bar.

---

## Global Rules

### Color Palette

One green. The brand green is the header, the identity card, the slide-bar track and the primary button, in both themes. Lime marks live status and the slide-bar knob, only on a brand or dark surface.

| Role | Light | Dark | Token |
|------|-------|------|-------|
| Page | `#F2F4EE` | `#06281B` | `background` |
| Card | `#FFFFFF` | `#131D18` | `surface` |
| Tile | `#E8EEE1` | `#1C2A23` | `tint`, `raised` |
| Line | `#DAE1D3` | `#2B3B33` | `border`, `divider` |
| Text | `#0E2A1F` | `#EEF3EC` | `text` |
| Muted text | `#5E7066` | `#A3B0A2` | `textMuted` |
| Brand green | `#0D5C3A` | `#0D5C3A` | `brand`, `hero` |
| On brand | `#FFFFFF` / `#D5E7DB` | same | `onBrand`, `onBrandMuted` |
| Green as text | `#0D5C3A` | `#86D9A6` | `accentText` |
| Action | `#2BB673` on `#04170F` | same | `action`, `onAction` |
| Live (lime) | `#A3E635` on `#12260A` | same | `live`, `onLive` |
| Inverted button | `#0E2A1F` / `#FFFFFF` | `#EEF3EC` / `#10140F` | `pill`, `onPill` |
| Danger | `#DC2626` (text `#B4232A`) | `#EF4444` (text `#F28B8B`) | `danger`, `dangerText` |
| Star | `#D97706` | `#F2B544` | `star` |

**Color Notes:** deep forest green with a lime accent, on a cool off-white page. Earlier versions used a warm cream page and a darker second green (`#06281B` on light pages); that mismatch was removed. Do not add another green.

### Typography

- **Heading and body:** Plus Jakarta Sans (400 to 800). Titles, numerals and the wordmark use ExtraBold with a tight negative letter spacing.
- **Arabic:** IBM Plex Sans Arabic for every role.
- **Sizes:** 12, 14, 16 for text; 22, 30, 32, 34 for headings. Sentence case for labels.
- **Google Fonts:** [Plus Jakarta Sans](https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800)

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
```

### Spacing and shape

| Token | Value | Usage |
|-------|-------|-------|
| space | 4, 8, 12, 16, 20, 24, 32 | Gaps and padding. Page margin 20 |
| radius small | 8 | Tags, small insets |
| radius field | 14 to 16 | Text fields |
| radius card | 20 | Cards and rows |
| radius hero | 24 | Hero and identity cards |
| radius sheet | 28 | Top corners of sheets |
| radius full | 999 | Buttons, chips, slide bars |

Touch targets 44 minimum. Text fields 52 to 54. Buttons 54 to 58. Slide bar 66.

### Spacing rules (apply to every screen)

- Headers never touch the top edge: top padding is the status-bar inset (at least 16 on the web) plus 12.
- Side margin 20. Green header: 24 below the last row, 16 to 20 between rows.
- Stat tiles and small cards: 16 padding, a minimum height, 4 between figure and label; a label never sits on the edge.
- Gaps: 8 in a group, 12 between related rows, 16 to 20 between blocks, 24 between sections.
- The last item clears the tab bar and the device inset; a fixed footer button adds the inset plus 10.
- In code these are the `layout` constants and the `useTopPad()` hook (see `apps/mobile/DESIGN_SYSTEM.md`).

### Elevation

Flat by default: surfaces are separated by a 1px border. Shadows only for floating elements (sheets, the mission pill): a soft green-tinted shadow.

---

## Component Specs

### Buttons

- **Primary:** brand green fill, white text, full width, pill. Pressed: scale 0.97.
- **Lime:** only on a brand surface (the welcome page): lime fill, dark green text.
- **Outline:** transparent, 1px `border`, brand-green text.
- **Danger:** outline in `danger`.
- **Slide bar:** 66 high, brand-green track, 54 lime knob with a dark arrow, label in `onBrandMuted` that fades as the knob moves.

### Cards and rows

White `surface`, 1px `border`, radius 20. A list row: a 36 to 46 tile (`tint`, radius 10 to 14) with the icon, the title in 15 to 16 semibold, the detail in 13 muted, and the value or switch at the end. Rows in a card are divided by a hairline that starts after the icon tile.

### Service tile

118 high, radius 20, 1px `border`. The name in 16 bold at the bottom, "N en ligne" with a green dot under it, the tool illustration at the top end (grey when idle). Selected: 2px brand border, a check at the top start, the tool in colour and tilted 10 degrees.

### Inputs

Height 52 to 54, radius 16, 1px border; focused: 1px brand border. The problem box is 140 high with a 1.5px brand border and a character counter.

### Sheets and dialogs

White `background`, radius 28 on the top corners, a 40 by 4 grab handle. Dialogs rise from the bottom over a dimmed page.

### Tab bar

Four tabs, always: Accueil, Demandes (Missions for artisans), Messages, Profil. Plain icons, 11px labels, the current tab in `accentText`. Hairline above. Switching is a 250 ms crossfade.

---

## Motion

- Easing: `cubic-bezier(.2, .8, .2, 1)` for page moves; durations 250 (tab), 300 (leave), 350 (enter), 400 (sheet).
- Pages slide in from the trailing edge; lists fade up 6 px, 250 ms, staggered 40 ms.
- Selection: the tool tilts with a small overshoot; the check pops.
- The amount on the end page counts up over 0.7 s; confetti for 1.8 s when a job is paid.
- Every decorative animation respects reduced motion (render the final state at once).

---

## Anti-Patterns (Do NOT Use)

- No price before the last step of a request.
- No second green and no lime text on a light page.
- No hard-coded French (or any language) in components: every string is a key in `fr`, `en` and `ar`.
- No `left`/`right` or `textAlign: 'right'` in layout (use `start`/`end`); wrap directional icons in `Mirrored`.
- No emojis as icons: use Lucide or the prototype's own paths.
- No instant state changes: always a 150 to 350 ms transition.
- No low-contrast text: 4.5:1 minimum.
- No invisible focus states.

---

## Pre-Delivery Checklist

- [ ] Colours come from `useThemeStore` roles, not literals (illustrations excepted)
- [ ] Light and dark both checked
- [ ] French, English and Arabic keys all present
- [ ] Right-to-left checked: icons mirrored, no `left`/`right`
- [ ] Reduced motion respected
- [ ] Touch targets 44 or more
- [ ] No horizontal scroll at 360 px
- [ ] Prices only at the last step; cash only
