import { useState, useEffect } from 'react'
import mealService from '../services/mealService'

/**
 * Custom hook for meal-related operations
 */
export function useMeals(userId) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMeals = async (date = null) => {
    setLoading(true)
    setError(null)

    const { data, error } = await mealService.getMealLogs(userId, date)

    if (error) {
      setError(error.message)
    } else {
      setMeals(data)
    }

    setLoading(false)
  }

  const addMeal = async (foodId, quantity, customDate = null) => {
    setLoading(true)
    setError(null)

    const { data, error } = await mealService.addMeal(userId, foodId, quantity, customDate)

    if (error) {
      setError(error.message)
    } else {
      setMeals(prev => [data, ...prev])
    }

    setLoading(false)
    return { data, error }
  }

  const deleteMeal = async (mealId) => {
    setLoading(true)
    setError(null)

    const { error } = await mealService.deleteMeal(mealId, userId)

    if (error) {
      setError(error.message)
    } else {
      setMeals(prev => prev.filter(meal => meal.id !== mealId))
    }

    setLoading(false)
    return { error }
  }

  useEffect(() => {
    if (userId) {
      fetchMeals()
    }
  }, [userId])

  return {
    meals,
    loading,
    error,
    fetchMeals,
    addMeal,
    deleteMeal
  }
}

export default useMeals