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
    
    console.log('🏪 FavoriteStore initialized');
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
    console.log('🔧 FavoriteStore.init:', this.userId);
    
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

    console.log('🔄 FavoriteStore.load: Loading favorites for user', this.userId);
    
    this.loading = true;
    this.error = null;
    this.notify();

    try {
      // Clear localStorage cache to avoid stale data
      const cacheKey = `favorites_${this.userId}`;
      localStorage.removeItem(cacheKey);
      console.log('🗑️ Cleared localStorage cache:', cacheKey);

      // Fetch from API (single source of truth)
      const response = await api.get(`/user/listFavorite?user_id=${this.userId}`);
      
      // Parse response (handle different response formats)
      let allFavorites = [];
      if (Array.isArray(response)) {
        allFavorites = response;
      } else if (Array.isArray(response.data)) {
        allFavorites = response.data;
      }

      console.log('📋 API returned', allFavorites.length, 'items');

      // Filter staff only (has username AND phone)
      this.favorites = allFavorites.filter(item => {
        const isStaff = item.username && item.phone;
        if (!isStaff) {
          console.log('⏭️ Skipping non-staff item:', item.id);
        }
        return isStaff;
      });

      console.log('❤️ Filtered', this.favorites.length, 'staff favorites');

      // Update localStorage with fresh data
      const favoriteIds = this.favorites.map(f => String(f.id));
      localStorage.setItem(cacheKey, JSON.stringify(favoriteIds));
      console.log('💾 Updated localStorage:', favoriteIds);

      this.loading = false;
      this.notify();
      
      console.log('✅ FavoriteStore.load: Success');
      
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
    
    console.log('🔘 FavoriteStore.toggle:', {
      staffId: staffIdStr,
      isCurrentlyFavorite,
      action
    });

    // Optimistic update (for better UX)
    const previousFavorites = [...this.favorites];
    if (isCurrentlyFavorite) {
      this.favorites = this.favorites.filter(f => String(f.id) !== staffIdStr);
      console.log('⚡ Optimistic remove from UI');
    }
    // Cannot add optimistically (need full staff data from API)
    this.notify();

    try {
      // Call API (single source of truth)
      console.log('📡 Calling API /user/addFavorite');
      const response = await api.post('/user/addFavorite', {
        user_id: parseInt(this.userId),
        staff_id: parseInt(staffId)
      });

      console.log('✅ API response:', response);

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
      console.log('📢 Dispatched favoritesUpdated event');

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
    console.log('👂 Listener subscribed. Total listeners:', this.listeners.size);
    
    // Call immediately with current state
    callback({
      favorites: this.getAll(),
      loading: this.loading,
      error: this.error
    });
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      console.log('👋 Listener unsubscribed. Total listeners:', this.listeners.size);
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
    
    console.log('📣 Notifying', this.listeners.size, 'listeners');
    
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
    console.log('🧹 FavoriteStore.clear: Clearing all data');
    
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
