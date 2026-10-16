# El 7al mobile design system

This is the reference for how the mobile app looks and behaves. Every screen follows it:
Welcome, Login, Register, Home (client and artisan), Tracking, Chat, Profile, the artisan
page, the dialogs and the Administration dashboard.

## Principles

1. One green surface per screen. The brand-green hero says what is happening now and
   offers the one thing to do next.
2. Lime is a fill, not a text colour. It marks the single primary action and live status.
   For green text or icons use `accentText` (brand green in light mode, mint in dark mode). In a list where every row has the same
   action (approve a transfer), use the `primary` button, not lime.
3. Flat, bordered surfaces. Panels are separated by a 1px border, not by shadows.
   Comparable things go in one panel divided by hairlines, not in separate cards.
4. Nothing invented. A figure the backend does not provide is shown as a dash.
   A control that does nothing is not shown.
5. Feedback stays next to its cause. Field errors appear under the field. Other
   results use a toast (`flashToast`). There are no system alerts.
6. Anything that cannot be undone asks first, in a `Dialog`: log out, cancel a
   mission, clear notifications, delete a user or a category.

## Tokens

| File | Contents |
|---|---|
| `src/shared/theme/colors.ts` | Colour roles for dark and light, plus legacy names |
| `src/shared/theme/tokens.ts` | Spacing, radii, control sizes, type sizes, tab bar height, `inputReset` |
| `src/shared/theme/typography.ts` | Font files and the type scale (Latin and Arabic) |
| `src/shared/theme/useType.ts` | Hook that returns the type scale for the current language |

Colour roles:
- Surfaces: `background`, `adminBackground`, `surface`, `raised`, `soft`, `softer`, `tint`, `chip`, `selected`.
- Lines: `divider` (between rows), `border`, `borderStrong`, `overlay`, `shadow`.
- Text: `text`, `textStrong`, `textSecondary`, `textMuted`.
- Brand surface: `brand`, `brandInset`, `onBrand`, `onBrandMuted`, `onBrandFaint`, `onBrandLine`.
- Brand as text and logo: `accentText`, `positive`, `logo`.
- Actions: `action`, `onAction` (lime fill), `pill`, `onPill` (inverted button).
- Status: `star`, `danger`, `dangerText`, `dangerSoft`.

The values come from the El 7al mobile redesign (light and dark are one token set). Legacy names
at the bottom of each palette map onto these roles until every screen has moved over.

Spacing: 4, 8, 12, 16, 20, 24, 32. Page margin: 20.
Radii: 8 (small insets), 14 (text fields), 24 (cards, list panels, hero panels), 28 (top corners of sheets), full (buttons, chips, the segmented control, the current tab).
Type sizes: 12, 14, 16 for text and 22, 34, 44 for headings (all Plus Jakarta Sans in French and English).
Touch targets: 44 minimum. Text fields: 52 high. Buttons: 54 high.

## Typography

- Plus Jakarta Sans (400 to 800): every role in French and English. Titles, numerals and the wordmark use ExtraBold with a tight negative letter spacing.
- IBM Plex Sans Arabic: every role when the language is Arabic, because Plus Jakarta Sans has no Arabic letters.
- Plus Jakarta Sans is wider than the condensed face used before: capitalised labels in tight rows (like the mission rail) must be tested at their real width, because `adjustsFontSizeToFit` does nothing on the web.

Use `<Txt variant="...">` instead of `<Text>`. Do not set `fontWeight` next to these
families: each weight is its own font file. Write labels in sentence case
("Se connecter", not "SE CONNECTER").

## Components (`src/components/ui`)

