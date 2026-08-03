/**
 * Q&A Service - Quản lý hệ thống hỏi đáp
 * Sử dụng API Backend
 */

import { api, ApiClient } from "./api.js";
import { authService } from "./auth.service.js";
import { formatUserName } from "../utils/helpers.js";

// Create production API client for uploads (bypass proxy)
const uploadApi = new ApiClient("https://api.iongeyser.com/api");

class QnAService {
  constructor() {
    this.baseEndpoint = "/posts";
    // Cache liked status to avoid unnecessary API calls
    this.likedPosts = new Set();
    this.likedComments = new Set();
  }

  /**
   * Normalize post data from API to frontend format
   */
  normalizePost(post) {
    if (!post) return null;
    
    const user = authService.getCurrentUser();
    const userId = user?.id;
    
    // Check if user has liked this post
    const hasUserLiked = post.reactions && Array.isArray(post.reactions) 
      ? post.reactions.some(r => String(r.user_id) === String(userId))
      : false;
    
    // Update liked cache
    if (hasUserLiked && userId) {
      this.likedPosts.add(String(post.id));
    }
    
    // Calculate total comment count (comments + all replies)
    let totalCommentCount = 0;
    if (post.comments && Array.isArray(post.comments)) {
      totalCommentCount = post.comments.length;
      // Add reply count for each comment
      post.comments.forEach(comment => {
        if (comment.reply_comments && Array.isArray(comment.reply_comments)) {
          totalCommentCount += comment.reply_comments.length;
        }
      });
    }
    
    // Parse images and videos safely
    let images = [];
    let sourceImages = post.images || post.image;
    if (sourceImages) {
      try {
        if (Array.isArray(sourceImages)) {
          images = sourceImages;
        } else if (typeof sourceImages === 'string' && sourceImages !== 'null') {
          images = JSON.parse(sourceImages);
        }
        
        // Ensure correct domain for images
        images = images.map(image => {
          if (typeof image === 'string') {
            // Replace old domain with new domain
            if (image.includes('api.iongeyser.com')) {
              return image.replace('api.iongeyser.com', 'api.iongeyser.com');
            }
            // If starts with /storage or relative path, prepend base URL
            if (image.startsWith('/storage') || image.startsWith('/imagePost')) {
              return `https://api.iongeyser.com${image}`;
            }
            // If already correct domain, return as is
            return image;
          }
          return image;
        });
      } catch (e) {
        console.error("Error parsing post images:", e);
      }
    }

    let videos = [];
    let sourceVideos = post.videos || post.video;
    if (sourceVideos) {
      try {
        if (Array.isArray(sourceVideos)) {
          videos = sourceVideos;
        } else if (typeof sourceVideos === 'string' && sourceVideos !== 'null') {
          videos = JSON.parse(sourceVideos);
        }
        
        // Ensure correct domain for videos
        videos = videos.map(video => {
          if (typeof video === 'string') {
            // Replace old domain with new domain
            if (video.includes('api.iongeyser.com')) {
              return video.replace('api.iongeyser.com', 'api.iongeyser.com');
            }
            // If starts with /storage or /videoPost, prepend base URL
            if (video.startsWith('/storage') || video.startsWith('/videoPost')) {
              return `https://api.iongeyser.com${video}`;
            }
            // If already correct domain, return as is
            return video;
          }
          return video;
        });
      } catch (e) {
        console.error("Error parsing post videos:", e);
      }
    }

    return {
      id: post.id,
      content: post.content || "",
      userId: post.user_id,
      userName: post.user?.username || post.user?.phone || "Người dùng",
      userAvatar: post.user?.avartar || post.user?.avatar || "",
      images: images,
      videos: videos,
      commentCount: totalCommentCount,
      likeCount: post.reactions?.length || 0,
      reactions: post.reactions || [],
      createdAt: new Date(post.created_at).getTime(),
      updatedAt: new Date(post.updated_at).getTime(),
    };
  }

