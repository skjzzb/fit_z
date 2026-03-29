import { useState } from 'react'
import foodService from '../../services/foodService'
import { useMeals } from '../../hooks/useMeals'

/**
 * AddCustomMealModal Component
 * Popup modal to create and log a custom meal
 */
export default function AddCustomMealModal({ userId, isOpen, onClose, onMealAdded }) {
  const [customMeal, setCustomMeal] = useState({
    name: '',
    protein: '',
    calories: '',
    weight: 1
  })
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { addMeal } = useMeals(userId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customMeal.name || !customMeal.protein || !customMeal.calories || customMeal.weight <= 0) {
      setError('Please fill in all fields with valid values')
      return
    }

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
      const fullDate = new Date(mealDate)
      const { data, error } = await addMeal(foodData.id, customMeal.weight, fullDate)

      if (error) {
        setError(error)
      } else {
        setSuccess(true)
        onMealAdded?.(data)
        // Reset form and close
        setTimeout(() => {
          setCustomMeal({ name: '', protein: '', calories: '', weight: 1 })
          setMealDate(new Date().toISOString().split('T')[0])
          onClose()
        }, 1500)
      }
    } catch (err) {
      setError('Failed to add custom meal')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Add Custom Meal</h2>
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
              ✓ Custom meal added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection */}
            <div>
              <label htmlFor="customMealDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="customMealDate"
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Meal Name */}
            <div>
              <label htmlFor="custom-name" className="block text-sm font-medium text-gray-700 mb-1">
                Meal Name
              </label>
              <input
                type="text"
                id="custom-name"
                value={customMeal.name}
                onChange={(e) => setCustomMeal(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Homemade Pasta"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Protein */}
            <div>
              <label htmlFor="custom-protein" className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                id="custom-protein"
                min="0"
                value={customMeal.protein}
                onChange={(e) => setCustomMeal(prev => ({ ...prev, protein: e.target.value }))}
                placeholder="Enter protein amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Calories */}
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
                placeholder="Enter calorie amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="custom-weight" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (g/servings)
              </label>
              <input
                type="number"
                id="custom-weight"
                min="0.1"
                step="0.1"
                value={customMeal.weight}
                onChange={(e) => setCustomMeal(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                placeholder="Enter quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                disabled={loading}
                className="flex-1 py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Meal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
