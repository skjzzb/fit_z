import { useState, useEffect } from 'react'
import foodService from '../../services/foodService'
import { useMeals } from '../../hooks/useMeals'

/**
 * AddMeal Component
 * Allows users to select food and quantity to log a meal, or add custom meals
 */
export default function AddMeal({ userId, onMealAdded }) {
  const [selectedFoodId, setSelectedFoodId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [foods, setFoods] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Custom meal modal state
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customMeal, setCustomMeal] = useState({
    name: '',
    protein: '',
    calories: '',
    weight: 0
  })

  const { addMeal } = useMeals(userId)

  // Load foods on mount or when search changes
  useEffect(() => {
    const loadFoods = async () => {
      setLoading(true)
      const { data, error } = searchQuery.trim()
        ? await foodService.searchFoods(searchQuery)
        : await foodService.getAllFoods()

      if (!error && data) {
        setFoods(data)
        if (data.length > 0 && !selectedFoodId) {
          setSelectedFoodId(data[0].id)
        }
      }
      setLoading(false)
    }
    loadFoods()
  }, [searchQuery])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFoodId || quantity <= 0) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    const { data, error } = await addMeal(selectedFoodId, quantity)

    if (error) {
      setError(error)
    } else {
      setSuccess(true)
      onMealAdded?.(data)
      setQuantity(1)
    }

    setLoading(false)
  }

  const handleCustomMealSubmit = async (e) => {
    e.preventDefault()
    if (!customMeal.name || !customMeal.protein || !customMeal.calories || customMeal.weight <= 0) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // First create the custom food
      const { data: foodData, error: foodError } = await foodService.createFood({
        name: customMeal.name,
        protein: parseFloat(customMeal.protein),
        calories: parseFloat(customMeal.calories)
      })

      if (foodError) {
        setError(foodError)
        setLoading(false)
        return
      }

      // Then log the meal
      const { data, error } = await addMeal(foodData.id, customMeal.weight)

      if (error) {
        setError(error)
      } else {
        setSuccess(true)
        onMealAdded?.(data)
        // Reset form
        setCustomMeal({ name: '', protein: '', calories: '', weight: 1 })
        setShowCustomModal(false)
      }
    } catch (err) {
      setError('Failed to add custom meal')
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Log a Meal</h2>
        <button
          onClick={() => setShowCustomModal(true)}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Add Custom Meal
        </button>
      </div>

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
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Foods
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search foods..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="food" className="block text-sm font-medium text-gray-700 mb-1">
            Food
          </label>
          {loading ? (
            <div className="w-full px-3 py-2 text-gray-500">Loading foods...</div>
          ) : foods.length === 0 ? (
            <div className="w-full px-3 py-2 text-gray-500">No foods found</div>
          ) : (
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
          )}
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

      {/* Custom Meal Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Custom Meal</h3>
            </div>
            <form onSubmit={handleCustomMealSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="custom-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="custom-name"
                  value={customMeal.name}
                  onChange={(e) => setCustomMeal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="custom-protein" className="block text-sm font-medium text-gray-700 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  id="custom-protein"
                  min="0"
                  step="0.1"
                  value={customMeal.protein}
                  onChange={(e) => setCustomMeal(prev => ({ ...prev, protein: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="custom-calories" className="block text-sm font-medium text-gray-700 mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  id="custom-calories"
                  min="0"
                  value={customMeal.calories}
                  onChange={(e) => setCustomMeal(prev => ({ ...prev, calories: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="custom-weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (g)
                </label>
                <input
                  type="number"
                  id="custom-weight"
                  min="0.1"
                  step="0.1"
                  value={customMeal.weight}
                  onChange={(e) => setCustomMeal(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
