# El 7al mobile design system

This is the reference for how the mobile app looks and behaves. It follows the El 7al prototype
(`el7al-prototype.html`): Welcome, Login, Register, Forgot password, the client screens (Home,
the problem page, search, tracking, end of job, requests, messages, profile, notifications,
location), the artisan screens, and the Administration dashboard.

## Principles

1. One green surface per screen. The brand-green header or card says what is happening now and
   offers the one thing to do next.
2. Lime is a fill, not a text colour. It marks live status (online, en route, minutes) and the
   knob of a slide bar, and only on a brand or dark surface. For green text or icons use
   `accentText` (brand green in light mode, mint in dark mode).
3. Flat, bordered surfaces. Panels are separated by a 1px border, not by shadows.
   Comparable things go in one card divided by hairlines.
4. Minimal text. Prices appear only at the last step, when the artisan declares the amount and
   the client confirms the cash payment. Payment is cash only.
5. Deliberate actions are slid, not tapped: launching a request, and each step of a mission, use
   `SlideToAct`.
6. Nothing invented. A figure the backend does not provide is shown as a dash. A control that
   does nothing is not shown (the problem page has no photo row and no arrival choice for that reason).
7. Feedback stays next to its cause. Field errors appear under the field. Other results use a
   toast (`flashToast`). There are no system alerts.
8. Anything that cannot be undone asks first, in a `Dialog`.

## Tokens

| File | Contents |
|---|---|
| `src/shared/theme/colors.ts` | Colour roles for dark and light, plus legacy names |
| `src/shared/theme/tokens.ts` | Spacing, radii, control sizes, type sizes, tab bar height, `inputReset` |
| `src/shared/theme/typography.ts` | Font files and the type scale (Latin and Arabic) |
| `src/shared/theme/useType.ts` | Hook that returns the type scale for the current language |

### Palette

One green. The brand green `#0D5C3A` is the header, the identity card, the slide bar track and
the primary button, in both themes. The page colour is a cool off-white that sits with it.

| Role | Light | Dark |
|---|---|---|
| `background` (page) | `#F2F4EE` | `#06281B` |
| `surface` (cards) | `#FFFFFF` | `#131D18` |
| `tint`, `raised` (tiles) | `#E8EEE1` | `#1C2A23` |
| `border`, `divider` | `#DAE1D3` | `#2B3B33` |
| `text` | `#0E2A1F` | `#EEF3EC` |
| `textMuted` | `#5E7066` | `#A3B0A2` |
| `brand`, `hero` | `#0D5C3A` | `#0D5C3A` |
| `onBrand`, `onBrandMuted` | `#FFFFFF`, `#D5E7DB` | same |
| `accentText` | `#0D5C3A` | `#86D9A6` |
| `action`, `onAction` | `#2BB673`, `#04170F` | same |
| `live`, `onLive` | `#A3E635`, `#12260A` | same |
| `pill`, `onPill` | `#0E2A1F`, `#FFFFFF` | `#EEF3EC`, `#10140F` |
| `danger`, `dangerText` | `#DC2626`, `#B4232A` | `#EF4444`, `#F28B8B` |

Dark mode is kept. Light is the default. Do not add a new green: reuse `brand`/`hero`. Hard-coded
colours are only allowed inside illustrations (`shared/ui/art`), where the artwork has its own palette.

Colour roles:
- Surfaces: `background`, `adminBackground`, `surface`, `raised`, `soft`, `softer`, `tint`, `chip`, `selected`.
- Lines: `divider` (between rows), `border`, `borderStrong`, `overlay`, `shadow`.
- Text: `text`, `textStrong`, `textSecondary`, `textMuted`.
- Brand surface: `brand`, `hero`, `brandInset`, `onBrand`, `onBrandMuted`, `onBrandFaint`, `onBrandLine`.
- Brand as text and logo: `accentText`, `positive`, `logo`.
- Actions and live: `action`, `onAction`, `live`, `onLive`, `pill`, `onPill`.
- Status: `star`, `danger`, `dangerText`, `dangerSoft`, `dangerFill`.

