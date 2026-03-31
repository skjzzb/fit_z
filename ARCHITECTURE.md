# Fitness Tracker - Complete Architecture Documentation

## 1. System Overview

**Fitness Tracker** is a full-stack web application for tracking nutritional intake and fitness metrics. Users log meals, track protein and calorie consumption, and visualize progress through interactive charts.

**Application Type**: Full-Stack Web Application  
**Architecture Pattern**: Service Layer + Custom Hooks + React Components  
**Hosting**: Vercel (Frontend), Supabase (Backend)  
**Target Users**: Fitness enthusiasts, athletes, nutrition-conscious individuals

---

## 2. Technology Stack

### Frontend
| Technology | Purpose | Version |
|---|---|---|
| **React** | UI library | 18.2.0 |
| **Vite** | Build tool & dev server | 5.0.8 |
| **Tailwind CSS** | Styling (utility-first) | 3.4.0 |
| **Recharts** | Data visualization (charts) | 2.10.3 |
| **Supabase.js** | Backend client library | 2.39.0 |

### Backend
| Technology | Purpose |
|---|---|
| **Supabase** | Backend-as-a-Service (BaaS) |
| **PostgreSQL** | Relational database |
| **Supabase Auth** | User authentication (Google OAuth) |
| **Row Level Security (RLS)** | Data access control |

### Development Tools
| Tool | Purpose |
|---|---|
| **ESLint** | Code linting |
| **Vitest** | Unit testing framework |
| **React Testing Library** | Component testing |
| **PostCSS** | CSS processing |

---

## 3. Database Architecture

### 3.1 Data Model

```
┌─────────────────────────────────────────────────────┐
│                  AUTH.USERS (Supabase)              │
│                                                     │
│  id (UUID) | email | name | created_at             │
└────────────────────┬────────────────────────────────┘
                     │ (1:1 relationship)
                     ▼
┌─────────────────────────────────────────────────────┐
│                   PROFILES                          │
│                                                     │
│  id (UUID) | name | email | avatar_url             │
│  created_at | updated_at                            │
└─────────────────────────────────────────────────────┘
           │
           │ (1:N relationship)
           ▼
┌─────────────────────────────────────────────────────┐
│                  MEAL_LOGS                          │
│                                                     │
│  id (UUID) | user_id (FK) | food_id (FK)           │
│  quantity | created_at                              │
└────────────────┬───────────────────┬────────────────┘
                 │                   │
                 │                   │ (N:1 relationship)
                 │                   │
                 ▼                   ▼
        (RLS filtered)      ┌──────────────────────┐
        (User-specific)     │      FOODS           │
                            │                      │
                            │  id (UUID)           │
                            │  name | protein      │
                            │  calories | created_at
                            │  (Public readable)   │
                            └──────────────────────┘
```

### 3.2 Table Schema Details

#### **PROFILES Table**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```
- **Purpose**: Stores user profile information linked to auth.users
- **Relationship**: 1:1 with auth.users
- **RLS Policy**: Users can only read/update their own row

#### **FOODS Table**
```sql
CREATE TABLE foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  protein NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```
- **Purpose**: Public food database with nutritional data
- **Relationship**: 1:N with meal_logs
- **RLS Policy**: All authenticated users can read; authenticated users can insert custom foods

#### **MEAL_LOGS Table**
```sql
CREATE TABLE meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  quantity NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```
- **Purpose**: Records of meals logged by users
- **Relationships**: 
  - N:1 with profiles (user_id)
  - N:1 with foods (food_id)
- **RLS Policy**: Users can only access their own meal_logs

### 3.3 Row Level Security (RLS) Policies

```sql
-- PROFILES: Users view/update only their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- FOODS: Public read access, authenticated users can create
CREATE POLICY "Foods are viewable by all" ON foods
  FOR SELECT USING (true);

CREATE POLICY "Users can create foods" ON foods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- MEAL_LOGS: Users access only their own meals
CREATE POLICY "Users can CRUD own meal_logs" ON meal_logs
  USING (auth.uid() = user_id);
```

