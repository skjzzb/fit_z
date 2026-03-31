# Fitness Tracker - Development Reference Guide

**Quick daily reference for implementing features, fixing bugs, and maintaining the application.**

---

## 1. Project Quick Start

### 1.1 Getting Started (First Time Setup)

```bash
# 1. Clone/open project
cd /Users/saurabhjk/Desktop/Claude\ Projects

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Add your Supabase credentials to .env.local
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key

# 5. Start development server
npm run dev

# 6. Open in browser
# http://localhost:5173
```

### 1.2 Development Commands

```bash
npm run dev                 # Start dev server (hot reload)
npm run build              # Build for production
npm run preview            # Test production build locally
npm run lint               # Check code quality
npm run test               # Run tests
npm run test:ui            # Interactive test UI
npm run test:coverage      # Show coverage report
```

---

## 2. File Organization & Patterns

### 2.1 When to Create Files

| Scenario | File Type | Location |
|----------|-----------|----------|
| UI Component | `.jsx` | `src/components/[category]/ComponentName.jsx` |
| Business Logic | `.js` | `src/hooks/useName.js` |
| Database Access | `.js` | `src/services/nameService.js` |
| Utility Function | `.js` | `src/utils/utility.js` |
| Page | `.jsx` | `src/pages/PageName.jsx` |
| Global State | `.jsx` | `src/contexts/ContextName.jsx` |

### 2.2 Naming Conventions

```javascript
// Components: PascalCase
AddMeal.jsx
DailySummary.jsx
ProteinChart.jsx

// Hooks: camelCase with 'use' prefix
useAuth.js
useMeals.js
useNutrition.js

// Services: camelCase with 'Service' suffix
mealService.js
foodService.js
profileService.js

// Utils: camelCase
formatters.js
validators.js

// Constants: UPPER_SNAKE_CASE
const MAX_QUANTITY = 100
const API_TIMEOUT = 5000

// React props: camelCase
<AddMeal userId={userId} onMealAdded={handleMeal} />
```

### 2.3 Import Order Pattern

```javascript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. Third-party libraries
import { LineChart } from 'recharts'

// 3. Local services
import mealService from '../../services/mealService'

// 4. Local hooks
import { useMeals } from '../../hooks/useMeals'

// 5. Local components
import DailySummary from '../dashboard/DailySummary'

// 6. Utils
import { formatDate } from '../../utils/formatters'
```

---

## 3. Adding a New Feature: Step-by-Step

### 3.1 Feature: Quick Add Recent Meals

**Scenario:** User wants quick button to re-log a meal from recent history

#### Step 1: Design the Data Model
```javascript
// Question: What data do we need?
// Answer: Display of recent meals with quick-add button

// No database changes needed (use existing meal_logs)
```

#### Step 2: Update Service (if needed)
```javascript
// src/services/mealService.js
async getRecentMeals(userId, limit = 5) {
  // Get most recent unique foods
  const { data, error } = await supabase
    .from('meal_logs')
    .select('food_id, foods(id, name, protein, calories)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit * 3) // Get more to find uniques
  
  if (error) return { data: [], error }
  
  // Deduplicate by food_id
  const unique = []
  const seen = new Set()
  data.forEach(log => {
    if (!seen.has(log.food_id)) {
      seen.add(log.food_id)
      unique.push(log)
    }
  })
  return { data: unique.slice(0, limit), error: null }
}
```

#### Step 3: Update Hook
```javascript
// src/hooks/useMeals.js - Add to existing hook
const getRecent = async () => {
  const { data } = await mealService.getRecentMeals(userId, 5)
  return data
}

export function useMeals(userId) {
  // ... existing code ...
  return {
    // ... existing returns ...
    getRecent
  }
}
```

#### Step 4: Add Component
```jsx
// src/components/dashboard/RecentMeals.jsx
import { useState, useEffect } from 'react'
import { useMeals } from '../../hooks/useMeals'

export default function RecentMeals({ userId, onQuickAdd }) {
  const [recent, setRecent] = useState([])
  const { getRecent } = useMeals(userId)

  useEffect(() => {
    const loadRecent = async () => {
      const data = await getRecent()
      setRecent(data)
    }
    loadRecent()
  }, [userId])

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-sm font-semibold mb-3">Recent Foods</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {recent.map(item => (
          <button
            key={item.food_id}
            onClick={() => onQuickAdd(item.food_id, 1)}
            className="flex-shrink-0 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition"
          >
            {item.foods.name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

#### Step 5: Integrate into Parent Component
```jsx
// src/components/dashboard/AddMeal.jsx
import RecentMeals from './RecentMeals'

