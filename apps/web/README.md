# 🌐 El 7al - Web Platform (`apps/web`)

The **El 7al** Web Platform is a modern, responsive web application built with React 18, Vite, TypeScript, and TailwindCSS. It provides dedicated interfaces for **Clients**, **Service Providers**, and **Platform Administrators**.

---

## 🎨 Features & Features Breakdown

### 👤 Client Portal
- **Service Request & Category Selection**: Browse emergency services (Plumbing, Electricity, Mechanics, Heating, Locksmith, Towing).
- **Urgency Chips & Description**: Specify request details, urgency level, and attach audio/voice notes.
- **Interactive Live Map**: Real-time GPS location picker and Leaflet map displaying active technical service providers nearby.
- **Mission Dispatch & Tracking**: Live status updates (Searching, Accepted, In Progress, Completed, Cancelled) driven by WebSockets.
- **Instant Messaging**: Real-time Socket.io chat with assigned technical service provider.

### 🛠️ Service Provider Portal
- **Real-Time Job Dispatch**: Receive floating incoming mission request notifications.
- **Interactive Map**: View client destination and optimized route preview.
- **Status Management**: Toggle availability state (Online/Offline) and update mission progress.
- **Wallet & Commission**: Track balance, recharge wallet, and view transaction history.

### 🛡️ Admin Supervision Dashboard
- **Platform Monitoring**: Track total active missions, connected providers, and completed services.
- **User & Provider Management**: Verify service provider profiles, manage categories, and handle system alerts.

---

## 🛠️ Technology Stack

- **Framework**: React 18, Vite, TypeScript
- **Styling**: TailwindCSS, Custom Design System (`#0D5C3A` Primary Green, `#A3E635`/`#22C55E` Accents)
- **Icons**: Lucide-React SVG vector icons
- **State Management**: Zustand
- **Real-Time Data**: Socket.io Client
- **Mapping & Geolocation**: Leaflet & React-Leaflet (OpenStreetMap tile rendering)
- **HTTP Client**: Axios with automatic JWT bearer auth injectors

---

## 🚀 Running the Web Application

### Development Mode
From the root directory:
```bash
npm run dev --workspace=apps/web
```
Or directly from `apps/web`:
```bash
cd apps/web
npm run dev
```

The application will start at **`http://localhost:5173`**.

### Production Build
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Directory Structure

```
apps/web/
├── index.html              # HTML5 entry point with Google Fonts
├── vite.config.ts          # Vite build configuration & server settings
├── tailwind.config.js      # Custom theme colors, fonts, and utilities
├── src/
│   ├── components/         # Atomic reusable components
│   │   ├── admin/          # Admin supervision widgets
│   │   ├── client/         # Client request components (CategoryGrid, QuickUrgencyChips)
│   │   ├── provider/       # Provider dispatch cards & controls
│   │   ├── shared/         # Reusable buttons, inputs, modals, cards, badges
│   │   └── tracking/       # RealLeafletMap, PendingSearchCard, active mission tracking
│   ├── store/              # Zustand global state (authStore, missionStore, socketStore)
│   ├── services/           # Axios API client & endpoints
│   ├── pages/              # Client, Provider, Admin, and Auth pages
│   ├── App.tsx             # Main routing & floating notification listeners
│   └── main.tsx            # React application entrypoint
```

---

© 2026 **El 7al** Web Platform. All rights reserved.