### 3.4 Triggers & Functions

#### **AutoCreate Profile on User Signup**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. Frontend Architecture

### 4.1 Directory Structure

```
src/
├── components/
│   ├── analytics/
│   │   ├── ProteinChart.jsx        # Weekly protein visualization
│   │   └── CaloriesChart.jsx       # Weekly calories visualization
│   ├── auth/                        # (Future auth components)
│   ├── common/
│   │   └── Navbar.jsx               # App navigation & auth state
│   └── dashboard/
│       ├── AddMeal.jsx              # Meal logging form
│       ├── AddCustomMealModal.jsx   # Custom meal creation
│       ├── DailySummary.jsx         # Daily stats & meal list
│       └── LogMealModal.jsx         # Meal selection modal
├── contexts/
│   └── SupabaseContext.jsx          # Supabase client provider
├── hooks/
│   ├── useAuth.js                   # Auth state & methods
│   ├── useMeals.js                  # Meal CRUD operations
│   └── useNutrition.js              # Nutrition calculations & charts
├── pages/
│   ├── Dashboard.jsx                # Main authenticated page
│   └── Login.jsx                    # Google OAuth login
├── services/
│   ├── supabase.js                  # Supabase client init
│   ├── foodService.js               # Food CRUD operations
│   ├── mealService.js               # Meal calculations & queries
│   └── profileService.js            # Profile management
├── utils/
│   └── formatters.js                # Data formatting utilities
├── test/
│   └── setup.js                     # Testing configuration
├── App.jsx                          # Root component
├── main.jsx                         # App entry point
└── index.css                        # Global styles
```

### 4.2 Component Hierarchy

```
App
├── Navbar
│   ├── Auth State Display
│   ├── Sign Out Button
│   └── Sign In with Google
└── Routes
    ├── Login Page
    │   └── Google OAuth Button
    └── Dashboard (Protected)
        ├── Header
        │   └── Date Picker
        ├── Main Content
        │   ├── AddMeal
        │   │   ├── Food Search Input
        │   │   ├── Food Selector Dropdown
        │   │   ├── Quantity Input
        │   │   └── Custom Meal Modal
        │   │       ├── Name Input
        │   │       ├── Protein Input
        │   │       ├── Calories Input
        │   │       └── Weight Input
        │   └── DailySummary
        │       ├── Totals Cards (3)
        │       │   ├── Protein Card
        │       │   ├── Calories Card
        │       │   └── Meals Count Card
        │       └── Meals List
        │           ├── Meal Item (repeated)
        │           │   ├── Food Name
        │           │   ├── Nutritional Info
        │           │   └── Delete Button
        │           └── Clear All Button
        └── Sidebar
            ├── Insights Section
            ├── ProteinChart
            │   └── Recharts LineChart
            └── CaloriesChart
                └── Recharts BarChart
```

---

## 5. Service Layer Architecture

### 5.1 Service Layer Pattern

The application follows a **Service Layer** pattern where all data access logic is abstracted into service files:

```
Components (UI) ← → Hooks (Business Logic) ← → Services (Data Access)
                                                     ↓
                                              Supabase Client
                                                     ↓
                                              PostgreSQL Database
```

### 5.2 Service Files

#### **src/services/supabase.js**
```javascript
// Initializes Supabase client with environment variables
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```
- **Responsibility**: Supabase client initialization
- **Exports**: Singleton `supabase` instance

#### **src/services/mealService.js**
```javascript
export const mealService = {
  getMealLogs(userId, date),           // Fetch meals for date
  getAllMeals(userId),                  // Fetch all meals
  addMeal(userId, foodId, quantity),   // Log new meal
  deleteMeal(mealId, userId),          // Remove meal
  getDailyTotals(userId, date),        // Calculate daily stats
  getWeeklyTotals(userId),             // Calculate weekly stats
  getMonthlyTotals(userId),            // Calculate monthly stats
  getYearlyTotals(userId)              // Calculate yearly stats
};
```
- **Responsibility**: Meal logging & nutritional calculations
- **Key Methods**:
  - `getMealLogs()`: Filters by user_id and optional date
  - `getDailyTotals()`: Aggregates protein & calories for a day
  - `getWeeklyTotals()`: Groups meals by date for chart data

