# El 7al: brief for the redesign

El 7al is a Tunisian on-demand repair app. A client picks a service, an artisan nearby accepts, comes over, and the client pays in cash. Three roles: client, artisan, admin. French first, Arabic (RTL) later.

The current design is in `el7al-prototype.html` (open it in a browser; the screen list is on the right).

## Product rules that must not change

- Prices appear only at the last step. The artisan enters "Montant de l'intervention" at the end; the client sees "Montant déclaré par …" and confirms "J'ai payé X TND en espèces".
- Cash only between client and artisan.
- El 7al takes 30 TND per mission. The artisan pays by bank transfer (RIB + photo of the receipt). The account is paused until an admin validates the proof. The admin can validate or refuse.
- Slide-to-act bars (iPhone "slide to answer" style) for important actions: launch a request, artisan steps, send the amount.
- Client home: six service boxes in two columns, each with a small tool icon and a live "N en ligne" count. No prices on the home screen.
- Minimal text: labels and actions only.

## Current brand (can be challenged, but explain why)

- Forest green #0D5C3A (main), lime #A3E635 only for live states, paper #F2F4EE, ink #0E2A1F.
- Bricolage Grotesque (titles, numbers), Plus Jakarta Sans (text), Cairo (Arabic).
- Six flat tool icons hanging from a peg: pipe wrench (Plomberie), screwdriver (Électricité), spanner (Mécanique), gauge (Climatisation), key (Serrurerie), paint roller (Peinture).
- Signature animations: tools orbiting the "7" logo (welcome), door that opens with a key (login), four tools taking turns in the centre (sign-up), key built digit by digit (forgot password), radar (search), moving marker on a map (tracking).

## Screens

Access: welcome (4 slides), login, sign-up (client/artisan slide switch), forgot password (3 steps), location permission.
Client: home, problem, search, no artisan found, tracking, end of job, requests, messages, chat, profile, notifications, cancel sheet.
Artisan: documents upload, file sent, home, missions list, mission in progress, amount, pay El 7al, account paused, proof refused, profile.
Admin: dashboard, verifications, payments, users.

## Audience

Tunisian clients of all ages with a broken pipe or a dead socket, often stressed. Artisans on mid-range Android phones, often outdoors in sunlight. Admin works from a phone.