| Component | Use |
|---|---|
| `Txt` | All text. Picks font by language and colour by theme |
| `Button` | Pill-shaped, 54 high. `accent` (lime) for the one primary action, `primary` (brand green), `secondary` (tint), `outline` (ink border), `destructive` (deep red) |
| `IconButton` | 44pt icon-only button. Requires `accessibilityLabel` |
| `Input` | The one text field: label above, error or hint below, show/hide for passwords. `editable={false}` draws it as read-only |
| `SegmentedControl` | Two to four mutually exclusive choices with short labels |
| `Toggle` | The one on/off switch (52 by 30) |
| `Surface`, `Hairline` | The standard bordered card (24 radius) and its row divider |
| `SectionHeader` | Section title, with an optional link that must do something |
| `ScreenHeader` | The header of every screen: optional back button, title, subtitle, bell |
| `BottomSheet` | The one bottom sheet, for lists and forms: opaque, titled, closable, safe-area aware |
| `Dialog`, `DialogActions` | The one dialog, for a decision or a short task. It rises from the bottom like a sheet, with an icon, a large title and stacked buttons |
| `EmptyState` | What a screen or list shows when there is nothing yet |
| `StatusBadge` | Small status tag for list rows, with an icon as well as a colour |
| `StatCell` | One figure in a stat panel. Use `EMPTY_VALUE` when there is no figure |
| `MissionStatusRail` | The five mission steps. The app's signature element |
| `Skeleton` | Loading placeholder, sized like the content it replaces |
| `Mirrored` | Wraps an icon that points in a direction so it flips in Arabic |
| `LanguagePickerSheet`, `LanguageToggle`, `ThemeToggle` | Language and theme controls |

Outside `ui`: `ChatThread` is the one conversation view (Chat tab and chat drawer),
and `home/HeroPanel` is the green hero used on Home, Tracking and Profile.

## Tab bar

The bottom tabs sit on the card colour with a hairline above. The current tab is drawn on a pill in the `tint` colour (a small custom button in `app/(tabs)/_layout.tsx`, because the navigation library cannot round its own highlight). An unread count is a lime badge.

## Known trade-offs

- The redesign draws text-field borders very light. The fields keep the stronger `inputBorder` colour so their edges stay visible (WCAG 1.4.11); the card and divider lines use the lighter redesign values.
- Avatars default to a brand-green fill with white initials.

## Where things live

- Language and theme: Profile, under "Réglages". Before login they are on Welcome only.
- Notifications: the bell in `ScreenHeader`.
- Text: every user-facing string is a key in `src/i18n/translations.ts` (French, Arabic,
  English). Inside components use `useTranslation()`. In stores and socket handlers use
  `translate()`.

## Arabic and right-to-left

- Choosing Arabic mirrors the layout. On the web this is immediate. On iOS and Android
  the system mirrors the layout only when the app starts, so the app shows a toast asking
  for a restart after the language changes direction.
- Write layout with logical sides: `marginStart`/`marginEnd`, `paddingStart`/`paddingEnd`,
  `start`/`end`. Do not use `left`/`right`.
- To push something to the trailing edge, use flex (`alignItems: 'flex-end'` or a
  `flex: 1` spacer). Do not use `textAlign: 'right'`.
- Wrap directional icons (back, chevrons, arrows, send) in `<Mirrored>`.
- Add `inputReset` to the style of every `TextInput`.

## Not used any more

`GlassCard`, `Pill`, `Label` and `FloatingSearchBanner` are no longer imported by any
screen. They are kept so nothing breaks, and can be deleted.

## Still open

- Right-to-left was checked in the web build only. Check it on an iPhone and an
  Android phone before release.
- The Arabic strings added during the redesign need a review by a native speaker.
- "Acceptance rate" has no backend source and shows a dash.
- "Top-rated artisans" has no backend source and is not shown.
- "Recharger le solde" only opened a placeholder message and is not shown.
- The trip picture on Tracking is a schematic, not a live map.
- Arrival time and distance come from the backend, which currently sends fixed values (8 min, 3.2 km).
- The backend does not save the transport type, CIN number, CIN photos or driving licence
  sent at artisan sign-up. The app sends them; the sign-up route ignores them.
