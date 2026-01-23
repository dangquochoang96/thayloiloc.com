import { geyserecoApi } from "./api.js";

export const videoService = {
  // Get all videos from all pages using pagination info
  async getAllVideos() {
    try {
      const allVideos = [];
      let currentPage = 1;
      let hasMorePages = true;
      
      // Get first page to understand pagination structure
      const firstResponse = await geyserecoApi.get(`/videos/youtube-links?page=1&per_page=10`);
      
      if (!firstResponse.success || !firstResponse.data) {
        throw new Error('Failed to get first page');
      }
      
      // Add first page videos
      allVideos.push(...firstResponse.data);
      
      // Get pagination info
      const pagination = firstResponse.pagination || {};
      const totalPages = pagination.last_page || 1;
      const total = pagination.total || firstResponse.data.length;
      
      // If there are more pages, get them
      if (totalPages > 1) {
        for (let page = 2; page <= totalPages; page++) {
          const pageResponse = await geyserecoApi.get(`/videos/youtube-links?page=${page}&per_page=10`);
          
          if (pageResponse.success && pageResponse.data && pageResponse.data.length > 0) {
            allVideos.push(...pageResponse.data);
          }
        }
      }
      
      return {
        data: allVideos,
        total: allVideos.length,
        pagination: {
          total: total,
          totalPages: totalPages,
          perPage: pagination.per_page || 10
        }
      };
      
    } catch (error) {
      throw error;
    }
  },

  // Get videos from Geysereco API with pagination (kept for compatibility)
  async getVideosWithPagination(page = 1, perPage = 9) {
    try {
      const response = await geyserecoApi.get(`/videos/youtube-links?page=${page}&per_page=${perPage}`);
      
      if (response.success) {
        // Handle pagination structure like the one you provided
        const pagination = response.pagination || {};
        
        return {
          data: response.data || [],
          current_page: pagination.current_page || page,
          last_page: pagination.last_page || 1,
          total: pagination.total || 0,
          per_page: pagination.per_page || perPage,
          next_page_url: pagination.next_page_url || null,
          prev_page_url: pagination.prev_page_url || null
        };
      } else {
        throw new Error(response.message || 'Lỗi tải video');
      }
    } catch (error) {
      console.error('Lỗi tải video:', error);
      throw error;
    }
  },

  // Get video detail by ID
  async getVideoDetail(id) {
    try {
      const response = await geyserecoApi.get(`/videos/detail/${id}`);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Lỗi chi tiết video');
      }
    } catch (error) {
      console.error('Lỗi chi tiết video:', error);
      throw error;
    }
  },

  // Convert YouTube URL to embed URL
  convertToEmbedUrl(youtubeUrl) {
    if (!youtubeUrl) return '';
    
    // Handle different YouTube URL formats
    let videoId = '';
    
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = youtubeUrl.split('v=')[1].split('&')[0];
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
    } else if (youtubeUrl.includes('youtube.com/embed/')) {
      return youtubeUrl; // Already embed URL
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : youtubeUrl;
  },

  // Extract video ID from YouTube URL
  extractVideoId(youtubeUrl) {
    if (!youtubeUrl) return '';
    
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      return youtubeUrl.split('v=')[1].split('&')[0];
    } else if (youtubeUrl.includes('youtu.be/')) {
      return youtubeUrl.split('youtu.be/')[1].split('?')[0];
    } else if (youtubeUrl.includes('youtube.com/embed/')) {
      return youtubeUrl.split('embed/')[1].split('?')[0];
    }
    
    return '';
  },

  // Get YouTube thumbnail URL
  getYoutubeThumbnail(youtubeUrl, quality = 'maxresdefault') {
    const videoId = this.extractVideoId(youtubeUrl);
    if (!videoId) return '/images/logo.png';
    
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  }
};