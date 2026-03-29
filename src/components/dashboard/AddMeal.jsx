import { useState, useEffect } from 'react'
import foodService from '../../services/foodService'
import mealService from '../../services/mealService'

/**
 * AddMeal Component
 * Allows users to select food and quantity to log a meal
 */
export default function AddMeal({ userId, onMealAdded }) {
  const [selectedFoodId, setSelectedFoodId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Load foods on mount
  useEffect(() => {
    const loadFoods = async () => {
      const { data, error } = await foodService.getAllFoods()
      if (!error && data) {
        setFoods(data)
        if (data.length > 0) {
          setSelectedFoodId(data[0].id)
        }
      }
    }
    loadFoods()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFoodId || quantity <= 0) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    const { data, error } = await mealService.addMeal(
      userId,
      selectedFoodId,
      quantity
    )

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      onMealAdded?.(data)
      setQuantity(1)
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Log a Meal</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
          Meal logged successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="food" className="block text-sm font-medium text-gray-700 mb-1">
            Food
          </label>
          <select
            id="food"
            value={selectedFoodId}
            onChange={(e) => setSelectedFoodId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a food</option>
            {foods.map(food => (
              <option key={food.id} value={food.id}>
                {food.name} ({food.protein}g protein, {food.calories} cal)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (servings)
          </label>
          <input
            type="number"
            id="quantity"
            min="0.5"
            step="0.5"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedFoodId}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging...' : 'Log Meal'}
        </button>
      </form>
    </div>
  )
}
