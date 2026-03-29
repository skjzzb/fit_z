# Fitness Tracker

A full-stack fitness tracking application built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Authentication**: Google OAuth via Supabase
- **Meal Logging**: Track daily meals and nutritional intake
- **Food Search**: Search and filter foods from the database while logging meals
- **Dashboard**: Real-time protein and calorie totals
- **Data Visualization**: Weekly charts using Recharts
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Google OAuth credentials

### Setup

1. **Clone and install dependencies**

   ```bash
   npm install
   ```

2. **Configure Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Enable Google OAuth in Authentication > Providers
   - Create the database tables using SQL below
   - Copy your project URL and anon key to `.env.local`

3. **Initialize environment**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

### Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create foods table (public food database)
CREATE TABLE foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  protein NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create meal_logs table
CREATE TABLE meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  quantity NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Profiles: Users can read and update their own profile only
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Foods: Public read access (anyone can view foods)
CREATE POLICY "Foods are viewable by all" ON foods
  FOR SELECT USING (true);

-- Allow authenticated users to create foods (for custom meals)
CREATE POLICY "Users can create foods" ON foods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Meal logs: Users can only access their own meals
CREATE POLICY "Users can CRUD own meal_logs" ON meal_logs
  USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:ui` | Run tests with UI |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/
│   ├── analytics/    # Chart components
│   ├── common/       # Shared components (Navbar)
│   └── dashboard/    # Dashboard components (AddMeal, DailySummary)
├── contexts/         # React contexts (Supabase)
├── hooks/            # Custom hooks (useAuth, useMeals, useNutrition)
├── pages/            # Page components (Login, Dashboard)
├── services/         # API service layer (Supabase, foodService, mealService, profileService)
├── utils/            # Utility functions
└── test/             # Test setup and fixtures
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Future Enhancements

- Friend system and profile comparison
- Food database expansion
- Custom food creation
- Export data functionality
- Mobile app with React Native
- Barcode scanner integration

## Development Notes

- Mobile-first responsive design
- Row Level Security (RLS) enforced on all tables
- All user mutations use Supabase service role where appropriate
- Custom hooks for separation of concerns
- Recharts for data visualization
- Tailwind CSS for utility-first styling

## License

MIT
