import { api } from "./api.js";

/**
 * FavoriteStore - Centralized state management for favorite staffs
 * Single source of truth for favorite data across all pages
 */
class FavoriteStore {
  constructor() {
    this.favorites = [];
    this.loading = false;
    this.error = null;
    this.listeners = new Set();
    this.userId = null;
    
      }

  /**
   * Initialize store with user ID
   * @param {string|number} userId - User ID
   */
  init(userId) {
    if (!userId) {
      console.error('❌ FavoriteStore.init: userId is required');
      return;
    }
    
    this.userId = String(userId);
        
    // Load favorites immediately
    this.load();
  }

  /**
   * Load favorites from API
   * Always fetch fresh data from server (single source of truth)
   */
  async load() {
    if (!this.userId) {
      console.error('❌ FavoriteStore.load: userId not set. Call init() first.');
      return;
    }

        
    this.loading = true;
    this.error = null;
    this.notify();

    try {
      // Clear localStorage cache to avoid stale data
      const cacheKey = `favorites_${this.userId}`;
      localStorage.removeItem(cacheKey);
      
      // Fetch from API (single source of truth)
      const response = await api.get(`/user/listFavorite?user_id=${this.userId}`);
      
      // Parse response (handle different response formats)
      let allFavorites = [];
      if (Array.isArray(response)) {
        allFavorites = response;
      } else if (Array.isArray(response.data)) {
        allFavorites = response.data;
      }

      
      // Filter staff only (has username AND phone)
      this.favorites = allFavorites.filter(item => {
        const isStaff = item.username && item.phone;
        if (!isStaff) {
                  }
        return isStaff;
      });

      
      // Update localStorage with fresh data
      const favoriteIds = this.favorites.map(f => String(f.id));
      localStorage.setItem(cacheKey, JSON.stringify(favoriteIds));
      
      this.loading = false;
      this.notify();
      
            
    } catch (error) {
      console.error('❌ FavoriteStore.load: Error', error);
      this.error = error;
      this.loading = false;
      this.favorites = [];
      this.notify();
    }
  }

  /**
   * Toggle favorite (add/remove)
   * @param {string|number} staffId - Staff ID to toggle
   * @returns {Promise<{success: boolean, action: string}>}
   */
  async toggle(staffId) {
    if (!this.userId) {
      throw new Error('User ID not set. Call init() first.');
    }

    const staffIdStr = String(staffId);
    const isCurrentlyFavorite = this.isFavorite(staffIdStr);
    const action = isCurrentlyFavorite ? 'removed' : 'added';
    
    
    // Optimistic update (for better UX)
    const previousFavorites = [...this.favorites];
    if (isCurrentlyFavorite) {
      this.favorites = this.favorites.filter(f => String(f.id) !== staffIdStr);
          }
    // Cannot add optimistically (need full staff data from API)
    this.notify();

    try {
      // Call appropriate API endpoint based on current state
      if (isCurrentlyFavorite) {
        // Remove from favorites
                const response = await api.post('/user/unFavorite', {
          user_id: this.userId,
          staff_id: staffId
        });
              } else {
        // Add to favorites
                const response = await api.post('/user/addFavorite', {
          user_id: this.userId,
          staff_id: staffId
        });
              }

      // Reload from API to get fresh data
      await this.load();

      // Dispatch global event for cross-page sync
      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: { 
          userId: this.userId, 
          staffId: staffIdStr, 
          action: action 
        }
      }));
      
      return { success: true, action: action };

    } catch (error) {
      console.error('❌ FavoriteStore.toggle: Error', error);
      
      // Rollback optimistic update
      this.favorites = previousFavorites;
      this.notify();
      
      throw error;
    }
  }

  /**
   * Check if staff is favorite
   * @param {string|number} staffId - Staff ID to check
   * @returns {boolean}
   */
  isFavorite(staffId) {
    const staffIdStr = String(staffId);
    return this.favorites.some(f => String(f.id) === staffIdStr);
  }

  /**
   * Get all favorites
   * @returns {Array} Copy of favorites array
   */
  getAll() {
    return [...this.favorites];
  }

  /**
   * Alias for getAll() for backward compatibility
   * @returns {Array} Copy of favorites array
   */
  getFavorites() {
    return this.getAll();
  }

  /**
   * Get favorite count
   * @returns {number}
   */
  getCount() {
    return this.favorites.length;
  }

  /**
   * Subscribe to store changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.error('❌ FavoriteStore.subscribe: callback must be a function');
      return () => {};
    }
    
    this.listeners.add(callback);
        
    // Call immediately with current state
    callback({
      favorites: this.getAll(),
      loading: this.loading,
      error: this.error
    });
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
          };
  }

  /**
   * Notify all listeners of state change
   */
  notify() {
    const state = {
      favorites: this.getAll(),
      loading: this.loading,
      error: this.error
    };
    
        
    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('❌ Error in listener callback:', error);
      }
    });
  }

  /**
   * Clear store (logout)
   */
  clear() {
        
    this.favorites = [];
    this.loading = false;
    this.error = null;
    this.userId = null;
    
    // Clear localStorage
    if (this.userId) {
      const cacheKey = `favorites_${this.userId}`;
      localStorage.removeItem(cacheKey);
    }
    
    this.notify();
  }
}

// Singleton instance (single source of truth)
export const favoriteStore = new FavoriteStore();