Legacy names at the bottom of each palette map onto these roles until every screen has moved over.

Spacing: 4, 8, 12, 16, 20, 24, 32. Page margin: 20.
Radii: 8 (small insets), 14 (text fields), 20 (cards and rows), 24 (hero cards), 28 (top corners of sheets), full (buttons, chips, slide bars).
Type sizes: 12, 14, 16 for text and 22, 30, 32, 34 for headings (Plus Jakarta Sans in French and English).
Touch targets: 44 minimum. Text fields: 52 high. Buttons: 54 to 58 high. Slide bar: 66 high.

## UX laws (the project's rules, shared by the owner)

Phase 1 of the owner's list (Laws of UX). More will be added here as they are shared. Each one is
a rule for every new screen and a check for every existing one.

| Law | What it says | Rule in El 7al |
|---|---|---|
| 1. Jakob's Law | Users expect your app to work like the apps they already know | Use familiar patterns: a bottom tab bar, back at the top start, a bell for notifications, chat bubbles, a bottom sheet for a short task. Do not invent a new control when a known one exists. The slide bar is the only unusual control, and it always shows an arrow and a label. |
| 2. Fitts's Law | The target must be easy to reach: close and large | The primary action is a full-width button or slide bar, 54 px or more, at the bottom (the thumb zone), never a small link at the top. Touch targets are at least 44 px. Secondary actions are smaller but still 44 px high. |
| 3. Hick's Law | Too many or too complicated choices lower the chance of a choice | One main action per screen. Show a few large choices (the six trades as a 2-column grid) rather than a long list. Hide the rest behind one step. No screen shows more than one primary action. |
| 4. Miller's Law | People hold about 7 (plus or minus 2) things in memory | Keep a screen to 5 to 9 elements. Split long forms into short steps (register, forgot password) and group fields under a short label. Lists are chunked (by month, by section). |
| 5. Law of Proximity | Things that are close read as one group | Related things sit close (8 to 12 px); separate groups sit further apart (20 to 24 px). Use space, not boxes, to group. A label sits with its field, a value with its label, and a section title with its own list. Follow the spacing rules below. |

Phase 2 (interface details):

| Rule | What it says | Rule in El 7al |
|---|---|---|
| Lead with the keyword | People scan the left edge and read the first 2 to 3 words | Labels, titles and rows start with the key word: "Code envoyé à…", "Renvoyer le code", "Montant : un problème ?", "Recherche du plus proche…". Not "Comment faire pour…". |
| Proportional radii | Outer radius = inner radius + padding | A card of 24 holds a tile of 10 with 14 of padding; a card of 24 with 16 of padding holds a tile of 8. Fully round shapes (pills, circles) are exempt. |
| Equal segment widths | Uneven segments break rhythm and suggest importance | Every segmented control uses equal-width segments: request filters, language, Client/Artisan. |
| Switches are for toggles | A switch is for binary on/off | Switches: online, notifications, dark mode. Opposing choices (language, role, grid or list) use a segmented control. |
| Fewer asterisks | If most fields are required, mark the rare optional ones | No asterisks. Optional fields say "(facultatif)". |

Phase 3 (behaviour):

| Rule | What it says | Rule in El 7al |
|---|---|---|
| Peak-end | People remember the best moment and the ending | Peak: the arrival time appears at once, large, when an artisan accepts; a first-visit hint guides the first request. End: a proper "Merci" screen after payment with confetti, a short summary and one way home. |
| Miller (again) | About 7 things at a time; about 6 per row | Up to 6 trades per grid; chunk everything else. |
| Hick (again) | More choices, slower decisions | Guide the choice (a "Populaire" badge on the most requested trade); keep tabs minimal (four). |
| Fitts (again) | The bigger and closer, the easier to tap | The primary action sits at the bottom, full width, and stays visible even before a choice ("Choisissez un service"). |
| Similarity | Similar looking things read as related | One colour for every primary action (brand green, or lime on a green surface); outline for secondary; red for danger. Never another green. |

