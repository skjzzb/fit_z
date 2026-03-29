# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fitness Tracker** - Full-stack web application for logging meals and tracking nutrition (protein, calories). Built with React + Supabase as a portfolio project.

**Stack**: React (Vite), Tailwind CSS, Recharts, Supabase (PostgreSQL + Auth + RLS), Vercel hosting

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Build production bundle |
| `npm run lint` | Check code with ESLint |
| `npm run test` | Run vitest unit tests |
| `npm run test:ui` | Run tests with interactive UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run preview` | Preview production build locally |

## Development Workflow

### Initial Setup

1. Create Supabase project and run the SQL schema from README.md
2. Enable Google OAuth in Supabase Auth
3. Copy `.env.example` to `.env.local` and add your credentials
4. Install dependencies: `npm install`
5. Start dev server: `npm run dev`

### Database Structure

**Tables** (RLS enabled on all):
- `profiles` - User profiles (linked to `auth.users`)
- `foods` - Public food database (readable by all)
- `meal_logs` - User meal entries (user-scoped)

**Security**: Row Level Security ensures users can only access their own data.

### Architecture

**Service Layer** (`src/services/`):
- `supabase.js` - Supabase client initialization
- `foodService.js` - Food CRUD operations
- `mealService.js` - Meal logging + daily/weekly calculations
- `profileService.js` - Profile management

**Custom Hooks** (`src/hooks/`):
- `useAuth.js` - Authentication state & methods
- `useMeals.js` - Meal fetching, add, delete
- `useNutrition.js` - Daily totals & weekly data

**Components**:
- `src/components/common/Navbar.jsx` - Navigation + auth state
- `src/components/dashboard/AddMeal.jsx` - Meal logging form
- `src/components/dashboard/DailySummary.jsx` - Today's totals + meal list
- `src/components/analytics/ProteinChart.jsx` - Weekly line chart
- `src/components/analytics/CaloriesChart.jsx` - Weekly bar chart

**Pages** (`src/pages/`):
- `Login.jsx` - Google OAuth login
- `Dashboard.jsx` - Main authenticated dashboard

### Key Patterns

- **Mobile-first responsive** design using Tailwind CSS
- **Service layer** pattern - all Supabase queries in services, not components
- **Custom hooks** for business logic separation
- **React Context** for Supabase client (`src/contexts/SupabaseContext.jsx`)
- **Error handling** - consistent `{data, error}` return signatures in services
- **RLS enforcement** - all user-queried data filters by `user_id`

### Environment & Configuration

- **Supabase client** initialized in `src/services/supabase.js`
- **Env vars required**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Environment**: Vite exposes env vars prefixed with `VITE_` to client
- **Never commit** `.env.local` - use `.env.example` as template

### Common Development Tasks

**Add a new feature?**
1. Add service layer functions first (if database-related)
2. Create custom hook (if reusable logic)
3. Build components with Tailwind, use hooks
4. Ensure RLS policies cover new operations

**Need to modify database?**
- Update SQL in Supabase dashboard
- Update service layer with matching types
- Document changes in README.md schema section

**Debugging auth issues?**
- Check Supabase dashboard > Authentication > Users
- Verify RLS policies on `profiles` and `meal_logs`
- Inspect session with `supabase.auth.getUser()`

### Testing

- Tests located alongside files or in `src/test/`
- Use `@testing-library/react` for component tests
- Mock Supabase calls with jest.fn() - see patterns in existing tests
- Test setup in `src/test/setup.js`

### Project Conventions

- **Component naming**: PascalCase (e.g., `DailySummary.jsx`)
- **Service functions**: camelCase, descriptive (`getDailyTotals`, `addMeal`)
- **Tailwind**: Mobile-first, prefer utility classes over custom CSS
- **Imports**: Relative paths, grouped: React, libs, local files
- **File structure**: Feature-based grouping (`analytics/`, `dashboard/`, `common/`)

### Deployment

- **Vercel**: Import GitHub repo, add env vars, deploy
- **Build command**: `npm run build`
- **Output directory**: `dist/`
- **Node version**: Use latest LTS (18+)

## Notes

- Supabase `mealService.js` includes methods for daily/weekly aggregations (optimized queries)
- On signup, `handle_new_user()` trigger auto-creates a profile row
- Google OAuth callbacks go to `/auth/callback` (configure in Supabase)
- All charts use Recharts; responsive containers for mobile
- No secret management on frontend - only anon key (RLS protects data)

