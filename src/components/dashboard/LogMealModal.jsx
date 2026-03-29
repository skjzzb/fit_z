import { useState, useEffect } from 'react'
import foodService from '../../services/foodService'
import { useMeals } from '../../hooks/useMeals'

/**
 * LogMealModal Component
 * Popup modal to log meals with food search and date selection
 */
export default function LogMealModal({ userId, isOpen, onClose, onMealAdded }) {
  const [selectedFoodId, setSelectedFoodId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0])
  const [foods, setFoods] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { addMeal } = useMeals(userId)

  // Load foods on mount or when search changes
  useEffect(() => {
    if (!isOpen) return

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
  }, [searchQuery, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFoodId || quantity <= 0) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Get the meal date with time
      const fullDate = new Date(mealDate)
      
      // Note: The current addMeal function doesn't support custom dates
      // You may need to update mealService.addMeal to accept a date parameter
      const { data, error } = await addMeal(selectedFoodId, quantity, fullDate)

      if (error) {
        setError(error)
      } else {
        setSuccess(true)
        onMealAdded?.(data)
        // Reset form
        setTimeout(() => {
          setQuantity(1)
          setSearchQuery('')
          setSelectedFoodId('')
          setMealDate(new Date().toISOString().split('T')[0])
          onClose()
        }, 1500)
      }
    } catch (err) {
      setError('Failed to log meal')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Log a Meal</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              ✓ Meal logged successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection */}
            <div>
              <label htmlFor="mealDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="mealDate"
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Search Foods */}
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

            {/* Food Selection */}
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

            {/* Quantity */}
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

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFoodId}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging...' : 'Log Meal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