#### **src/services/foodService.js**
```javascript
export const foodService = {
  getAllFoods(),                  // Fetch all foods
  searchFoods(query),             // Search by name
  createFood(name, protein, calories) // Add custom food
};
```
- **Responsibility**: Food database operations
- **Notes**: Supports public read + authenticated user inserts

#### **src/services/profileService.js**
```javascript
export const profileService = {
  getProfile(userId),             // Fetch user profile
  updateProfile(userId, data)     // Update profile info
};
```
- **Responsibility**: User profile management

### 5.3 Error Handling Pattern

All service methods return consistent `{data, error}` signatures:

```javascript
// Success case
const { data, error } = await mealService.addMeal(userId, foodId, quantity);
if (!error && data) {
  // Handle success
}

// Error case
if (error) {
  console.error('Error:', error.message);
}
```

---

## 6. Custom Hooks Architecture

### 6.1 Hook Patterns

Custom hooks encapsulate business logic and state management for reusable functionality:

#### **useAuth.js**
```javascript
export function useAuth() {
  // State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Methods
  const signInWithGoogle = async () => { };
  const signOut = async () => { };

  // Return
  return { session, loading, signInWithGoogle, signOut };
}
```
- **Purpose**: Manages authentication state
- **Features**: Google OAuth login/logout, session tracking
- **Scope**: Global authentication state

#### **useMeals.js**
```javascript
export function useMeals(userId) {
  // State
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Methods
  const fetchMeals = async (date) => { };
  const addMeal = async (foodId, quantity) => { };
  const deleteMeal = async (mealId) => { };

  // Auto-fetch on userId change
  useEffect(() => { fetchMeals(); }, [userId]);

  // Return
  return { meals, loading, error, fetchMeals, addMeal, deleteMeal };
}
```
- **Purpose**: Meal CRUD operations & state
- **Scope**: User-specific meal data
- **Auto-refresh**: Fetches meals on component mount

#### **useNutrition.js**
```javascript
export function useNutrition(userId) {
  // State
  const [dailyTotals, setDailyTotals] = useState({ });
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);

  // Methods
  const fetchDailyTotals = async (date) => { };
  const fetchWeeklyData = async () => { };
  const fetchMonthlyData = async () => { };
  const fetchYearlyData = async () => { };

  // Return
  return {
    dailyTotals,
    weeklyData,
    monthlyData,
    yearlyData,
    refreshDaily,
    refreshWeekly,
    refreshMonthly,
    refreshYearly
  };
}
```
- **Purpose**: Nutritional data aggregation for charts
- **Scope**: User-specific nutrition metrics
- **Chart Support**: Provides weekly, monthly, yearly data

### 6.2 Hook Usage Pattern

```jsx
// In Component
export default function Dashboard() {
  const { session } = useAuth();           // Auth state
  const { meals, addMeal, deleteMeal } = useMeals(session.user.id);
  const { dailyTotals, weeklyData } = useNutrition(session.user.id);

  return (
    <div>
      <DailySummary meals={meals} totals={dailyTotals} />
      <ProteinChart data={weeklyData} />
    </div>
  );
}
```

---

## 7. Data Flow & State Management

### 7.1 User Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Calls useAuth.signInWithGoogle()
   ↓
3. Supabase redirects to Google OAuth
   ↓
4. User grants permissions
   ↓
5. Google redirects back to app with auth code
   ↓
6. Supabase exchanges code for session
   ↓
7. useAuth hook updates session state
   ↓
8. User is redirected to Dashboard
   ↓
9. useAuth/useMeals/useNutrition hooks fetch user data
```

### 7.2 Meal Logging Flow

```
1. User fills AddMeal form
   ├─ Selects food from dropdown
   ├─ Enters quantity
   └─ Clicks "Log Meal"
   ↓
