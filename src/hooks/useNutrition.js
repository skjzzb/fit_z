import { useState, useEffect } from 'react'
import mealService from '../services/mealService'

/**
 * Custom hook for nutrition totals and charts
 */
export function useNutrition(userId) {
  const [dailyTotals, setDailyTotals] = useState({
    totalProtein: 0,
    totalCalories: 0,
    mealCount: 0
  })
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchDailyTotals = async (date = new Date()) => {
    setLoading(true)
    const totals = await mealService.getDailyTotals(userId, date)
    setDailyTotals(totals)
    setLoading(false)
  }

  const fetchWeeklyData = async () => {
    setLoading(true)
    const data = await mealService.getWeeklyTotals(userId)
    setWeeklyData(data)
    setLoading(false)
  }

  useEffect(() => {
    if (userId) {
      fetchDailyTotals()
      fetchWeeklyData()
    }
  }, [userId])

  return {
    dailyTotals,
    weeklyData,
    loading,
    refreshDaily: fetchDailyTotals,
    refreshWeekly: fetchWeeklyData
  }
}

export default useNutrition