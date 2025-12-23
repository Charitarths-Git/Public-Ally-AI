# LokMitra AI - Next.js Frontend

This is the Next.js version of the LokMitra AI frontend application.

## Project Structure

```
frontend-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Login page (root)
│   │   └── dashboard/         # Dashboard routes
│   │       ├── layout.tsx     # Dashboard layout with sidebar
│   │       ├── page.tsx       # Dashboard home
│   │       ├── calling-list/
│   │       ├── databases/
│   │       ├── knowledge-base/
│   │       ├── results/
│   │       └── how-to-use/
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── pages/            # Page components
│   │   ├── modals/           # Modal components
│   │   └── figma/            # Figma components
│   ├── lib/                   # Utility functions
│   ├── types/                 # TypeScript type definitions
│   ├── contexts/              # React contexts
│   └── styles/                # Global styles
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Getting Started

### Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Features

- ✅ Next.js 16 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui components
- ✅ Motion animations
- ✅ Responsive design
- ✅ Authentication with localStorage
- ✅ Nested routing for dashboard
- ✅ Theme support (governance/corporate)

## Routes

- `/` - Login page
- `/dashboard` - Dashboard home
- `/dashboard/calling-list` - Calling list management
- `/dashboard/databases` - Database connections
- `/dashboard/knowledge-base` - Knowledge base management
- `/dashboard/results` - Query results
- `/dashboard/how-to-use` - User guide

## Migration from React

This project was migrated from a Vite + React setup to Next.js. All components have been preserved and adapted to work with Next.js's App Router.

### Key Changes:

1. **Routing**: React Router → Next.js App Router
2. **File Structure**: `src/App.tsx` → `src/app/page.tsx` and nested routes
3. **Client Components**: Added `"use client"` directive where needed
4. **Navigation**: `useNavigate()` → `useRouter()` from Next.js
5. **Location**: `useLocation()` → `usePathname()` from Next.js

## Notes

- Uses `--legacy-peer-deps` for installation due to some dependency conflicts
- All UI components from shadcn/ui are included
- Global styles are in `src/app/globals.css`
- Session management uses localStorage (consider upgrading to cookies/sessions for production)