export default function AddMeal({ userId, onMealAdded }) {
  // ... existing state & methods ...

  const handleQuickAdd = async (foodId, quantity) => {
    await addMeal(foodId, quantity)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Log a Meal</h2>
      
      <RecentMeals userId={userId} onQuickAdd={handleQuickAdd} />
      
      {/* ... rest of form ... */}
    </div>
  )
}
```

#### Step 6: Test
```javascript
// src/components/dashboard/__tests__/RecentMeals.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import RecentMeals from '../RecentMeals'
import * as mealService from '../../../services/mealService'

vi.mock('../../../services/mealService')

describe('RecentMeals', () => {
  it('displays recent foods', async () => {
    mealService.getRecentMeals.mockResolvedValue({
      data: [{ food_id: 1, foods: { name: 'Chicken' } }],
      error: null
    })

    render(<RecentMeals userId="123" onQuickAdd={() => {}} />)
    expect(await screen.findByText('Chicken')).toBeInTheDocument()
  })

  it('calls onQuickAdd when button clicked', async () => {
    const handleQuickAdd = vi.fn()
    // ... setup ...
    fireEvent.click(screen.getByText('Chicken'))
    expect(handleQuickAdd).toHaveBeenCalledWith(1, 1)
  })
})
```

---

## 4. Common Development Tasks

### 4.1 Modifying a Component

**Example: Change DailySummary layout**

```jsx
// Current: 3-column layout
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

// Change to: 2-column on mobile, 3 on desktop
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

// Then test different screen sizes:
// - iPhone SE: 375px (should be 2 cols)
// - iPad: 768px (should be 3 cols)
// - Desktop: 1280px (should be 3 cols)
```

### 4.2 Fixing a Bug

**Example: "Clear All" button not showing on empty meals**

```javascript
// Issue: Button hidden when no meals
// Current code: {filteredMeals.length > 0 && <button>}

// Debug:
console.log('filteredMeals:', filteredMeals)
console.log('length:', filteredMeals.length)
console.log('shouldShow:', filteredMeals.length > 0)

// Fix: Ensure meals are being filtered correctly
const filteredMeals = meals.filter(meal => {
  const mealDate = meal.created_at.split('T')[0]
  console.log(`Checking meal ${meal.id}: ${mealDate} vs ${selectedDate}`)
  return mealDate === selectedDate
})
```

### 4.3 Adding an API Call

**Pattern to follow:**

```javascript
// 1. Add to service
async fetchUserGoals(userId) {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
  return { data, error }
}

// 2. Create/update hook
export function useGoals(userId) {
  const [goals, setGoals] = useState([])
  
  const fetchGoals = async () => {
    const { data, error } = await goalService.fetchUserGoals(userId)
    if (!error) setGoals(data)
  }
  
  useEffect(() => {
    if (userId) fetchGoals()
  }, [userId])
  
  return { goals }
}

