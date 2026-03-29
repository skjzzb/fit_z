import { supabase } from './supabase'

/**
 * Meal Service - Handles meal logging operations
 *
 * Row Level Security: Users can only access their own meal_logs
 * via user_id equality check in RLS policies
 */
export const mealService = {
  /**
   * Get meal logs for a specific user
   * @param {string} userId
   * @param {Date} [date] - Optional date filter
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getMealLogs(userId, date = null) {
    let query = supabase
      .from('meal_logs')
      .select(`
        id,
        quantity,
        created_at,
        food_id,
        foods (id, name, protein, calories)
      `)
      .eq('user_id', userId)

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query.gte('created_at', startOfDay.toISOString())
                   .lte('created_at', endOfDay.toISOString())
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  /**
   * Get all meal logs for a user (no date filter)
   * @param {string} userId
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getAllMeals(userId) {
    const { data, error } = await supabase
      .from('meal_logs')
      .select(`
        id,
        quantity,
        created_at,
        food_id,
        foods (id, name, protein, calories)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  /**
   * Add a new meal log
   * @param {string} userId
   * @param {string} foodId
   * @param {number} quantity
   * @returns {Promise<{data: any, error: any}>}
   */
  async addMeal(userId, foodId, quantity) {
    const { data, error } = await supabase
      .from('meal_logs')
      .insert([{ user_id: userId, food_id: foodId, quantity }])
      .select(`
        id,
        quantity,
        created_at,
        food_id,
        foods (id, name, protein, calories)
      `)
      .single()
    return { data, error }
  },

  /**
   * Delete a meal log
   * @param {string} mealId
   * @param {string} userId
   * @returns {Promise<{error: any}>}
   */
  async deleteMeal(mealId, userId) {
    // RLS will ensure user can only delete their own meals
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId)

    return { error }
  },

  /**
   * Calculate daily nutritional totals
   * @param {string} userId
   * @param {Date} [date] - Defaults to today
   * @returns {Promise<{totalProtein: number, totalCalories: number, mealCount: number}>}
   */
  async getDailyTotals(userId, date = new Date()) {
    const { data: meals, error } = await this.getMealLogs(userId, date)

    if (error) {
      return { totalProtein: 0, totalCalories: 0, mealCount: 0, error }
    }

    const totalProtein = meals.reduce((sum, meal) => {
      return sum + (meal.foods.protein * meal.quantity)
    }, 0)

    const totalCalories = meals.reduce((sum, meal) => {
      return sum + (meal.foods.calories * meal.quantity)
    }, 0)

    return {
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCalories: Math.round(totalCalories),
      mealCount: meals.length,
      error: null
    }
  },

  /**
   * Get weekly totals for charting
   * @param {string} userId
   * @returns {Promise<{date: string, protein: number, calories: number}[]>}
   */
  async getWeeklyTotals(userId) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6)

    const { data: meals, error } = await supabase
      .from('meal_logs')
      .select(`
        quantity,
        created_at,
        foods (protein, calories)
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      return []
    }

    // Group by date
    const dailyTotals = {}
    meals.forEach(meal => {
      const date = new Date(meal.created_at).toISOString().split('T')[0]
      if (!dailyTotals[date]) {
        dailyTotals[date] = { protein: 0, calories: 0 }
      }
      dailyTotals[date].protein += meal.foods.protein * meal.quantity
      dailyTotals[date].calories += meal.foods.calories * meal.quantity
    })

    // Convert to array sorted by date
    return Object.entries(dailyTotals)
      .map(([date, totals]) => ({
        date,
        protein: Math.round(totals.protein * 10) / 10,
        calories: Math.round(totals.calories)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }
}

export default mealService