Applied in the app (ported from `el7al-prototype-v2.html`):
- Equal segments: request filters, the language (FR, EN, عربي) in Profile, and Client / Artisan on Register use `SegmentedControl`. The role slide was removed.
- Radii: `layout.tileRadius` (10) for tiles in cards of 24 with 14 padding; the running-request card is 24 with an 8 tile.
- Targets: round buttons are 44.
- Hick: the "★ Populaire" badge sits on the most available trade, only when one is clearly ahead (`useCategoryStats`). It is the one place lime sits on a light card, with dark text.
- Fitts: the bottom bar is always there for a client: a grey "Choisissez un service" before a choice, the slide bar after it.
- Peak-end: the pill shows the arrival minutes in lime; a first-visit `CoachTip` (shown once); `ThanksPage` (the green "Merci" page with confetti) after the rating.
- Keyword first: search, forgot-password and resend strings were reworded in all three languages.

The prototype `el7al-prototype-v2.html` shows all of these applied. It has a "Règles UX appliquées" screen that lists them.

How the current app meets them, and where to look when reviewing a screen:
- Fitts: slide bar and "Lancer l'intervention" at the bottom; tabs 64 px high. Check small icon-only buttons (42 px) and raise them to 44.
- Hick: the home shows six trades and one slide bar; the problem page has one box and one button.
- Miller: the home screen has about 6 elements; the artisan home, profile and request list are the busiest and should be checked first.
- Proximity: tiles use `layout.tilePad`, rows use 12, blocks 16 to 20, sections 24.

## Spacing rules

Every screen follows these. The numbers live in `layout` (`src/shared/theme/tokens.ts`); do not type them again.

1. **Headers never touch the top edge.** Use `useTopPad()` (`src/shared/theme/useTopPad.ts`) for the padding above the first row of a header or full page. It is the status-bar inset, at least 16 on the web, plus 12. Never write `insets.top + n`.
2. **Side margin is 20 (`layout.gutter`)** on every page, header and card row.
3. **Green headers:** `useTopPad()` above, `layout.headerBottom` (24) below the last row, 16 to 20 between rows.
4. **Stat tiles and small cards:** `layout.tilePad` (16) padding, a minimum height (84 for the artisan tiles), 4 between the figure and its label. A label must never sit on the edge of its tile.
5. **Gaps:** 8 inside a group, 12 between related rows, 16 to 20 between blocks, 24 between sections.
6. **Bottom:** the last item clears the tab bar and the device inset: `tabBarHeight + max(insets.bottom, 10) + 24`. Pages with a fixed footer button add `max(insets.bottom, 16) + 10` under it.
7. **Check every new screen** at 360 px wide, on the web (no inset) and on a phone with a notch, in light and dark, before it is called done.

## Typography

- Plus Jakarta Sans (400 to 800): every role in French and English. Titles, numerals and the wordmark use ExtraBold with a tight negative letter spacing.
- IBM Plex Sans Arabic: every role when the language is Arabic, because Plus Jakarta Sans has no Arabic letters.
- Plus Jakarta Sans is wider than a condensed face: capitalised labels in tight rows (like the mission rail) must be tested at their real width, because `adjustsFontSizeToFit` does nothing on the web.

Use `<Txt variant="...">` instead of `<Text>`. Do not set `fontWeight` next to these families:
each weight is its own font file. Write labels in sentence case ("Se connecter", not "SE CONNECTER").

## Components (`src/shared/ui`)

