# Elizade Connect — Customer Web App

Customer-facing web application for **Elizade Connect**, the digital companion for Toyota ownership in Nigeria.

## Features

- **Landing** — Storytelling hero, 3D car scene, scroll-driven ownership journey
- **Auth** — OTP-based login/register (demo mode)
- **Dashboard** — Overview, quick actions, alerts, vehicle status
- **Vehicles** — Catalogue, filters, compare (up to 2), detail with gallery
- **Sales** — Test drive, quotation, reservation, trade-in, financing calculator
- **Service** — Book appointments, live job tracking, additional-work approval, history
- **Warranty** — Digital certificates, claims, recall alerts
- **Support** — Tickets, messaging, SLA visibility, satisfaction ratings
- **Notifications** — In-app inbox with categories
- **Profile** — Personal info, communication preferences, my vehicles, watchlist

## Tech Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4
- Framer Motion (animations)
- React Three Fiber + Three.js (3D hero)
- Radix UI primitives (shadcn-style components)
- next-themes (dark/light mode)
- React Router v7
- Sonner (toast notifications)

UI patterns inspired by [21st.dev](https://21st.dev) community components (aceternity container scroll, animated hero, glass morphism).

## Getting Started

```bash
cd elizade-connect-web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Demo Login

**Customer:** any phone number → OTP → any 6-digit code → customer dashboard

**Admin (Divine Obinali):** phone `08107891549` → OTP → any code → **Admin Portal**

Admin routes: `/admin/dashboard`, inventory, CRM, leads, service ops, warranty, support, notifications, analytics.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/
│   ├── effects/     # 3D scene, aurora, scroll animations
│   ├── layout/      # Dashboard, public layout, theme toggle
│   └── ui/          # Button, card, input, badge, tabs, etc.
├── context/         # Auth context (demo)
├── data/            # Dummy data
├── pages/           # Route pages
├── types/           # TypeScript interfaces
└── lib/             # Utilities
```

## Notes

- Admin portal is **not** included (customer-facing only)
- Payment gateway, DMS, and TNL integrations are stubbed for demo
- Vehicle images from Unsplash for demonstration