2. AddMeal calls useMeals.addMeal(foodId, quantity)
   ↓
3. useMeals calls mealService.addMeal()
   ↓
4. mealService inserts into meal_logs table
   ├─ Filters by user_id (RLS)
   └─ Returns inserted meal with related food data
   ↓
5. useMeals updates local state (meals array)
   ↓
6. Components using useMeals re-render
   ├─ DailySummary updates totals
   ├─ Charts update with new data
   └─ AddMeal shows success message
   ↓
7. useNutrition.refreshDaily() called to update charts
```

### 7.3 Data Query Flow

```
Dashboard Component
├─ useAuth() → Fetch current session
├─ useMeals(userId)
│  └─ mealService.getMealLogs(userId)
│     └─ SELECT from meal_logs WHERE user_id = ? (RLS enforced)
└─ useNutrition(userId)
   ├─ mealService.getDailyTotals()
   ├─ mealService.getWeeklyTotals()
   ├─ mealService.getMonthlyTotals()
   └─ mealService.getYearlyTotals()
```

---

## 8. Component Details

### 8.1 Page Components

#### **Login.jsx**
```javascript
Purpose: User authentication entry point
Props: None
State:
  - loading: boolean (await auth redirect)
  - error: string (error messages)
Children:
  - Google login button
  - Error message display
Behavior:
  - Auto-detects existing session
  - Redirects to Dashboard if authenticated
```

#### **Dashboard.jsx**
```javascript
Purpose: Main authenticated user interface
Props: None (checks session via useAuth)
State:
  - selectedDate: string (current date)
  - chartPeriod: 'weekly' | 'monthly' | 'yearly'
  - showLogMealModal: boolean
Children:
  - Navbar: Navigation & auth state
  - AddMeal: Meal logging form
  - DailySummary: Daily totals & meal list
  - ProteinChart: Protein visualization
  - CaloriesChart: Calories visualization
  - Date picker: Select date to view
Behavior:
  - Fetches meals & nutrition on mount
  - Filters meals by selected date
  - Auto-refresh after meal add/delete
  - Responsive layout (side-by-side on desktop)
```

### 8.2 Feature Components

#### **AddMeal.jsx**
```javascript
Purpose: Log meals manually from food database
Props:
  - userId: string (current user ID)
  - onMealAdded: function (callback after logging)
State:
  - selectedFoodId: string
  - quantity: number
  - foods: array (search results)
  - searchQuery: string
  - loading, error, success: booleans
Features:
  - Real-time food search
  - Quantity adjustment (0.5 increments)
  - Custom meal creation via modal
  - Validation & error handling
  - Success feedback
```

#### **DailySummary.jsx**
```javascript
Purpose: Display daily totals & meal list
Props:
  - meals: array (all user meals)
  - totals: object (daily aggregates)
  - onDeleteMeal: function (delete callback)
  - selectedDate: string (date to display)
Features:
  - Protein, Calories, Meal count cards
  - Meals list with nutrition breakdown
  - Delete individual meals
  - Clear All button (new feature)
  - Empty state message
Calculations:
  - Filters meals by selectedDate
  - Calculates totals from filtered meals
  - Displays as cards
```

#### **ProteinChart.jsx**
```javascript
Purpose: Visualize weekly protein intake
Props:
  - data: array (chart data points)
  - period: string (weekly/monthly/yearly)
Features:
  - Recharts LineChart
  - Responsive container
  - X-axis: dates
  - Y-axis: grams protein
  - Mobile-optimized
```

#### **CaloriesChart.jsx**
```javascript
Purpose: Visualize weekly calorie intake
Props:
  - data: array (chart data points)
  - period: string (weekly/monthly/yearly)
Features:
  - Recharts BarChart
  - Responsive container
  - X-axis: dates
  - Y-axis: calories
  - Mobile-optimized
