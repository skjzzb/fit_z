import { useAuth } from '../hooks/useAuth'
import { useMeals } from '../hooks/useMeals'
import { useNutrition } from '../hooks/useNutrition'
import Navbar from '../components/common/Navbar'
import AddMeal from '../components/dashboard/AddMeal'
import DailySummary from '../components/dashboard/DailySummary'
import ProteinChart from '../components/analytics/ProteinChart'
import CaloriesChart from '../components/analytics/CaloriesChart'

/**
 * Dashboard Page
 * Main dashboard for logged-in users
 */
export default function Dashboard() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const { meals, loading: mealsLoading, deleteMeal } = useMeals(userId)
  const { dailyTotals, weeklyData, loading: nutritionLoading } = useNutrition(userId)

  const isLoading = mealsLoading || nutritionLoading

  const handleDeleteMeal = async (mealId) => {
    await deleteMeal(mealId)
  }

  const handleMealAdded = () => {
    // Refresh data will happen automatically via hooks
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - left column */}
          <div className="lg:col-span-2 space-y-6">
            <AddMeal userId={userId} onMealAdded={handleMealAdded} />
            <DailySummary
              meals={meals}
              totals={dailyTotals}
              onDeleteMeal={handleDeleteMeal}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Track your daily nutrition and monitor your progress over time.</p>
                <p>Log meals to see your protein and calorie totals update in real-time.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <ProteinChart data={weeklyData} />
          <CaloriesChart data={weeklyData} />
        </div>
      </main>
    </div>
  )
}
