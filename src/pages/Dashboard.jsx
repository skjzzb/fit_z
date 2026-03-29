import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useMeals } from '../hooks/useMeals'
import { useNutrition } from '../hooks/useNutrition'
import Navbar from '../components/common/Navbar'
import DailySummary from '../components/dashboard/DailySummary'
import ProteinChart from '../components/analytics/ProteinChart'
import CaloriesChart from '../components/analytics/CaloriesChart'
import LogMealModal from '../components/dashboard/LogMealModal'
import AddCustomMealModal from '../components/dashboard/AddCustomMealModal'

/**
 * Dashboard Page
 * Main dashboard for logged-in users
 */
export default function Dashboard() {
  const { session } = useAuth()
  const userId = session?.user?.id
  
  // Modal states
  const [showLogMealModal, setShowLogMealModal] = useState(false)
  const [showCustomMealModal, setShowCustomMealModal] = useState(false)

  const { meals, loading: mealsLoading, deleteMeal } = useMeals(userId)
  const { dailyTotals, weeklyData, loading: nutritionLoading, refreshDaily } = useNutrition(userId)

  const isLoading = mealsLoading || nutritionLoading

  const handleDeleteMeal = async (mealId) => {
    await deleteMeal(mealId)
    // Refresh nutrition data after deleting a meal
    refreshDaily()
  }

  const handleMealAdded = () => {
    // Refresh nutrition data when a meal is added
    refreshDaily()
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
            {/* Meal Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogMealModal(true)}
                className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors"
              >
                📝 Log Meal
              </button>
              <button
                onClick={() => setShowCustomMealModal(true)}
                className="flex-1 py-3 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm transition-colors"
              >
                ➕ Add Custom Meal
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <DailySummary
                meals={meals}
                totals={dailyTotals}
                onDeleteMeal={handleDeleteMeal}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
              {/* <div className="space-y-3 text-sm text-gray-600">
                <p>Track your daily nutrition and monitor your progress over time.</p>
                <p>Log meals to see your protein and calorie totals update in real-time.</p>
              </div> */}

              <div className="mt-8 grid grid-cols-1 gap-6">
                <ProteinChart data={weeklyData} />
                <CaloriesChart data={weeklyData} />
              </div>
            </div>
          </div>



        </div>
      </main>

      {/* Modals */}
      <LogMealModal
        userId={userId}
        isOpen={showLogMealModal}
        onClose={() => setShowLogMealModal(false)}
        onMealAdded={handleMealAdded}
      />

      <AddCustomMealModal
        userId={userId}
        isOpen={showCustomMealModal}
        onClose={() => setShowCustomMealModal(false)}
        onMealAdded={handleMealAdded}
      />
    </div>
  )
}