```

#### **Navbar.jsx**
```javascript
Purpose: App header & authentication UI
Props: None
Features:
  - App title
  - User greeting (if authenticated)
  - Sign Out button
  - Sign In with Google button
  - Loading state animation
  - User email display (mobile hidden)
```

---

## 9. Security Model

### 9.1 Authentication Security

| Layer | Method | Details |
|---|---|---|
| **Client Auth** | Google OAuth 2.0 | Supabase handles OAuth flow |
| **Session** | JWT Token | Stored in browser (HttpOnly cookie option available) |
| **API Auth** | Anon Key | Supabase anon key limited to authenticated users |
| **Re-auth** | Auto-refresh | JWT refreshed automatically before expiry |

### 9.2 Data Security (Row Level Security)

```
User A                          User B
  ↓                               ↓
Session Token A              Session Token B
  ↓                               ↓
Supabase.auth.uid() = A      Supabase.auth.uid() = B
  ↓                               ↓
meal_logs WHERE user_id = A  meal_logs WHERE user_id = B
  ↓                               ↓
Can view own meals only      Can view own meals only
```

### 9.3 API Key Security

- **Public Anon Key**: Used by frontend (limited to RLS-protected queries)
- **Secret Key**: Used by admin operations only (never exposed in frontend)
- **Environment Variables**: Keys stored in `.env.local` (not committed to git)
- **Deployment**: Keys configured in Vercel environment settings

### 9.4 Authorization Rules

| Table | Operation | Allowed For | RLS Policy |
|---|---|---|---|
| **profiles** | SELECT | Own row only | auth.uid() = id |
| **profiles** | UPDATE | Own row only | auth.uid() = id |
| **foods** | SELECT | Everyone | true (public) |
| **foods** | INSERT | Authenticated users | auth.role() = 'authenticated' |
| **meal_logs** | SELECT | Own rows | user_id = auth.uid() |
| **meal_logs** | INSERT | Own rows | user_id = auth.uid() |
| **meal_logs** | UPDATE | Own rows | user_id = auth.uid() |
| **meal_logs** | DELETE | Own rows | user_id = auth.uid() |

---

## 10. Data Processing & Calculations

### 10.1 Macro Calculations

```javascript
// Protein to Calorie Percentage
Protein Calories = Protein (g) × 4 cal/g
Protein % = (Protein Calories / Total Calories) × 100

// Daily Total Calculation
Total Protein = Σ(food.protein × meal.quantity)
Total Calories = Σ(food.calories × meal.quantity)
Meal Count = Σ meals for the day

// Weekly Aggregation
Group meals by date
For each date: calculate daily totals
Return sorted by date
```

### 10.2 Date Handling

```javascript
// Convert ISO string to YYYY-MM-DD
mealDate = meal.created_at.split('T')[0]

// Day-of-week boundaries
startOfDay = new Date(date) → 00:00:00
endOfDay = new Date(date) → 23:59:59

// Date arithmetic for ranges
weekStart = today - 6 days
monthStart = today - 11 months
```

---

## 11. Environment Configuration

### 11.1 Environment Variables

```env
# .env.local
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key-here]
```

### 11.2 Vite Environment Handling

- **Prefix**: Must start with `VITE_` to be exposed to client
- **Access**: `import.meta.env.VITE_*`
- **Security**: Never prefix secret keys with `VITE_`
- **Build**: Environment variables baked into bundle

### 11.3 Development Setup

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Create Supabase project
Visit: supabase.com/dashboard

# 3. Get credentials
Project Settings → API Keys → URL & Anon Key

# 4. Enable Google OAuth
Auth → Providers → Enable Google

# 5. Install & run
npm install
npm run dev
```

---

## 12. Build & Deployment

### 12.1 Build Process

```bash
npm run build
# Runs: vite build
# Output: dist/ directory
# Optimization:
# - Minified JS/CSS
# - Code splitting
# - Asset optimization
```

### 12.2 Vercel Deployment

```
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
4. Deploy (auto on push to main)
```

### 12.3 Deployment Architecture