| Component | Use |
|---|---|
| `Txt` | All text. Picks font by language and colour by theme |
| `Button` | Pill-shaped. `primary` (brand green) for the main action, `accent`, `secondary`, `outline`, `destructive` |
| `SlideToAct` | The slide bar: brand-green track, lime knob, the label fades as the knob moves. 70% to complete, a tap nudges it. Used to launch a request and for every mission step |
| `IconButton` | 44pt icon-only button. Requires `accessibilityLabel` |
| `Input` | The one text field: label above, error or hint below, show/hide for passwords |
| `SegmentedControl`, `Toggle` | Short choices; the on/off switch |
| `Avatar` | Photo or initials. `tint` overrides the colours (green and lime on brand surfaces) |
| `TabIcon` | The four bottom-bar icons, drawn from the prototype paths |
| `art/ToolIcon`, `art/toolArt` | The six trade tools (pipe wrench, screwdriver, spanner, gauge, key, roller) in `light`, `dark` and `grey` palettes; `toolForCategory` picks one from a category name |
| `art/DoorArt`, `ToolsLineup`, `WelcomeSlides` | The access-screen animations (door, tool line-up, the four welcome slides) |
| `SlideScreen` | Web-only slide-in/out for the access pages |
| `SlideInPage` | A full page that slides in over the previous one (350 ms) and out (300 ms). The Problem page uses it |
| `FadeUp` | A list item that fades in while rising 6 px, 250 ms, 40 ms after the one before |
| `Confetti` | A 1.8 s burst, once, when a job is paid. Does nothing with reduced motion |
| `LiveDot`, `MissionStatusRail` | Live indicator; the six mission steps (search, accepted, en route, on site, work, done) |
| `Surface`, `Hairline` | The standard bordered card and its row divider |
| `ScreenHeader` | Header of list screens: optional back, title, bell |
| `BottomSheet`, `Dialog` | Sheet for lists and forms; dialog for a decision or short task |
| `EmptyState`, `StatusBadge`, `Skeleton` | Nothing yet; status tag with icon and colour; loading placeholder |
| `Mirrored` | Wraps an icon that points in a direction so it flips in Arabic |
| `useReducedMotion` | True when the system asks for less motion. Every decorative animation checks it |

## Screens

**Access** (Welcome, Login, Register, Forgot password): `features/auth/components` (`AuthLayout`, `AuthHeader`, `RoleSlide`, `CodeBoxes`). Welcome is a swipeable four-slide carousel with auto-advance. Register has a collapsing header and a role slide (Client or Artisan). Forgot password has three steps with six code boxes and a 60 s resend countdown.

**Client**
- Home: avatar with "Bonjour" and the first name, the address chip, the bell with a red dot; "Quel service ?" with the online count; a two-column grid of 118 px tiles with the tool art. A chosen tile gets a 2 px brand frame, a check, and its tool tilts 10 degrees. The slide bar rises at the bottom. While a request is running, a green pill above the tab bar shows who is coming and opens tracking.
- Location: "Où êtes-vous ?" before the device asks for the position.
- Problem: a full page (`RequestSheet`) with the trade chip, a 300-character box, an address card, and "Lancer l'intervention".
- Search: a full green page with a rotating radar, blinking artisan dots and a cancel button. It slides in over Home and hides the tab bar.
- Tracking: green header with the status chip, the big line (it fades on each change), the minutes, the six steps; the map; a sheet with the artisan, the problem, the address, and the slide bar (`MissionLive`).
- End of job: "C'est réparé !", the amount the artisan declared (it counts up), "J'ai payé X TND en espèces", then the rating with confetti.
- Requests (tab "Demandes"): filters (Toutes, En cours, Terminées), the running request in a green frame, finished ones by month.
- Messages and chat: rows with a 52 px avatar; bubbles with a 6 px corner on the speaker's side; a pill input and a round send button.
- Profile: a green identity card, then cards of icon rows (`SettingRow`), then "Déconnexion" and "Supprimer le compte" as links.
- Notifications: a full page, one card per notification, "Tout lire".

