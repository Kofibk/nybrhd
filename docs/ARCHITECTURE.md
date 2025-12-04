# Naybourhood.ai - Architecture Documentation

## Overview

Naybourhood.ai is a multi-tenant property lead generation and campaign management platform serving three user types: Property Developers, Estate Agents, and Mortgage Brokers, plus an internal Admin tier.

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + localStorage
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Backend**: Supabase (Lovable Cloud)
- **Icons**: Lucide React

---

## Directory Structure

```
src/
├── assets/                 # Static assets (logos, images)
├── components/
│   ├── admin/              # Admin-specific components
│   └── ui/                 # shadcn/ui components
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── integrations/
│   └── supabase/           # Supabase client & types
├── lib/                    # Utilities, types, demo data
├── pages/
│   └── admin/              # Admin page components
└── utils/                  # Helper utilities
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    AuthProvider                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              QueryClientProvider                 │    │    │
│  │  │  ┌─────────────────────────────────────────┐    │    │    │
│  │  │  │            BrowserRouter                 │    │    │    │
│  │  │  │  ┌─────────────────────────────────┐    │    │    │    │
│  │  │  │  │           Routes                 │    │    │    │    │
│  │  │  │  └─────────────────────────────────┘    │    │    │    │
│  │  │  └─────────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────────┐
│  Login   │───▶│  Enter   │───▶│   Verify     │───▶│  Redirect   │
│  Page    │    │  Email   │    │   Code       │    │  by Role    │
└──────────┘    └──────────┘    └──────────────┘    └─────────────┘
                     │                  │                  │
                     ▼                  ▼                  ▼
              POST /auth.         POST /auth.        localStorage
              requestCode         verifyCode         session set
```

### Auth Context (src/contexts/AuthContext.tsx)

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `token` | `string \| null` | Auth session token |
| `isAuthenticated` | `boolean` | Auth status |
| `isLoading` | `boolean` | Loading state |
| `login()` | `function` | Set user session |
| `logout()` | `function` | Clear session |

---

## User Types & Routes

### Route Protection

```
┌─────────────────────────────────────────────────────────────┐
│                      ProtectedRoute                          │
│  - Checks isAuthenticated from AuthContext                   │
│  - Redirects to /login if not authenticated                  │
│  - Shows loading state while checking                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        AdminRoute                            │
│  - Checks email against admin_emails table (Supabase)        │
│  - Uses useAdminAuth hook                                    │
│  - Redirects non-admins to home                              │
└─────────────────────────────────────────────────────────────┘
```

### Route Map

| Route | Component | Protection | User Type |
|-------|-----------|------------|-----------|
| `/` | Landing | None | Public |
| `/login` | Login | None | Public |
| `/onboarding` | Onboarding | None | Public |
| `/developer` | DeveloperDashboard | ProtectedRoute | Developer |
| `/developer/campaigns` | CampaignsList | ProtectedRoute | Developer |
| `/developer/campaigns/new` | CampaignWizard | ProtectedRoute | Developer |
| `/developer/campaigns/:id` | CampaignDetail | ProtectedRoute | Developer |
| `/developer/leads` | LeadsManagement | ProtectedRoute | Developer |
| `/developer/analytics` | AnalyticsDashboard | ProtectedRoute | Developer |
| `/developer/settings` | Settings | ProtectedRoute | Developer |
| `/agent/*` | Same structure | ProtectedRoute | Agent |
| `/broker/*` | Same structure | ProtectedRoute | Broker |
| `/admin` | AdminDashboard | AdminRoute | Admin |
| `/admin/clients/:id` | ClientDetail | AdminRoute | Admin |

---

## Component Hierarchy

### Dashboard Layout

```
DashboardLayout
├── Sidebar (Desktop)
│   ├── Logo
│   ├── NavLink (Dashboard)
│   ├── NavLink (Campaigns)
│   ├── NavLink (Leads)
│   ├── NavLink (Analytics)
│   ├── NavLink (Settings)
│   └── Logout Button
├── Sheet (Mobile Menu)
│   └── SidebarContent
└── Main Content Area
    └── {children}
```

### Page Components