```
GitHub Repository
  ↓
Vercel (Frontend Build & Hosting)
  ├─ Runs: npm run build
  ├─ Deploys to: cdn.vercel.app
  └─ Auto-deploys on git push
       ↓
    ┌──────────────────────────┐
    │  Vercel Static Hosting   │
    │  (React SPA + Assets)    │
    └──────┬───────────────────┘
           │ (HTTPS requests)
           ↓
┌──────────────────────────────────┐
│  Supabase (Backend)              │
├──────────────────────────────────┤
│ ├─ Auth: Google OAuth            │
│ ├─ Database: PostgreSQL          │
│ ├─ RLS: Row Level Security       │
│ └─ API: RESTful + Real-time      │
└──────────────────────────────────┘
```

---

## 13. Performance Optimization

### 13.1 Frontend Optimizations

| Optimization | Implementation | Benefit |
|---|---|---|
| **Code Splitting** | Vite lazy loading | Smaller initial bundle |
| **CSS Tailwind** | Utility-first pruning | <50KB CSS bundle |
| **Image Optimization** | Asset optimization | Faster load times |
| **Hooks Memoization** | useCallback, useMemo | Prevent re-renders |
| **Component Splitting** | Separate components | Isolated re-renders |

### 13.2 Backend Optimizations

| Optimization | Implementation | Benefit |
|---|---|---|
| **Database Indexing** | user_id on meal_logs | Faster queries |
| **Query Selection** | Only needed columns | Smaller payloads |
| **RLS Enforcement** | Row filtering at DB | Secure & efficient |
| **Aggregation** | Server-side calculations | Less client processing |

### 13.3 Query Optimization Examples

```javascript
// Optimized: Only select needed columns
.select(`id, quantity, created_at, foods (name, protein)`)

// Join with related data in one query
.select('...').eq('user_id', userId)

// Filter early in query chain
.gte('created_at', startDate).lte('created_at', endDate)
```

---

## 14. Testing Strategy

### 14.1 Testing Setup

| Tool | Purpose |
|---|---|
| **Vitest** | Test runner (Vite-native) |
| **React Testing Library** | Component testing |
| **jsdom** | DOM simulation |
| **@testing-library/jest-dom** | DOM assertions |

### 14.2 Test Organization

```
src/
├── components/
│   ├── dashboard/
│   │   ├── DailySummary.jsx
│   │   └── DailySummary.test.jsx
│   └── ...
├── hooks/
│   ├── useMeals.js
│   └── useMeals.test.js
└── test/
    └── setup.js
```

### 14.3 Testing Patterns

```javascript
// Mock Supabase calls
vi.mock('../services/mealService', () => ({
  mealService: {
    getMealLogs: vi.fn().mockResolvedValue({
      data: mockMeals,
      error: null
    })
  }
}));

// Test component rendering
it('renders daily totals', () => {
  render(<DailySummary meals={mockMeals} />);
  expect(screen.getByText(/protein/i)).toBeInTheDocument();
});

// Test user interactions
it('calls onDeleteMeal when delete clicked', async () => {
  const handleDelete = vi.fn();
  render(<DailySummary onDeleteMeal={handleDelete} />);
  await userEvent.click(screen.getByRole('button', { name: /delete/i }));
  expect(handleDelete).toHaveBeenCalled();
});
```

### 14.3 Test Commands

```bash
npm run test              # Run tests once
npm run test:ui          # Interactive test UI
npm run test:coverage    # Coverage report
```

---

## 15. Error Handling

### 15.1 Error Types & Handling

| Error Type | Source | Handling |
|---|---|---|
| **Auth Error** | Supabase Auth | Redirect to login |
| **Network Error** | API request | Retry + user notification |
| **RLS Error** | Database policy | Log & show generic error |
| **Validation Error** | Form input | Show field-specific error |
| **Database Error** | Query failure | Retry or show error toast |

### 15.2 Error Handling Pattern