  /**
   * Normalize comment data from API to frontend format
   */
  normalizeComment(comment) {
    if (!comment) return null;
    
    // Parse images and videos safely
    let images = [];
    if (comment.comment_images) {
      try {
        // Check if it's already an array (not a JSON string)
        if (Array.isArray(comment.comment_images)) {
          images = comment.comment_images;
        } else if (typeof comment.comment_images === 'string' && comment.comment_images !== 'null') {
          // Parse JSON string
          images = JSON.parse(comment.comment_images);
        }
        
        // Transform image paths: replace 'public/' with 'storage/'
        images = images.map(img => {
          if (typeof img === 'string') {
            return img.replace(/^public\//, 'storage/');
          } else if (typeof img === 'object' && img.image) {
            return {
              ...img,
              image: img.image.replace(/^public\//, 'storage/')
            };
          }
          return img;
        });
      } catch (e) {
        console.error("Error parsing comment images:", e);
        images = [];
      }
    }
    
    let videos = [];
    if (comment.comment_videos) {
      try {
        // Check if it's already an array (not a JSON string)
        if (Array.isArray(comment.comment_videos)) {
          videos = comment.comment_videos;
        } else if (typeof comment.comment_videos === 'string' && comment.comment_videos !== 'null') {
          // Parse JSON string
          videos = JSON.parse(comment.comment_videos);
        }
        
        // Transform video paths: replace 'public/' with 'storage/'
        videos = videos.map(video => {
          if (typeof video === 'string') {
            return video.replace(/^public\//, 'storage/');
          } else if (typeof video === 'object' && video.video) {
            return {
              ...video,
              video: video.video.replace(/^public\//, 'storage/')
            };
          }
          return video;
        });
      } catch (e) {
        console.error("Error parsing comment videos:", e);
        videos = [];
      }
    }
    
    // Normalize replies if present
    let replies = [];
    if (comment.reply_comments && Array.isArray(comment.reply_comments)) {
      replies = comment.reply_comments.map(r => this.normalizeReply(r)).filter(r => r);
    }
    
    return {
      id: comment.id,
      postId: comment.post_id,
      content: comment.comment || comment.content,
      userId: comment.user_id,
      userName: comment.user?.username || comment.user?.phone || "Người dùng",
      userAvatar: comment.user?.avartar || comment.user?.avatar || "",
      images: images,
      videos: videos,
      likeCount: 0,
      replyCount: replies.length,
      replies: replies,
      createdAt: new Date(comment.created_at).getTime(),
    };
  }

  /**
   * Normalize reply data from API to frontend format
   */
  normalizeReply(reply) {
    if (!reply) return null;
    
    return {
      id: reply.id,
      commentId: reply.comment_id,
      postId: reply.post_id,
      content: reply.comment_reply || reply.comment || reply.content || "",
      userId: reply.user_id,
      userName: reply.user?.username || reply.user?.phone || "Người dùng",
      userAvatar: reply.user?.avartar || reply.user?.avatar || "",
      createdAt: new Date(reply.created_at).getTime(),
    };
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async processImages(files) {
    const maxSize = 500 * 1024;
    const images = [];

    for (const file of files) {
      try {
        let processedFile = file;
        if (file.size > maxSize) {
          processedFile = await this.compressImage(file, maxSize);
        }

        const base64 = await this.fileToBase64(processedFile);
        images.push({
          data: base64,
          name: file.name,
          type: file.type,
          size: processedFile.size,
        });
      } catch (error) {
        console.error("Process image error:", error);
      }
    }

    return images;
  }

  async processVideos(files) {
    const videos = [];

    for (const file of files) {
      try {
        const base64 = await this.fileToBase64(file);
        videos.push({
          data: base64,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      } catch (error) {
        console.error("Process video error:", error);
        throw error;
      }
    }

    return videos;
  }

  async compressImage(file, maxSize) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            const maxDimension = 1200;
            if (width > height && width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(
                    new File([blob], file.name, {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    })
                  );
                } else {
                  // Fallback to original file
                  resolve(file);
                }
              },
              "image/jpeg",
              0.7
            );
          } catch (err) {
            console.error("Canvas compression failed, returning original file:", err);
            resolve(file);
          }
        };
        img.onerror = () => {
          console.error("Image loading failed, returning original file");
          resolve(file);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        console.error("FileReader failed, returning original file");
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload single image to server (use production API directly)
   */
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      
      const response = await uploadApi.postFormData("/v1.0/upload/image", formData);
      
      if (response && response.code === 1 && response.data) {
        return response.data.url || response.data.image_url || response.data.path || response.data;
      }
      
      throw new Error(response?.message || "Upload ảnh thất bại");
    } catch (error) {
      console.error("Upload image error:", error);
      throw error;
    }
  }

  /**
   * Upload single video to server (use production API directly)
   */
  async uploadVideo(videoFile) {
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      
      const response = await uploadApi.postFormData("/v1.0/upload/video", formData);
      
      if (response && response.code === 1 && response.data) {
        return response.data.url || response.data.video_url || response.data.path || response.data;
      }
      
      throw new Error(response?.message || "Upload video thất bại");
    } catch (error) {
      console.error("Upload video error:", error);
      throw error;
    }
  }

  async createPost(postData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập để tạo bài đăng");
      }

      // Create FormData with files directly (no separate upload needed)
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("content", postData.content);
      formData.append("status", postData.status !== undefined ? postData.status : 0);
      
      // Add image files
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((imageFile) => {
          if (imageFile instanceof File) {
            formData.append("images[]", imageFile);
          }
        });
      }

