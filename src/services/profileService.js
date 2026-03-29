import { supabase } from './supabase'

/**
 * Profile Service - Handles user profile operations
 */
export const profileService = {
  /**
   * Get current user's profile
   * @returns {Promise<{data: any, error: any}>}
   */
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { data, error }
  },

  /**
   * Create a new profile after signup
   * @param {Object} profile - { id, name, email, avatar_url }
   * @returns {Promise<{data: any, error: any}>}
   */
  async createProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()

    return { data, error }
  },

  /**
   * Update user profile
   * @param {Object} updates - { name, avatar_url, etc. }
   * @returns {Promise<{data: any, error: any}>}
   */
  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    return { data, error }
  }
}

export default profileService