// 3. Use in component
const { goals } = useGoals(userId)
{goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
```

### 4.4 Adding Styling

**Tailwind patterns:**

```jsx
// Button: Blue primary
className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

// Button: Red destructive (delete)
className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"

// Button: Green secondary
className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"

// Card: White with shadow
className="bg-white rounded-lg shadow p-6"

// Input: Form field
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

// Badge: Small label
className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"

// Alert: Error
className="p-4 bg-red-50 border border-red-200 text-red-700 rounded"

// Alert: Success
className="p-4 bg-green-50 border border-green-200 text-green-700 rounded"

// Mobile responsive
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
// 1 column on mobile, 2 on tablet, 3 on desktop
```

### 4.5 Handling Errors

**Error handling pattern:**

```javascript
try {
  const { data, error } = await mealService.addMeal(userId, foodId, quantity)
  
  if (error) {
    // Specific error
    console.error('Error adding meal:', error.message)
    setError(`Failed to log meal: ${error.message}`)
    return
  }
  
  // Success
  setSuccess(true)
  onMealAdded(data)
  
  // Clear form
  setTimeout(() => setSuccess(false), 3000)
  
} catch (err) {
  // Unexpected error
  console.error('Unexpected error:', err)
  setError('An unexpected error occurred. Please try again.')
}
```

---

## 5. Database Operations

### 5.1 Common RLS Patterns

**Allow user to see their own data:**
```sql
CREATE POLICY "Users can view own meals"
  ON meal_logs
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Allow authenticated users to read public data:**
```sql
CREATE POLICY "Everyone can view foods"
  ON foods
  FOR SELECT
  USING (true);
```

**Allow authenticated users to insert:**
```sql
CREATE POLICY "Users can create foods"
  ON foods
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

### 5.2 Adding a New Table

```sql
-- 1. Create table
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  daily_protein_goal NUMERIC,
  daily_calorie_goal NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 3. Create policy
CREATE POLICY "Users manage own preferences"
  ON user_preferences
  USING (auth.uid() = user_id);

-- 4. Test
SELECT * FROM user_preferences WHERE user_id = auth.uid();
```

### 5.3 Querying with Joins

```javascript
// Query meal_logs with related food data
const { data } = await supabase
  .from('meal_logs')
  .select(`
    id,
    quantity,
    created_at,
    foods (
      id,
      name,
      protein,
      calories
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Result structure:
// {
//   id: '123',
//   quantity: 2,
//   created_at: '2024-03-31T...',
//   foods: { id: '456', name: 'Chicken', protein: 25, calories: 165 }
// }
```

---

## 6. React Patterns & Anti-Patterns

### 6.1 Correct Patterns

```jsx
// ✅ Manage form state with useState + single handler
const [form, setForm] = useState({ name: '', protein: '' })
const handleChange = (e) => {
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
}

// ✅ Fetch data in useEffect with dependency array
useEffect(() => {
  if (userId) fetchData(userId)
}, [userId])

// ✅ Conditional rendering with early return
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
return <Content data={data} />

// ✅ Use promises with async/await
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const { data, error } = await service.create(...)
    if (error) throw error
    setSuccess(true)
  } catch (err) {
    setError(err.message)
  }
}
```

### 6.2 Anti-Patterns to Avoid

```jsx
// ❌ Don't fetch in component without useEffect
const Component = () => {
  const data = supabase.from('meals').select() // Bad!
  return <div>{data}</div>
}

// ✅ Do this instead
const Component = () => {
  const [data, setData] = useState(null)
  useEffect(() => {
    supabase.from('meals').select().then(r => setData(r.data))
  }, [])
  return <div>{data}</div>
}

// ❌ Don't create infinite loops
useEffect(() => {
  setData(newData) // Triggers re-render, runs effect again, infinite loop!
})

// ✅ Add dependency array
useEffect(() => {
  setData(newData)
}, [dependency])

// ❌ Don't directly mutate state
const newMeals = meals
newMeals.push(newMeal) // Directly mutates, React won't detect
setMeals(newMeals)

// ✅ Create new array
setMeals(prev => [...prev, newMeal])

// ❌ Don't pass inline objects as dependencies
useEffect(() => {
  // runs every render because {} !== {} even if contents same
}, [{ userId }])

// ✅ Pass primitive values
useEffect(() => {
  // runs only when userId changes
}, [userId])
```

---

## 7. Performance Optimization Tips

### 7.1 Component Optimization

```jsx
// ❌ Render inline function (recreated each render)
<button onClick={() => handleDelete(id)}>Delete</button>

// ✅ Use useCallback
const handleDelete = useCallback((id) => {
  deleteMeal(id)
}, [deleteMeal])
<button onClick={() => handleDelete(id)}>Delete</button>

// ❌ Inline object prop (new object each render)
<Chart options={{ animation: true }} />

// ✅ Memoize or move outside component
const chartOptions = useMemo(() => ({ animation: true }), [])
<Chart options={chartOptions} />
```

### 7.2 Query Optimization

```javascript
// ❌ Select all columns when you only need some
.select('*') // Gets all 50 columns

// ✅ Select only needed columns
.select('id, quantity, created_at, foods(name, protein)')

// ❌ No filter, load everything
.from('meal_logs').select()

// ✅ Filter early in query
.from('meal_logs')
  .select()
  .eq('user_id', userId)
  .gte('created_at', startDate)

// ❌ Get 1000 rows for pagination
.select().limit(1000)

// ✅ Paginate properly
.select().range(0, 20) // First page
.select().range(20, 40) // Second page
```

### 7.3 Bundle Size

```javascript
// Check bundle size
npm run build
// Look at Terminal output for size

// Optimize imports (tree-shaking)
// ❌ Import entire library
import * as recharts from 'recharts'

// ✅ Import only what you need
import { LineChart, Line } from 'recharts'
```

---

## 8. Debugging Guide

### 8.1 Common Debugging Scenarios

**Problem: State not updating**
```jsx
// Debug: Log state changes
const [meals, setMeals] = useState([])

const addMeal = (meal) => {
  console.log('Before:', meals)
  setMeals(prev => {
    const updated = [...prev, meal]
    console.log('After:', updated)
    return updated
  })
}

// Check: Did you mutate array directly?
// No: setMeals([...meals, meal]) ✅
// Yes: meals.push(meal); setMeals(meals) ❌
```

**Problem: API call not made**
```jsx
// Debug: Check useEffect runs
useEffect(() => {
  console.log('Effect running with userId:', userId)
  if (userId) {
    fetchData()
  }
}, [userId])

// Check: Is userId undefined?
console.log('Is userId undefined?', userId === undefined)

// Check: Is dependency array correct?
// Array should include all needed values
```

**Problem: RLS denying access**
```javascript
// Check: Is user authenticated?
const session = await supabase.auth.getSession()
console.log('Session:', session)

// Check: Does RLS policy match?
// Policy should allow the operation you're attempting

// Check: Is user_id correct token?
// Use auth.uid() not some other id in policy
```

### 8.2 Browser DevTools Tips

```javascript
// React DevTools
// - Highlight renders
// - Inspect component props/state
// - Trace re-renders

// Network tab
// - Check API response times
// - Look for failed requests
// - Verify response data

// Console
// - log important values
// - Catch errors early
// - Monitor for warnings

// Performance tab
// - Measure render time
// - Identify slow operations
// - Check overall FPS
```

### 8.3 Useful Debug Code

```javascript
// Add to component to track renders
useEffect(() => {
  console.log('Component rendered', performance.now())
})

// Monitor API calls
const { data, error } = await supabase.from('meals').select()
console.log('API Response:', { data, error, timestamp: new Date() })

// Track state updates
const [meals, setMeals] = useState([])
useEffect(() => {
  console.table(meals) // Show as table
}, [meals])

// Check if dependency changed
useEffect(() => {
  console.log('userId changed to:', userId)
}, [userId])

// Monitor performance
console.time('fetchData')
await fetchData()
console.timeEnd('fetchData') // Logs time taken
```

---

## 9. Git Workflow

### 9.1 Common Git Commands

```bash
# Check status
git status

# Add changes
git add .                 # All files
git add src/              # Specific folder
git add file.js           # Specific file

# Commit
git commit -m "Add favorite foods feature"

# Create branch for feature
git checkout -b feature/favorites

# Switch branches
git checkout main

# Push to GitHub
git push origin feature/favorites

# Create pull request (on GitHub)

# Merge to main
git checkout main
git merge feature/favorites
git push origin main
```

### 9.2 Commit Message Convention

```
# Format
<type>(<scope>): <description>

# Examples
feat(AddMeal): add recent meals quick-add button
fix(DailySummary): clear all button not showing
docs(README): update installation steps
refactor(mealService): optimize daily totals query
test(useMeals): add tests for deleteMeal
perf(Charts): optimize re-renders with useMemo

# Types
feat     - New feature
fix      - Bug fix
docs     - Documentation
refactor - Code refactoring
test     - Tests
perf     - Performance
chore    - Build, dependencies
```

---

## 10. Testing Quick Reference

### 10.1 Testing Structure

```javascript
// Basic test structure
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should do something', () => {
    // Arrange
    const props = { }
    
    // Act
    render(<Component {...props} />)
    
    // Assert
    expect(screen.getByText('something')).toBeInTheDocument()
  })
})
```

### 10.2 Common Assertions

```javascript
// DOM assertions
expect(screen.getByText('Hello')).toBeInTheDocument()
expect(screen.getByRole('button')).toBeVisible()
expect(screen.getByTestId('element')).toHaveClass('active')
expect(input).toHaveValue('text')

// State assertions
expect(state).toBe(expectedValue)
expect(array).toHaveLength(3)
expect(object).toEqual({ key: 'value' })
expect(function).toHaveBeenCalled()
```

### 10.3 Common Mocks

```javascript
// Mock service
vi.mock('../services/mealService', () => ({
  mealService: {
    addMeal: vi.fn().mockResolvedValue({
      data: newMeal,
      error: null
    })
  }
}))

// Mock hook
vi.mock('../hooks/useMeals', () => ({
  useMeals: vi.fn(() => ({
    meals: [],
    addMeal: vi.fn()
  }))
}))

// Verify mock was called
expect(mealService.addMeal).toHaveBeenCalledWith(userId, foodId, quantity)
```

---

## 11. Supabase Quick Commands

### 11.1 Check Supabase Status

```javascript
// In browser console or component
import { supabase } from './services/supabase'

// Check authentication
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)

// Test database connection
const { data, error } = await supabase.from('foods').select().limit(1)
console.log('DB test:', { data, error })

// Check RLS policy
const { data, error } = await supabase
  .from('meal_logs')
  .select()
// If returns data: RLS allows read
// If error: RLS denying access
```

### 11.2 Direct Supabase Dashboard Actions

1. **Check RLS Policies:**
   - Go to Supabase Dashboard
   - Table Editor
   - Select table
   - Click "RLS" tab
   - Verify policies exist

2. **View Data:**
   - Supabase Dashboard
   - SQL Editor
   - Run query: `SELECT * FROM meal_logs LIMIT 10`

3. **Check Auth Users:**
   - Authentication → Users
   - See all registered users
   - Check their metadata

4. **Monitor Real-time:**
   - Database → Subscriptions
   - See active subscriptions

---

## 12. Deployment Checklist

### 12.1 Before Deploying

- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run test` (all tests pass)
- [ ] Run `npm run build` (no warnings)
- [ ] Test production build: `npm run preview`
- [ ] Check Lighthouse score (>90)
- [ ] Test on mobile/tablet
- [ ] Verify environment variables configured
- [ ] Check for console errors/warnings
- [ ] Test critical user flows

### 12.2 Deploy Steps

```bash
# 1. Commit changes
git add .
git commit -m "Prepare for deployment"

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys (check dashboard)

# 4. Test production build
# Visit: your-app.vercel.app

# 5. Verify features work:
# - Login with Google
# - Add meal
# - Delete meal
# - View charts
```

### 12.3 Rollback if Needed

```bash
# Vercel dashboard
# Deployments tab
# Click "Redeploy" on previous version
```

---

## 13. Useful Resources

### 13.1 Documentation Links

- **React:** https://react.dev
- **Vite:** https://vitejs.dev
- **Tailwind:** https://tailwindcss.com
- **Supabase:** https://supabase.com/docs
- **Recharts:** https://recharts.org
- **Vitest:** https://vitest.dev
- **React Testing Library:** https://testing-library.com/react

### 13.2 Keyboard Shortcuts

```
VS Code:
Ctrl/Cmd + P          # Quick file open
Ctrl/Cmd + /          # Toggle comment
Ctrl/Cmd + D          # Select word
Ctrl/Cmd + F          # Find in file
Ctrl/Cmd + Shift + F  # Find in project
Ctrl/Cmd + G          # Go to line
F2                    # Rename symbol
```

---

## 14. Team Communication

### 14.1 Issue Template

When reporting bugs, include:
```
Title: Clear, concise description

Description:
- What I was trying to do
- What happened instead
- What I expected to happen

Steps to Reproduce:
1. ...
2. ...
3. ...

Environment:
- Browser: Chrome 90
- OS: macOS 12
- Screen size: 1920x1080

Screenshots/Logs:
[Paste relevant logs or screenshots]
```

### 14.2 PR Template

```
## What does this PR do?
Brief description of changes

## Changes
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Tested locally
- [ ] All tests passing
- [ ] No console errors
- [ ] Responsive on mobile

## Screenshots
[If applicable, add screenshots]

## Related Issues
Closes #123
```

---

## 15. Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **npm install fails** | Delete node_modules & package-lock.json, run npm install again |
| **Port 5173 in use** | `lsof -i :5173` then `kill -9 <PID>` or change port in vite.config.js |
| **Tailwind not working** | Restart dev server, check content paths in tailwind.config.js |
| **Environment variables not loading** | Must run dev after creating .env.local, prefix with VITE_ |
| **Supabase 401 error** | Check auth.uid() in RLS policies, verify user is logged in |
| **Tests failing** | Run `npm run test -- --reporter=verbose` for details |
| **Build failing** | Check for TypeScript/ESLint errors: `npm run lint` |
| **Hot reload not working** | Check vite.config.js has react() plugin |

---

## Summary

This reference guide provides:
✅ Setup instructions  
✅ Development commands  
✅ File naming conventions  
✅ Step-by-step feature implementation  
✅ Common development tasks  
✅ Database operations  
✅ React patterns & anti-patterns  
✅ Performance tips  
✅ Debugging guide  
✅ Git workflow  
✅ Testing reference  
✅ Supabase commands  
✅ Deployment checklist  
✅ Troubleshooting guide  

Keep this open while developing for quick reference!