```javascript
try {
  const { data, error } = await mealService.addMeal(...);
  
  if (error) {
    // Handle RLS/DB errors
    setError(error.message);
    console.error('Failed to add meal:', error);
  } else {
    // Handle success
    setSuccess(true);
    setMeals(prev => [data, ...prev]);
  }
} catch (err) {
  // Handle unexpected errors
  setError('An unexpected error occurred');
  console.error('Unexpected error:', err);
}
```

### 15.3 User Feedback

```javascript
// Error toast/banner
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
    {error}
  </div>
)}

// Success toast
{success && (
  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">
    Meal logged successfully!
  </div>
)}

// Loading state
{loading && <div className="animate-spin">Loading...</div>}
```

---

## 16. Scalability Considerations

### 16.1 Database Scaling

| Concern | Current Approach | Future Scaling |
|---|---|---|
| **Data Growth** | Single table | Partitioning by user/date |
| **Query Performance** | Indexes on user_id | Full-text search on foods |
| **Concurrent Users** | Connection pooling (Supabase) | Read replicas |
| **Storage** | PostgreSQL unlimited | Archive old data |

### 16.2 Application Scaling

| Layer | Current | Scaling Strategy |
|---|---|---|
| **Frontend** | Single React app | Micro-frontends per feature |
| **API** | Supabase REST | GraphQL layer for complex queries |
| **Caching** | None | Redis cache for leaderboards |
| **Background Jobs** | None | Scheduled reports/notifications |

### 16.3 Horizontal Scaling Architecture

```
Load Balancer (Vercel CDN)
  ├─ Region 1: Vercel Edge
  ├─ Region 2: Vercel Edge
  └─ Region 3: Vercel Edge
         ↓
    Supabase API Gateway
         ↓
    PostgreSQL Primary (writes)
         ├─ Read Replica 1
         ├─ Read Replica 2
         └─ Read Replica 3
```

---

## 17. Future Enhancement Opportunities

### 17.1 Feature Expansions

#### **Social Features**
- Add friend system for meal sharing
- Create leaderboards for fitness goals
- Enable social comparing & challenges
- Comments on meal logs

#### **Advanced Analytics**
- BMI calculator & tracking
- Goal setting & progress tracking
- Nutrition macronutrient ratios (carbs, fats)
- Weekly/monthly reports with PDF export
- Trend analysis & predictions

#### **Integration & APIs**
- Barcode scanner (mobile app)
- Import meals from popular apps (MyFitnessPal)
- Wearable device integration (Fitbit, Apple Watch)
- Calendar view for meal history

#### **Mobile Experience**
- Progressive Web App (PWA)
- React Native mobile app
- Offline support with service workers
- Mobile-optimized photo food recognition

### 17.2 Backend Enhancements

#### **Database Improvements**
- Add meal comments/notes field
- Support food categories/tags
- Recipe support (multiple foods per meal)
- Meal templates/favorites

#### **Performance**
- Implement caching strategy (Redis)
- GraphQL API for efficient queries
- Database query optimization
- Elasticsearch for food search

#### **Features**
- Real-time sync with WebSockets
- Scheduled notifications
- Backup/export data
- Advanced filtering & search

### 17.3 Architecture Evolution

```
Current (MVP)
├─ Frontend: React SPA
├─ Backend: Supabase REST API
└─ Database: PostgreSQL

↓ (Scale to Phase 2)

Enhanced (Scale-Up)
├─ Frontend: React SPA + PWA
├─ Backend: Supabase + custom Node.js API layer
├─ Cache: Redis
├─ Database: PostgreSQL + read replicas
└─ Search: Elasticsearch

↓ (Scale to Phase 3)

Enterprise (Full-Scale)
├─ Frontend: Micro-frontends
├─ Backend: GraphQL API + microservices
├─ Cache: Distributed cache
├─ Database: Distributed PostgreSQL
├─ Search: Elasticsearch cluster
├─ Queue: Message queue (RabbitMQ)
└─ Analytics: Data warehouse
```

---

## 18. Development Workflow Reference

### 18.1 Adding a New Feature

