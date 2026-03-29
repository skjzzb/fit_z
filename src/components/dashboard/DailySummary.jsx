import { formatDate } from '../../utils/formatters'

/**
 * DailySummary Component
 * Shows meals and totals for selected date (defaults to today)
 */
export default function DailySummary({ meals, totals, onDeleteMeal, selectedDate }) {
  // Filter meals for the selected date
  // Extract date directly from created_at string to avoid timezone issues
  const filteredMeals = meals.filter(meal => {
    // Get the date portion directly from the ISO string (YYYY-MM-DD)
    const mealDate = meal.created_at.split('T')[0]
    return mealDate === selectedDate
  })

  // Calculate totals for selected date
  const selectedDateTotals = {
    totalProtein: filteredMeals.reduce((sum, meal) => sum + (meal.foods.protein * meal.quantity), 0),
    totalCalories: filteredMeals.reduce((sum, meal) => sum + (meal.foods.calories * meal.quantity), 0),
    mealCount: filteredMeals.length
  }

  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })

  return (
    <div className="space-y-6">
      {/* Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 font-medium">Protein</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">
            {Math.round(selectedDateTotals.totalProtein * 10) / 10}g
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 font-medium">Calories</div>
          <div className="text-3xl font-bold text-green-600 mt-1">
            {Math.round(selectedDateTotals.totalCalories)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 font-medium">Meals Logged</div>
          <div className="text-3xl font-bold text-orange-600 mt-1">
            {selectedDateTotals.mealCount}
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Meals on {displayDate}</h3>
        </div>

        {filteredMeals.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No meals logged on this date. Start tracking your nutrition!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredMeals.map(meal => (
              <li key={meal.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{meal.foods.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(meal.created_at)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{meal.quantity}</span> serving(s) •
                    <span className="text-blue-600 font-medium ml-1">{meal.foods.protein * meal.quantity}g protein</span>
                    <span className="text-green-600 font-medium ml-1">{meal.foods.calories * meal.quantity} cal</span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  className="ml-4 text-red-600 hover:text-red-800 p-2"
                  title="Delete meal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}