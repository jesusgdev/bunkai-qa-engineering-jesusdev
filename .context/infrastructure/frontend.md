# Frontend Infrastructure — Bunkai TMS

> Generated: 2026-05-25

## Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js 15 (App Router) | 15.x | SSR/SSG, routing, server actions |
| UI Library | React 19 | 19.x | Component model |
| Styling | Tailwind CSS 4 | ^4.0 | Utility-first CSS |
| Components | shadcn/ui | Latest | Accessible UI primitives |
| Icons | lucide-react | Latest | SVG icon library |
| Editor | @monaco-editor/react | Latest | Code editor for ATCs |
| Notifications | sonner | Latest | Toast system |
| HTTP Client | @supabase/supabase-js (built-in) | Latest | API calls |

## Project Structure

```
app/
├── globals.css          # Tailwind directives + CSS variables
├── layout.tsx           # Root layout: fonts, theme, toaster
├── (app)/
│   ├── layout.tsx       # AuthProvider wrapper for all app pages
│   ├── projects/[projectSlug]/
│   │   ├── page.tsx     # Project dashboard (ATC table + sidebar)
│   │   └── atcs/[atcId]/
│   │       ├── page.tsx # ATC editor/detail
│   │       └── actions.ts # Server actions for ATC CRUD
│   └── onboarding/
│       └── page.tsx     # Workspace creation form
├── (auth)/
│   └── login/
│       ├── page.tsx     # Login page
│       └── magic-link-form.tsx # Email input form
└── api/
    ├── v1/              # REST API routes
    └── openapi/          # Spec + docs

components/
├── atcs/                # ATC-specific components
├── layout/              # Navigation, sidebar, topbar
├── providers/           # Auth context provider
└── ui/                  # shadcn/ui primitives (button, input, card, etc.)

lib/
├── supabase/            # Supabase client factories
├── api/                 # API route utilities
├── openapi/             # Route annotation registry
├── openapi/             # OpenAPI spec generation
├── atc-parse.ts         # ATC step/assertion parsers
├── tree.ts              # Module tree builder
├── urls.ts              # URL builders
├── types.ts             # Shared type definitions
├── types/supabase.ts    # Generated Supabase DB types
├── env.ts               # Server env validation
└── utils.ts             # cn() helper
```

## Route Architecture

### Route Groups

| Group | Path Prefix | Layout | Protection |
|-------|------------|--------|------------|
| `(app)` | `/projects/*`, `/onboarding` | AuthProvider + Topbar + Sidebar | Middleware (session required) |
| `(auth)` | `/login` | Minimal layout (no sidebar) | None (public) |
| API | `/api/*` | — | Null | PAT/session |

### Middleware

```
middleware.ts
  matcher: excludes /api/openapi, /_next/static, /_next/image, /favicon.ico
  logic:
    - If user NOT authenticated → redirect /login
    - If user IS authenticated AND on /login → redirect /projects
```

## Component Tree

```
RootLayout
├── Toaster (sonner)
├── AuthProvider (client: (app)/layout.tsx)
│
├── LoginPage (public)
│   └── MagicLinkForm
│       ├── Wordmark
│       └── Email input + Submit
│
├── OnboardingPage (protected)
│   ├── OnboardingForm
│   └── Wordmark
│
└── ProjectDashboard (protected, SSR)
    ├── Topbar
    │   ├── WorkspaceSwitcher
    │   ├── Breadcrumb
    │   ├── CommandPalette (⌘K)
    │   └── User menu
    ├── Sidebar
    │   └── Module tree (collapsible)
    │       ├── Module nodes
    │       └── User story leaves
    └── Main panel
        ├── ATC toolbar
        │   ├── Search bar (FTS)
        │   └── "New ATC" button
        ├── AtcTable
        │   └── ATC rows (title, layer, tags, status)
        └── [ATC Detail]
            ├── AtcEditor
            │   ├── Title + slug input
            │   ├── Layer selector (UI/API/Unit)
            │   ├── Tags selector
            │   ├── StepEditor (Markdown + Monaco)
            │   └── Assertions (YAML preview)
            ├── AnchoringPanel
            │   └── AC checkboxes
            └── Save button (Server Action)
```

## State Management

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| Auth state | React Context (`AuthProvider`) | Session, user, workspace |
| Form state | React hooks (useState/useActionState) | ATC editor, onboarding |
| Server state | SSR + Server Actions | ATCs, modules, tree data |
| URL state | Next.js `useParams` / `useSearchParams` | Project slug, ATC ID |

No global state library (Redux, Zustand). Server-driven architecture — most state lives on the server.

## Styling

### Tailwind CSS 4

- Uses `@tailwindcss/postcss` for PostCSS processing
- CSS variables: `--radius` (shadcn/ui default), `--primary` (brand color)
- Dark mode: not detected (no `dark:` class or `next-themes`)

### shadcn/ui Components Detected

| Component | Usage |
|-----------|-------|
| Button | Actions ("New ATC", "Save", submit) |
| Input | Email, workspace slug, search |
| Card | Layout panels |
| Dialog / Modal | Not detected in current code |
| Sheet | Sidebar (potentially) |
| Tooltip | Likely used but not confirmed |

## Layout Modes

### Login Page (Split Layout)

```
┌──────────────────────────────┐
│  Brand Panel │  Form Panel   │
│  (left)      │  (right)      │
│   Wordmark   │  Magic Link   │
│   Tagline    │  Form         │
└──────────────────────────────┘
```

### Project Dashboard (Sidebar + Main)

```
┌──────────────────────────────┐
│ Topbar (Workspace · Breadcrumbs · Search · User) │
├──────────┬───────────────────┤
│ Sidebar  │ Main Content      │
│ (Module  │ (ATC Table /      │
│  Tree)   │  ATC Editor)      │
│          │                   │
│ Collapsible                  │
└──────────┴───────────────────┘
```

## Accessibility

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| ARIA labels | Limited use | shadcn/ui provides basic ARIA |
| Keyboard nav | ⌘K command palette, form tab order | `CommandPalette.tsx` |
| Focus management | Basic (browser default) | No custom focus traps detected |
| Color contrast | Default shadcn/ui tokens | Not verified against WCAG |
| Reduced motion | Not detected | No `prefers-reduced-motion` |

## Responsive Design

| Breakpoint | Layout | Status |
|------------|--------|--------|
| Desktop (≥1024px) | Sidebar visible + main panel | ✅ As designed |
| Tablet (768-1023px) | Collapsible sidebar | ❓ Needs verification |
| Mobile (<768px) | Full-width, sidebar hidden | ❓ Not implemented |

## Edge Cases

| Scenario | Expected Behavior | Status |
|----------|------------------|--------|
| User navigates directly to ATC URL | SSR loads ATC + sidebar | ✅ |
| ATC ID doesn't exist | 404 or empty state | ❓ Not checked |
| Module tree has 1000+ items | Sidebar scrolls | ❓ Performance untested |
| Browser back/forward | Next.js handles via App Router | ✅ |
| Session expires mid-edit | Next redirect on next interaction | ✅ (middleware) |
| Very long ATC title | Truncated in table | ❓ Not verified |