**Artisan**
- Home: the trade, stats and the online switch; the incoming-request sheet with a countdown; the live mission screen (same `MissionLive`); the "Missions" tab. When commissions are owed, a card shows the amount and a "Payer El 7al" button.
- Documents (register step 3): three upload tiles (dashed, then solid green with the photo), a one-line note on privacy, then the "Dossier envoyé" page (`/docs-sent`).
- Profile: the green identity card holds the rating and the balance; the online switch lives on Home only (one place).
- Pay (`/pay`): the transfer amount (starts at what is owed), El 7al's bank account (shown only when `EXPO_PUBLIC_EL7AL_RIB` is set), the receipt photo, "Envoyer la preuve" (`POST /wallet/topup`). Once sent, the page shows where the receipt stands: paused while El 7al checks it, or refused with "Renvoyer une preuve".
- Warm notices (check pending, account paused) use the `warnSoft` / `warnText` pair; refusals use `dangerSoft`.

**Admin**: the "Admin" badge beside logout; the first tab is a green revenue card, the figures by period, then "À traiter" (payments, verifications, disputes, each opening its tab); verification cards show the artisan, the documents side by side and Refuser / Valider; payment cards show who, the receipt photo and the amount.

## Payment

The request carries no price. At the end of the job the artisan declares the amount
(`declaredAmount`, stored on the mission). The client sees it and confirms "J'ai payé X TND en
espèces". Cash only.

## Tab bar

Four tabs, always: Accueil, Demandes (Missions for the artisan), Messages, Profil. Plain icons
from `TabIcon` with a label; the current tab is in `accentText` with a thicker stroke and no
pill. Switching tab is a 250 ms crossfade. An unread count is a green badge. The bar is hidden
while the search page is open.

## Motion

- Forward and back on the access pages: a 350 ms slide with the prototype curve (`cubic-bezier(.2,.8,.2,1)`).
- The Problem page and the Search page slide in 350 ms; the Problem page slides out in 300 ms.
- Lists fade up, staggered (`FadeUp`).
- The end page amount counts up over 0.7 s; confetti when the rating opens.
- Everything decorative stops when `useReducedMotion` is true.

## Where things live

- Language and theme: Profile, under the settings card. Before login they are on Welcome only.
- Notifications: the bell on Home and in `ScreenHeader`.
- Text: every user-facing string is a key in `src/shared/i18n/locales/{fr,en,ar}.ts`. Inside
  components use `useTranslation()`. In stores and socket handlers use `translate()`. Add every
  key to all three files. Loading titles, toasts and errors are keys too (no hard-coded French).

## Arabic and right-to-left

- Choosing Arabic mirrors the layout. On the web this is immediate. On iOS and Android the system
  mirrors the layout only when the app starts, so the app shows a toast asking for a restart.
- Write layout with logical sides: `marginStart`/`marginEnd`, `paddingStart`/`paddingEnd`,
  `start`/`end`. Do not use `left`/`right`, except inside illustrations, which are symmetric
  artwork and do not mirror.
- To push something to the trailing edge, use flex (`alignItems: 'flex-end'` or a `flex: 1`
  spacer). Do not use `textAlign: 'right'`.
- Wrap directional icons (back, chevrons, arrows, send) in `<Mirrored>`.
- Add `inputReset` to the style of every `TextInput`.
- `SlideToAct` and `SlideInPage` read the direction and move from the right side in Arabic.

## Known trade-offs

- Text-field borders use the stronger `inputBorder` so their edges stay visible (WCAG 1.4.11); card and divider lines use the lighter values.
- The problem page has no arrival choice (always "Dès que possible") and no photo row: the backend has neither.
- The previous page does not shift and dim behind a forward slide on the native side, because the new page sits in a modal layer.

## Still open

- The Arabic strings added during the redesign need a review by a native speaker.
- Right-to-left was checked in the web build only. Check it on an iPhone and an Android phone before release.
- The turning 7, the radar and the confetti need a look on a real phone (frame rate, battery).
- The chat has no "typing…" indicator: the backend sends no typing event.
- "Acceptance rate" has no backend source and shows a dash.
- Arrival time and distance come from the backend, which currently sends fixed values (8 min, 3.2 km).
- The backend does not save the transport type, CIN number, CIN photos or driving licence sent at artisan sign-up.
