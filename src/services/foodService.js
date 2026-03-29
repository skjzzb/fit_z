import { supabase } from './supabase'

/**
 * Food Service - Handles food-related database operations
 */
export const foodService = {
  /**
   * Get all available foods
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getAllFoods() {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .order('name')
    return { data, error }
  },

  /**
   * Get food by ID
   * @param {string} id
   * @returns {Promise<{data: any, error: any}>}
   */
  async getFoodById(id) {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  /**
   * Create a new food entry
   * @param {Object} food - { name, protein, calories }
   * @returns {Promise<{data: any, error: any}>}
   */
  async createFood(food) {
    const { data, error } = await supabase
      .from('foods')
      .insert([food])
      .select()
      .single()
    return { data, error }
  },

  /**
   * Search foods by name (case-insensitive)
   * @param {string} query - Search term
   * @returns {Promise<{data: any[], error: any}>}
   */
  async searchFoods(query) {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
    return { data, error }
  }
}

export default foodService
