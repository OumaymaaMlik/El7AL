# El 7al mobile design system

This is the reference for how the mobile app looks and behaves. Every screen follows it:
Welcome, Login, Register, Home (client and artisan), Tracking, Chat, Profile, the artisan
page, the dialogs and the Administration dashboard.

## Principles

1. One green surface per screen. The brand-green hero says what is happening now and
   offers the one thing to do next.
2. Lime is a fill, not a text colour. It marks the single primary action and live status.
   For green text or icons use `accentText`. In a list where every row has the same
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
| `src/theme/colors.ts` | Colour roles for dark and light, plus legacy names |
| `src/theme/tokens.ts` | Spacing, radii, control sizes, type sizes, tab bar height, `inputReset` |
| `src/theme/typography.ts` | Font files and the type scale (Latin and Arabic) |
| `src/theme/useType.ts` | Hook that returns the type scale for the current language |

Colour roles: `background`, `surface`, `raised`, `border`, `text`, `textSecondary`,
`textMuted`, `brand`, `brandInset`, `onBrand`, `onBrandMuted`, `onBrandFaint`, `action`,
`onAction`, `accentText`, `star`, `danger`, `dangerText`, `dangerSoft`, `overlay`.

Spacing: 4, 8, 12, 16, 20, 24, 32. Page margin: 20.
Radii: 8 (tags, chips), 14 (controls, panels), 24 (hero, sheets).
Type sizes: 12, 14, 16 (IBM Plex Sans) and 22, 34, 44 (Barlow Condensed).
Touch targets: 44 minimum. Controls: 52 high.

## Typography

- Barlow Condensed: headings, numerals, status labels.
- IBM Plex Sans: everything people read or tap.
- IBM Plex Sans Arabic: both roles when the language is Arabic.

Use `<Txt variant="...">` instead of `<Text>`. Do not set `fontWeight` next to these
families: each weight is its own font file. Write labels in sentence case
("Se connecter", not "SE CONNECTER").

## Components (`src/components/ui`)

| Component | Use |
|---|---|
| `Txt` | All text. Picks font by language and colour by theme |
| `Button` | `accent` for the one primary action, then `primary`, `secondary`, `outline`, `destructive` |
| `IconButton` | 44pt icon-only button. Requires `accessibilityLabel` |
| `Input` | The one text field: label above, error or hint below, show/hide for passwords |
| `SegmentedControl` | Two to four mutually exclusive choices with short labels |
| `Toggle` | The one on/off switch |
| `Surface`, `Hairline` | The standard bordered panel and its row divider |
| `SectionHeader` | Section title, with an optional link that must do something |
| `ScreenHeader` | The header of every screen: optional back button, title, subtitle, bell |
| `BottomSheet` | The one bottom sheet, for lists and forms: opaque, titled, closable, safe-area aware |
| `Dialog`, `DialogActions` | The one centred dialog, for a decision or a short task |
| `EmptyState` | What a screen or list shows when there is nothing yet |
| `StatusBadge` | Small status tag for list rows, with an icon as well as a colour |
| `StatCell` | One figure in a stat panel. Use `EMPTY_VALUE` when there is no figure |
| `MissionStatusRail` | The five mission steps. The app's signature element |
| `Skeleton` | Loading placeholder, sized like the content it replaces |
| `Mirrored` | Wraps an icon that points in a direction so it flips in Arabic |
| `LanguagePickerSheet`, `LanguageToggle`, `ThemeToggle` | Language and theme controls |

Outside `ui`: `ChatThread` is the one conversation view (Chat tab and chat drawer),
and `home/HeroPanel` is the green hero used on Home, Tracking and Profile.

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
