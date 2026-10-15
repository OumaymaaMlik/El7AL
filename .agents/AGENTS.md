# EL 7AL - DEVELOPMENT & CODE RULES

You are working on the **El 7al** cross-platform ecosystem (React Native Mobile + React Web + Node.js Fastify Backend). 

**STRICT BRANDING RULE**: ALWAYS use **El 7al** as the official app name in all UI screens, headers, titles, and text (NEVER use "Solution El 7al").

Strictly enforce the following architectural, design, and communication rules at all times:

---

### 1. FRONTEND: ATOMIC & MODULAR DESIGN (NO MONOLITHIC COMPONENTS)
- **Component Size Limit**: NEVER create single monolithic components (e.g., components exceeding 150-200 lines). Break UI down into small, single-responsibility components.
- **Shared UI First**: ALWAYS extract and use reusable shared components from the shared UI directory (e.g., `<Button>`, `<Input>`, `<Modal>`, `<Card>`, `<Badge>`).
- **DRY Layouts**: Avoid repeating layout wrappers or container styling across pages. Use generic layout components (`ClientLayout`, `ProviderLayout`, `AdminLayout`).
- **No Fake Data or Fake Badges**: NEVER add static fake counters (e.g. fake provider counts) or random AI badges (e.g. "100% security"). Only use REAL dynamic functionality from the backend.
- **No Emojis Anywhere in UI**: NEVER use emoji characters (e.g. 🚗, ⏳, 🔒, 🛠️, 🎉, ⚡, 📍) as icons, logos, badges, or button text. ALWAYS use clean SVG / Lucide vector icons (`<Car>`, `<Clock>`, `<Lock>`, `<Wrench>`, `<PartyPopper>`, `<Zap>`, `<MapPin>`).
- **NOTIFICATION & REAL-TIME LISTENERS RULE**: ALL major platform events (mission requests, acceptances, chat messages, cancellations, completions, wallet balance alerts, upcoming features) MUST generate real-time Socket events, populate the central Notification Store, and trigger an in-app floating Notification Toast. Socket listeners MUST run continuously at the root level (`_layout.tsx`), never scoped only to a closed modal or drawer.
- **INSTAGRAM-STYLE PULL-TO-REFRESH RULE**: ALL scrollable screens (Home, Suivi/Tracking, Profile, Notifications, History) MUST feature native pull-to-refresh functionality using `<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />`. NEVER place manual static reload icon buttons in headers or cards.
- **FULL i18n INTERNATIONALIZATION RULE**: ALL screens, components, buttons, inputs, labels, toasts, modals, and headers MUST support 100% full multi-language translation (French 'FR', Arabic 'AR', English 'EN') using `useTranslation()` / `t()`. NEVER write raw hardcoded UI strings on any new or existing mobile screen.

---

### 2. BACKEND & INFRASTRUCTURE INTEGRITY
- **Minimalist Architecture**: Keep Fastify route handlers thin. Move core business logic into domain services (`services/`).
- **Infrastructure Architecture**: Use Redis for real-time states & caching, BullMQ for task queues/background jobs, Socket.io for WebSockets, and Prisma + PostGIS for spatial database queries.
- **Zero Code Duplication (DRY)**: ALWAYS scan the project first to see if code/utilities/components already exist before creating new ones. Never write duplicate code or introduce redundant libraries. Keep the project lightweight.
- **Strict Validation & Security**: Always validate incoming request payloads with Zod/JSON Schema before processing. Never expose sensitive fields (password hashes, secret tokens) in API responses.

---

### 3. DESIGN SYSTEM & CSS CONSISTENCY
- **Strict Theme Adherence**: Always respect the project's design system (Primary colors `#0D5C3A`, Accent colors `#A3E635`/`#22C55E`, Dark/Light themes, Typography, and spacing tokens).
- **Mobile Design 1:1 Reference**: All new pages must strictly match the aesthetic, colors, inputs, cards, and patterns of the existing Welcome / Login / Register / Home pages.

---

### 4. PHASE-BY-PHASE WORKFLOW & COMMUNICATION
- **Interactive Phase Workflow**:
  1. Present the detailed plan for the current phase only.
  2. Wait for user review and explicit approval (or modifications).
  3. Execute the changes and present a concise summary of what was checked and what was done.
  4. Wait for user testing and final approval before moving to the next phase.
- **Minimalist Responses**: Keep your explanations concise, clean, and direct.

---

### 5. QUALITY GATE & GIT WORKFLOW
- **Read `docs/ARCHITECTURE.md` first.** It says where each kind of code goes and the rules per layer. Follow it; if a rule must change, change the document in the same commit.
- **Before you say a task is done, run `npm run check`** (strict types, lint, web and backend builds). For anything that touches missions, events or notifications, also run `npm run test:lifecycle` and add a check for the new behaviour.
- **Lint warnings may not increase.** `npm run lint` fails when the count goes above the ceiling in `package.json`. When you remove warnings, lower the ceiling to the new count.
- **Real-time events**: send once with `participantRooms`, never notify a person of their own action, and update `docs/API_CONTRACT.md`.
- **Git**: one repository, trunk-based. Work on a short-lived branch, open a pull request into `main`, and merge only when CI is green. Use small commits with a clear message.
- **Backend features**: after finishing one, tell the user to try it on Swagger (`http://localhost:4000/docs`) and wait for their approval before pushing.
