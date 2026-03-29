import { formatDate } from '../../utils/formatters'

/**
 * DailySummary Component
 * Shows today's meals and totals
 */
export default function DailySummary({ meals, totals, onDeleteMeal }) {
  return (
    <div className="space-y-6">
      {/* Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 font-medium">Protein Today</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">
            {totals.totalProtein}g
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 font-medium">Calories Today</div>
          <div className="text-3xl font-bold text-green-600 mt-1">
            {totals.totalCalories}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 font-medium">Meals Logged</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">
            {totals.mealCount}
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Today's Meals</h3>
        </div>

        {meals.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No meals logged today. Start tracking your nutrition!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {meals.map(meal => (
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