      // Add video files
      if (postData.videos && postData.videos.length > 0) {
        postData.videos.forEach((videoFile) => {
          if (videoFile instanceof File) {
            formData.append("video[]", videoFile);
          }
        });
      }

      if (postData.title) {
        formData.append("title", postData.title);
      }

            for (let pair of formData.entries()) {
              }

      // Use uploadApi to call production API directly (bypass proxy)
      const response = await uploadApi.postFormData("/v1.0/posts/store", formData);

      if (response && (
        response.code === 1 || 
        response.code === "1" ||
        response.success || 
        response.id ||
        (response.message && response.message.includes("thành công")) ||
        (response.messenger && response.messenger.includes("thành công"))
      )) {
        return {
          success: true,
          postId: response.data?.id || response.id,
          post: response.data || response,
        };
      } else {
        throw new Error(response?.message || response?.messenger || "Không thể tạo bài đăng");
      }
    } catch (error) {
      console.error("Create post error:", error);
      throw error;
    }
  }

  async getPosts(page = 1, pageSize = 10) {
    try {
      // Clear cache before fetching to always get fresh data
      api.clearCache();
      
      // Add sort parameter to get newest posts first
      const response = await api.get(`${this.baseEndpoint}?page=${page}&limit=${pageSize}&sort=desc`);
      
      let posts = [];
      
      // Handle different response formats
      if (response) {
        // Check for code as string or number
        if ((response.code === 1 || response.code === "1") && response.data) {
          posts = Array.isArray(response.data) ? response.data : (response.data.posts || []);
        } else if (Array.isArray(response)) {
          posts = response;
        } else if (response.posts && Array.isArray(response.posts)) {
          posts = response.posts;
        } else if (response.data && Array.isArray(response.data)) {
          posts = response.data;
        }
      }
      
      // Normalize all posts
      const normalizedPosts = posts.map(post => this.normalizePost(post)).filter(p => p);
      
      // Sort by created_at descending (newest first) in case API doesn't sort
      normalizedPosts.sort((a, b) => b.createdAt - a.createdAt);
      
            
      return {
        posts: normalizedPosts,
        currentPage: response.current_page || page,
        totalPages: response.total_pages || Math.ceil(posts.length / pageSize),
        hasMore: posts.length >= pageSize,
      };
    } catch (error) {
      console.error("Get posts error:", error);
      throw error;
    }
  }

  async getPost(postId) {
    try {
      api.clearCache();
      
      // Try detail endpoint first
      try {
        const response = await api.get(`${this.baseEndpoint}/${postId}`);
        let post = null;
        
        if (response) {
          if ((response.code === 1 || response.code === "1") && response.data) {
            post = response.data;
          } else if (response.id || response.post_id) {
            post = response;
          } else if (response.post) {
            post = response.post;
          }
        }
        
        if (post) {
          return this.normalizePost(post);
        }
      } catch (detailError) {
        // Fallback to list endpoint
      }
      
      // Fallback: Get from posts list
      const listResponse = await api.get(`${this.baseEndpoint}`);
      let posts = [];
      
      if (listResponse) {
        if ((listResponse.code === 1 || listResponse.code === "1") && listResponse.data) {
          posts = Array.isArray(listResponse.data) ? listResponse.data : (listResponse.data.posts || []);
        } else if (Array.isArray(listResponse)) {
          posts = listResponse;
        } else if (listResponse.posts) {
          posts = listResponse.posts;
        } else if (listResponse.data) {
          posts = listResponse.data;
        }
      }
      
      const post = posts.find(p => p.id == postId);
      if (!post) {
        throw new Error("Bài đăng không tồn tại");
      }
      
      return this.normalizePost(post);
    } catch (error) {
      console.error("Get post error:", error);
      throw error;
    }
  }

  async updatePost(postId, postData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập để chỉnh sửa bài đăng");
      }

      const formData = new FormData();
      formData.append("content", postData.content);
      formData.append("_method", "PUT");
      
      if (postData.replacedImages && Object.keys(postData.replacedImages).length > 0) {
        for (const [imageId, file] of Object.entries(postData.replacedImages)) {
          formData.append(`imageEdit[${imageId}]`, file);
        }
      }

      const response = await api.postFormData(`${this.baseEndpoint}/${postId}/update`, formData);

      if (response && (
        response.code === 1 || 
        response.code === "1" ||
        response.success || 
        (response.message && response.message.includes("thành công")) ||
        (response.messenger && response.messenger.includes("thành công"))
      )) {
        api.clearCache();
        
        let updatedPost = response.data || response.post;
        
        if (!updatedPost || !updatedPost.content) {
          try {
            updatedPost = await this.getPost(postId);
          } catch (reloadError) {
            console.error("Reload post error:", reloadError);
          }
        }
        
        return {
          success: true,
          post: updatedPost || { id: postId, content: postData.content },
        };
      } else {
        throw new Error(response?.message || response?.messenger || "Không thể cập nhật bài đăng");
      }
    } catch (error) {
      console.error("Update post error:", error);
      throw error;
    }
  }

  async deletePost(postId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập");
      }

      const response = await api.delete(`${this.baseEndpoint}/${postId}/delete?user_id=${user.id}`);

      if (response && (response.code === 1 || response.code === "1" || response.success)) {
        return { success: true };
      } else {
        throw new Error(response?.message || response?.messenger || "Không thể xóa bài đăng");
      }
    } catch (error) {
      console.error("Delete post error:", error);
      throw error;
    }
  }


  async toggleLike(postId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập để thích bài đăng");
      }

      const liked = await this.checkUserLiked(postId);

      if (liked) {
        // Unlike: DELETE /posts/{id}/deleteReactions/{userID}
        const response = await api.delete(`${this.baseEndpoint}/${postId}/deleteReactions/${user.id}`);
                
        // Update cache
        this.likedPosts.delete(String(postId));
        
        // Handle different response formats
        if (response && (response.code === 1 || response.code === "1" || response.success || response.message || response.messenger)) {
          return { 
            success: true, 
            liked: false, 
            likeCount: response.data?.like_count || response.like_count || 0 
          };
        }
      } else {
        // Like: POST /posts/reactions with FormData
        const formData = new FormData();
        formData.append("user_id", user.id);
        formData.append("post_id", postId);
        formData.append("reaction_type", "1"); // 1 for like
        
        const response = await api.postFormData(`${this.baseEndpoint}/reactions`, formData);
        
        // Update cache
        this.likedPosts.add(String(postId));

        // Handle different response formats
        if (response && (response.code === 1 || response.code === "1" || response.success || response.id || (response.message && response.message.includes("thành công")) || (response.messenger && response.messenger.includes("thành công")))) {
          return { 
            success: true, 
            liked: true, 
            likeCount: response.data?.like_count || response.like_count || 1 
          };
        }
      }

      return { success: true, liked: !liked, likeCount: 0 };
    } catch (error) {
      console.error("Toggle like error:", error);
      // Return success anyway to avoid blocking UI
      return { success: true, liked: false, likeCount: 0 };
    }
  }

  async checkUserLiked(postId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) return false;

      // Check from cache first
      return this.likedPosts.has(String(postId));
    } catch (error) {
      console.error("Check user liked error:", error);
      return false;
    }
  }

  async addComment(postId, commentData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập để bình luận");
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("post_id", postId);
      formData.append("comment", commentData.content);
      
      // Add images as files (if any)
      if (commentData.images && commentData.images.length > 0) {
        for (let i = 0; i < commentData.images.length; i++) {
          formData.append("images[]", commentData.images[i]);
        }
      }

      // Add videos as files (if any)
      if (commentData.videos && commentData.videos.length > 0) {
        for (let i = 0; i < commentData.videos.length; i++) {
          formData.append("videos[]", commentData.videos[i]);
        }
      }

      const response = await api.postFormData(`${this.baseEndpoint}/storeComments`, formData);
      
      if (response && (response.code === 1 || response.code === "1" || response.success || response.id || (response.message && response.message.includes("thành công")) || (response.messenger && response.messenger.includes("thành công")))) {
        return {
          success: true,
          commentId: response.data?.id || response.id,
          comment: response.data || response,
        };
      } else {
        throw new Error(response?.message || response?.messenger || "Không thể thêm bình luận");
      }
    } catch (error) {
      console.error("Add comment error:", error);
      throw error;
    }
  }

  async getComments(postId) {
    try {
      api.clearCache();
      
      // Try comments endpoint first
      try {
        const response = await api.get(`${this.baseEndpoint}/comments?post_id=${postId}`);
        let comments = [];
        
        if (response) {
          if ((response.code === 1 || response.code === "1") && response.data) {
            comments = Array.isArray(response.data) ? response.data : (response.data.comments || []);
          } else if (Array.isArray(response)) {
            comments = response;
          } else if (response.comments) {
            comments = response.comments;
          } else if (response.data) {
            comments = response.data;
          }
        }
        
        if (comments.length > 0) {
          return comments.map(comment => this.normalizeComment(comment)).filter(c => c);
        }
      } catch (commentsError) {
        // Fallback to post detail
      }
      
      // Fallback: Get comments from post detail
      const listResponse = await api.get(`${this.baseEndpoint}`);
      let posts = [];
      
      if (listResponse) {
        if ((listResponse.code === 1 || listResponse.code === "1") && listResponse.data) {
          posts = Array.isArray(listResponse.data) ? listResponse.data : (listResponse.data.posts || []);
        } else if (Array.isArray(listResponse)) {
          posts = listResponse;
        } else if (listResponse.posts) {
          posts = listResponse.posts;
        } else if (listResponse.data) {
          posts = listResponse.data;
        }
      }
      
      const post = posts.find(p => p.id == postId);
      if (post && post.comments) {
        const normalizedComments = post.comments.map(comment => this.normalizeComment(comment)).filter(c => c);
                return normalizedComments;
      }
      
      return [];
    } catch (error) {
      console.error("Get comments error:", error);
      return [];
    }
  }

  async deleteComment(commentId, postId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập");
      }

      const response = await api.delete(`${this.baseEndpoint}/${commentId}/deleteComments`);
      
      if (response && (response.code === 1 || response.code === "1" || response.success || (response.message && response.message.includes("thành công")) || (response.messenger && response.messenger.includes("thành công")))) {
        return { success: true };
      } else {
        throw new Error(response?.message || response?.messenger || "Không thể xóa bình luận");
      }
    } catch (error) {
      console.error("Delete comment error:", error);
      throw error;
    }
  }


  async toggleCommentLike(commentId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập để thích bình luận");
      }

      const liked = await this.checkCommentLiked(commentId);

      if (liked) {
        const response = await api.delete(`${this.baseEndpoint}/comments/reactions?comment_id=${commentId}&user_id=${user.id}`);
                
        // Handle different response formats
        if (response && (response.code === 1 || response.code === "1" || response.success || response.message)) {
          return { 
            success: true, 
            liked: false, 
            likeCount: response.data?.like_count || response.like_count || 0 
          };
        }
      } else {
        const response = await api.post(`${this.baseEndpoint}/comments/reactions`, {
          comment_id: commentId,
          user_id: user.id,
          type: "like",
        });
        
        // Handle different response formats
        if (response && (response.code === 1 || response.code === "1" || response.success || response.id)) {
          return { 
            success: true, 
            liked: true, 
            likeCount: response.data?.like_count || response.like_count || 1 
          };
        }
      }

      return { success: true, liked: !liked, likeCount: 0 };
    } catch (error) {
      console.error("Toggle comment like error:", error);
      // Return success anyway to avoid blocking UI
      return { success: true, liked: false, likeCount: 0 };
    }
  }

  async checkCommentLiked(commentId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) return false;

      // TODO: Backend chưa hỗ trợ GET check comment liked
      // Tạm thời return false
      return false;
      
      // const response = await api.get(`${this.baseEndpoint}/comments/reactions?comment_id=${commentId}&user_id=${user.id}`);
      // return response.code === 1 && response.data && response.data.liked === true;
    } catch (error) {
      console.error("Check comment liked error:", error);
      return false;
    }
  }

  async addReply(commentId, postId, content) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập để trả lời");
      }

      // Create FormData for reply
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("comment_id", commentId);
      formData.append("comment_reply", content); // API uses 'comment_reply' not 'comment'

      const response = await api.postFormData(`${this.baseEndpoint}/replyComments`, formData);
      
      if (response && (response.code === 1 || response.code === "1" || response.success || response.id || (response.message && response.message.includes("thành công")) || (response.messenger && response.messenger.includes("thành công")))) {
        return {
          success: true,
          replyId: response.data?.id || response.id,
          reply: response.data || response,
        };
      } else {
        throw new Error(response?.message || response?.messenger || "Không thể thêm phản hồi");
      }
    } catch (error) {
      console.error("Add reply error:", error);
      throw error;
    }
  }

  async getReplies(commentId) {
    try {
      const response = await api.get(`${this.baseEndpoint}/comments/reply?comment_id=${commentId}`);

      if (response.code === 1 || response.code === "1") {
        const replies = response.data?.replies || response.data || [];
        return Array.isArray(replies) ? replies.map(r => this.normalizeReply(r)).filter(r => r) : [];
      }
      return [];
    } catch (error) {
      console.error("Get replies error:", error);
      return [];
    }
  }

  async deleteReply(replyId, commentId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập");
      }

      const response = await api.delete(`${this.baseEndpoint}/${replyId}/replyDeleteComments`);
      
      if (response && (response.code === 1 || response.code === "1" || response.success || (response.message && response.message.includes("thành công")) || (response.messenger && response.messenger.includes("thành công")))) {
        return { success: true };
      } else {
        throw new Error(response?.message || response?.messenger || "Không thể xóa phản hồi");
      }
    } catch (error) {
      console.error("Delete reply error:", error);
      throw error;
    }
  }
}

export const qnaService = new QnAService();