**Step 1: Database Changes**
```sql
-- 1. Create/modify tables
ALTER TABLE meal_logs ADD COLUMN notes TEXT;

-- 2. Create/update RLS policies
CREATE POLICY "..." ON meal_logs ...;
```

**Step 2: Backend Service**
```javascript
// src/services/mealService.js
async addMealWithNotes(userId, foodId, quantity, notes) {
  return await supabase.from('meal_logs')
    .insert([{ user_id: userId, food_id: foodId, quantity, notes }])
    .select();
}
```

**Step 3: Custom Hook**
```javascript
// src/hooks/useMeals.js
const addMeal = async (foodId, quantity, notes) => {
  return await mealService.addMealWithNotes(userId, foodId, quantity, notes);
};
```

**Step 4: React Component**
```jsx
// src/components/dashboard/AddMeal.jsx
<input 
  value={notes} 
  onChange={(e) => setNotes(e.target.value)}
  placeholder="Add notes..."
/>
<button onClick={() => addMeal(foodId, quantity, notes)}>
  Log Meal
</button>
```

**Step 5: Testing**
```javascript
// Write unit tests for service method
// Write integration tests for component
// Manual testing in development
```

### 18.2 Common Development Tasks

```bash
# Start development server
npm run dev

# Check for linting errors
npm run lint

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 19. Configuration Files Reference

### 19.1 Vite Config (vite.config.js)
```javascript
export default defineConfig({
  plugins: [react()],
  // Optional: Configure proxy, build settings, etc.
});
```

### 19.2 Tailwind Config (tailwind.config.js)
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
};
```

### 19.3 PostCSS Config (postcss.config.js)
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

### 19.4 ESLint Config (.eslintrc.js)
```javascript
export default {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off'
  }
};
```

---

## 20. Key Architectural Principles

### 20.1 Design Patterns Used

| Pattern | Application | Benefit |
|---|---|---|
| **Service Layer** | Separation of concerns | Testable, reusable |
| **Custom Hooks** | Business logic extraction | Composable, shareable |
| **React Context** | Global state (Supabase) | Avoid prop drilling |
| **Compound Components** | Complex UI (modals) | Flexible, composable |
| **Error Boundary** | Error handling | Graceful degradation |

### 20.2 SOLID Principles

- **Single Responsibility**: Each service/hook has one concern
- **Open/Closed**: Components extend via props/context
- **Liskov Substitution**: Components have consistent interfaces
- **Interface Segregation**: Services export only needed methods
- **Dependency Inversion**: Components depend on hooks, not implementation

### 20.3 Core Principles

1. **Security First**: RLS enforced, no data leaks
2. **Mobile First**: Responsive from ground up
3. **Performance**: Optimize bundle & queries
4. **User Experience**: Clear feedback & error handling
5. **Maintainability**: Clear structure & conventions
6. **Testability**: Isolated, mockable services

---

## 21. Quick Reference Commands

```bash
# Setup
npm install                    # Install dependencies
npm run dev                   # Start dev server (http://localhost:5173)

# Development
npm run lint                  # Check code quality
npm run test                  # Run tests
npm run test:ui             # Interactive test UI
npm run test:coverage       # Coverage report

# Deployment
npm run build                # Build production bundle
npm run preview              # Preview production build

# Environment
cp .env.example .env.local  # Create env file
```

---

## 22. Glossary of Terms

| Term | Definition |
|---|---|
| **RLS** | Row Level Security - database-level access control |
| **JWT** | JSON Web Token - authentication token |
| **UUID** | Universally Unique Identifier - primary keys |
| **Anon Key** | Public Supabase key with limited permissions |
| **Trigger** | Database automation on specific events |
| **Service Layer** | Pattern for encapsulating business logic |
| **Custom Hook** | React hook for reusable logic |
| **Context** | React feature for global state |
| **SPA** | Single Page Application |
| **BaaS** | Backend-as-a-Service |

---

## Document Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2024-03-31 | Initial complete architecture documentation |

---

**Documentation created for: Fitness Tracker Application**  
**Last Updated: March 31, 2026**  
**Next Review: When major features are added**