```
DeveloperDashboard
├── Welcome Header
├── KPI Cards (4x)
│   ├── Active Campaigns
│   ├── Leads This Week
│   ├── Booked Viewings
│   └── Conversion Rate
├── Active Campaigns Table
├── Development Overview Grid
│   └── Development Cards
└── AI Recommendations
    └── Recommendation Cards

CampaignsList
├── Header + Create Button
├── Filter Controls
└── Campaigns Table
    └── Campaign Rows → Link to CampaignDetail

CampaignDetail
├── Header (Name, Status, Dates)
├── KPI Cards
└── Tabs
    ├── Overview (Charts)
    ├── Creatives (Assets)
    ├── Tracking (UTMs)
    └── Platform IDs

LeadsManagement
├── Header + Filters
├── Leads Table
└── Lead Drawer (on row click)
    ├── Contact Details
    ├── LeadScoreCard
    ├── Notes Section
    └── Action Buttons

AnalyticsDashboard
├── Date Range Selector
├── Summary KPI Cards
├── Campaign Performance Table
├── Charts Section
└── Lead Scoring Breakdown
```

### Admin Components

```
AdminDashboard
├── AdminHeader
├── Stats Overview Cards
└── Tabs
    ├── Clients Tab
    │   ├── InviteClientDialog
    │   └── AdminClientsTable
    ├── Campaigns Tab
    │   ├── CreateClientCampaignDialog
    │   └── AdminCampaignsTable
    ├── Billing Tab
    │   └── AdminBillingTable
    └── Analytics Tab
        └── AdminAnalyticsOverview

ClientDetail
├── Header + Back Button
├── Client Info Card
├── KPI Cards
└── Tabs
    ├── Campaigns
    ├── Leads
    ├── Billing
    └── Notes
```

---

