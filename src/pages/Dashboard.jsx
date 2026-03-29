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
  
  // Date and period selection
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [chartPeriod, setChartPeriod] = useState('weekly') // weekly, monthly, yearly

  const { meals, loading: mealsLoading, deleteMeal } = useMeals(userId)
  const { dailyTotals, weeklyData, monthlyData, yearlyData, loading: nutritionLoading, refreshDaily, refreshWeekly, refreshMonthly, refreshYearly } = useNutrition(userId)

  const isLoading = mealsLoading || nutritionLoading

  // Get chart data based on selected period
  const getChartData = () => {
    switch (chartPeriod) {
      case 'monthly':
        return monthlyData
      case 'yearly':
        return yearlyData
      default:
        return weeklyData
    }
  }

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
        {/* Date Selection */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <label htmlFor="selectedDate" className="text-sm font-medium text-gray-700">
                📅 View meals for:
              </label>
              <input
                type="date"
                id="selectedDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Chart Period Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">📊 Chart view:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartPeriod('weekly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    chartPeriod === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    chartPeriod === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setChartPeriod('yearly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    chartPeriod === 'yearly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
        </div>

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
                selectedDate={selectedDate}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📈 Insights</h2>

              <div className="mt-8 grid grid-cols-1 gap-6">
                <ProteinChart data={getChartData()} period={chartPeriod} />
                <CaloriesChart data={getChartData()} period={chartPeriod} />
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