## Data Models (src/lib/types.ts)

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'developer' | 'agent' | 'broker';
  company?: string;
  createdAt: string;
}
```

### Development

```typescript
interface Development {
  id: string;
  userId: string;
  name: string;
  location: string;
  totalUnits: number;
  availableUnits: number;
  priceRange: { min: number; max: number };
  status: 'pre-launch' | 'live' | 'sold-out';
  imageUrl?: string;
  features: string[];
  createdAt: string;
}
```

### Campaign

```typescript
interface Campaign {
  id: string;
  userId: string;
  developmentId: string;
  name: string;
  objective: 'leads' | 'viewings' | 'awareness';
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed';
  budget: number;
  dailyCap: number;
  startDate: string;
  endDate: string;
  targeting: AudienceTargeting;
  creatives: CampaignCreative[];
  leadFormFields: LeadFormFields;
  metaCampaignId?: string;
  metaAdsetId?: string;
  metaFormId?: string;
  metaAdIds?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Lead

```typescript
interface Lead {
  id: string;
  campaignId: string;
  developmentId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  budgetRange: string;
  paymentMethod: 'cash' | 'mortgage';
  buyerStatus: 'browsing' | 'active';
  timeline: string;
  bedroomPreference?: string;
  intentScore: number;
  qualityScore: number;
  status: 'new' | 'contacted' | 'engaged' | 'viewing-booked' | 'offer-made' | 'won' | 'lost';
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### DailyMetrics

```typescript
interface DailyMetrics {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  leads: number;
  spend: number;
  ctr: number;
  cpl: number;
  cpc: number;
}
```

---

## State Management

### localStorage Keys

| Key | Purpose |
|-----|---------|
| `auth_token` | Session authentication token |
| `auth_user` | Serialized user object |
| `campaign_draft` | In-progress campaign wizard data |

### Demo Data (src/lib/demoData.ts)

Pre-seeded data for demonstration:
- 3 sample users (one per role)
- 5 developments across UK
- 4 campaigns (various statuses)
- 10+ leads with varied scores
- 14 days of daily metrics per campaign

---

## API Layer (src/lib/api.ts)

All endpoints are stubs designed for future real API replacement:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth.requestCode` | POST | Send verification code |
| `/auth.verifyCode` | POST | Verify code, return session |
| `/campaigns.create` | POST | Create campaign, get AI copy |
| `/campaigns.publish.meta` | POST | Publish to Meta, get IDs |
| `/metrics.sync.meta.daily` | POST | Sync daily metrics |
| `/settings.upsert` | POST | Update user settings |

---

## Supabase Integration

### Tables

```sql
-- Admin access control
admin_emails (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ
)
```

### RLS Policies

```sql
-- Anyone can check if email is admin
Policy: "Anyone can check admin emails"
Command: SELECT
Using: true
```

### Admin Auth Hook (src/hooks/useAdminAuth.ts)

```typescript
const { isAdmin, isLoading, userEmail } = useAdminAuth();
// Checks session email against admin_emails table
```

---

## Component Dependencies

### UI Components (shadcn/ui)

| Component | Used In |
|-----------|---------|
| `Button` | All pages |
| `Card` | Dashboards, detail pages |
| `Table` | Lists, admin tables |
| `Tabs` | Detail pages, settings |
| `Dialog` | Create/invite modals |
| `Sheet` | Mobile menu, lead drawer |
| `Select` | Filters, form fields |
| `Input` | Forms, search |
| `Badge` | Status indicators |
| `Avatar` | User displays |
| `DropdownMenu` | Action menus |
| `Progress` | Score displays |

### Custom Components

| Component | Purpose |
|-----------|---------|
| `DashboardLayout` | Main layout wrapper |
| `NavLink` | Active-aware navigation |
| `LeadScoreCard` | Intent/Quality score display |
| `CampaignBuilder` | Campaign creation logic |
| `WhatsAppChat` | Chat interface (demo) |
| `EmailDripSequence` | Email automation (demo) |

---

## Styling System

### Design Tokens (index.css)

```css
:root {
  --primary: 213 39% 17%;        /* Midnight Navy #1E2A38 */
  --secondary: 34 43% 95%;       /* Warm Beige #F8F4EF */
  --accent: 38 100% 72%;         /* Gold Yellow #FFC870 */
  --foreground: 215 14% 30%;     /* Text #3F4A5A */
}
```

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

---

## Key Flows

### Campaign Creation Flow

```
CampaignWizard
    │
    ├── Step 1: Overview
    │   └── Name, Objective, Development
    │
    ├── Step 2: Budget & Dates
    │   └── Total Budget (£), Daily Cap, Dates
    │
    ├── Step 3: Audience
    │   └── Country Selection (Multi-select)
    │
    ├── Step 4: Creatives
    │   ├── Upload Assets (Images/Video)
    │   └── AI Copy Generation (3 options)
    │
    ├── Step 5: Tracking
    │   └── Auto-generated UTMs Display
    │
    └── Step 6: Review & Publish
        └── POST /campaigns.publish.meta
            └── Redirect to CampaignDetail
```

### Lead Management Flow

```
LeadsManagement
    │
    ├── View Table
    │   └── Filter by Status/Score/Date
    │
    ├── Click Row
    │   └── Open Lead Drawer
    │
    └── Lead Drawer
        ├── View Details
        ├── Add Notes
        └── Update Status
            ├── Mark Contacted
            ├── Book Viewing
            ├── Mark Won
            └── Mark Lost
```

---

## Currency & Localization

- **Currency**: British Pounds (£) universally
- **Format**: £X,XXX (comma separators)
- **Date Format**: DD/MM/YYYY or relative
- **Region**: UK-focused with international targeting

---

## Future Integration Points

| Feature | Current State | Integration Ready |
|---------|---------------|-------------------|
| Meta Ads API | Stub | Yes |
| WhatsApp Business | UI Demo | Yes |
| Email Service | UI Demo | Yes |
| Stripe Billing | Mock Data | Yes |
| Real Auth | localStorage | Yes |
| Database | Demo Data | Yes |

---

## File Reference

### Core Files

- `src/App.tsx` - Main app with routing
- `src/contexts/AuthContext.tsx` - Auth state
- `src/hooks/useAdminAuth.ts` - Admin verification
- `src/lib/types.ts` - TypeScript interfaces
- `src/lib/demoData.ts` - Mock data
- `src/lib/api.ts` - Stub API endpoints
- `src/components/DashboardLayout.tsx` - Layout wrapper

### Page Files

- `src/pages/Landing.tsx` - Public landing
- `src/pages/Login.tsx` - Auth page
- `src/pages/Onboarding.tsx` - Role selection
- `src/pages/DeveloperDashboard.tsx` - Developer home
- `src/pages/AgentDashboard.tsx` - Agent home
- `src/pages/BrokerDashboard.tsx` - Broker home
- `src/pages/CampaignsList.tsx` - Campaigns list
- `src/pages/CampaignDetail.tsx` - Campaign view
- `src/pages/CampaignWizard.tsx` - Campaign creation
- `src/pages/Settings.tsx` - User settings
- `src/pages/admin/AdminDashboard.tsx` - Admin home
- `src/pages/admin/ClientDetail.tsx` - Client view

### Admin Components

- `src/components/admin/AdminHeader.tsx`
- `src/components/admin/AdminRoute.tsx`
- `src/components/admin/AdminClientsTable.tsx`
- `src/components/admin/AdminCampaignsTable.tsx`
- `src/components/admin/AdminBillingTable.tsx`
- `src/components/admin/AdminAnalyticsOverview.tsx`
- `src/components/admin/InviteClientDialog.tsx`
- `src/components/admin/CreateClientCampaignDialog.tsx`
