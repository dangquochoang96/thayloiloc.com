import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { qnaService } from "../services/qna.service.js";
import { authService } from "../services/auth.service.js";
import { api } from "../services/api.js";
import { showShareModal } from "../utils/shareUtils.js";
import { compressVideoSimple, getVideoInfo, needsCompression } from "../utils/videoCompressor.js";

import qnaTemplate from "../templates/qna.html?raw";
import "../styles/qna.css";

export function QnAPage() {
  const container = document.createElement("div");

  container.appendChild(Header());

  const main = document.createElement("main");
  const qnaSection = document.createElement("div");
  qnaSection.innerHTML = qnaTemplate;
  main.appendChild(qnaSection.firstElementChild);
  container.appendChild(main);

  container.appendChild(Footer());

  setTimeout(() => {
    initializeQnA();
  }, 0);

  return container;
}

let currentPage = 1;
let isLoading = false;
let allPosts = []; // Cache all posts for search
let currentSearchTerm = "";

function initializeQnA() {
  const user = authService.getCurrentUser();

  // Kiểm tra đăng nhập
  const createPostBtn = document.getElementById("createPostBtn");
  const loginPrompt = document.getElementById("loginPrompt");

  if (!user) {
    createPostBtn.style.display = "none";
    loginPrompt.style.display = "block";
  } else {
    createPostBtn.style.display = "block";
    loginPrompt.style.display = "none";
  }

  // Load bài đăng
  loadPosts();

  // Xử lý nút tạo bài đăng
  createPostBtn?.addEventListener("click", () => {
    showCreatePostModal();
  });

  // Xử lý nút load more
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  loadMoreBtn?.addEventListener("click", () => {
    loadPosts(true);
  });

  // Xử lý tìm kiếm
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  searchInput?.addEventListener("input", (e) => {
    const searchTerm = e.target.value.trim();
    currentSearchTerm = searchTerm;

    if (searchTerm) {
      clearSearchBtn.style.display = "flex";
      filterPosts(searchTerm);
    } else {
      clearSearchBtn.style.display = "none";
      displayPosts(allPosts);
    }
  });

  clearSearchBtn?.addEventListener("click", () => {
    searchInput.value = "";
    currentSearchTerm = "";
    clearSearchBtn.style.display = "none";
    displayPosts(allPosts);
    searchInput.focus();
  });
}

async function loadPosts(loadMore = false) {
  if (isLoading) return;

  isLoading = true;
  const postsContainer = document.getElementById("postsContainer");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const loadingIndicator = document.getElementById("loadingIndicator");

  try {
    loadingIndicator.style.display = "block";

    if (!loadMore) {
      currentPage = 1;
    } else {
      currentPage++;
    }

    const result = await qnaService.getPosts(currentPage, 10);

    if (!loadMore) {
      allPosts = result.posts;
      postsContainer.innerHTML = "";
    } else {
      allPosts = [...allPosts, ...result.posts];
    }

    // Apply search filter if active
    if (currentSearchTerm) {
      filterPosts(currentSearchTerm);
    } else {
      displayPosts(allPosts);
    }

    if (result.hasMore) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }

    if (allPosts.length === 0 && !loadMore) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <p>Chưa có bài đăng nào. Hãy là người đầu tiên đặt câu hỏi!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Load posts error:", error);
    showToast("Không thể tải bài đăng", "error");
  } finally {
    isLoading = false;
    loadingIndicator.style.display = "none";
  }
}

function filterPosts(searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredPosts = allPosts.filter(post => {
    const contentMatch = post.content.toLowerCase().includes(lowerSearchTerm);
    const authorMatch = post.userName.toLowerCase().includes(lowerSearchTerm);
    return contentMatch || authorMatch;
  });

  displayPosts(filteredPosts);

  const postsContainer = document.getElementById("postsContainer");
  if (filteredPosts.length === 0) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search" style="font-size: 3rem; color: #d1d5db; margin-bottom: 15px;"></i>
        <p>Không tìm thấy câu hỏi nào phù hợp với "${searchTerm}"</p>
      </div>
    `;
  }
}

function displayPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

/**
 * Get image URL - handle both Base64 and API path
 */
function getImageUrl(image) {
  if (!image) return "/images/default-service.svg";

  // If it's Base64 data
  if (typeof image === "object" && image.data) {
    return image.data;
  }

  // If it's a string path from API
  if (typeof image === "string") {
    // If already full URL
    if (image.startsWith("http")) {
      return image;
    }
    // Ensure path starts with 'storage/'
    let imagePath = image.replace(/^public\//, "storage/");
    if (!imagePath.startsWith("storage/")) {
      imagePath = `storage/${imagePath}`;
    }
    return `https://api.iongeyser.com/${imagePath}`;
  }

  // If it's an object with image property
  if (typeof image === "object" && image.image) {
    if (image.image.startsWith("http")) {
      return image.image;
    }
    // Ensure path starts with 'storage/'
    let imagePath = image.image.replace(/^public\//, "storage/");
    if (!imagePath.startsWith("storage/")) {
      imagePath = `storage/${imagePath}`;
    }
    return `https://api.iongeyser.com/${imagePath}`;
  }

  return "/images/default-service.svg";
}

/**
 * Get video URL - handle both Base64 and API path
 */
function getVideoUrl(video) {
  if (!video) return "";

  // If it's Base64 data
  if (typeof video === "object" && video.data) {
    return video.data;
  }

  // If it's a string path from API
  if (typeof video === "string") {
    // If already full URL
    if (video.startsWith("http")) {
      return video;
    }
    // Ensure path starts with 'storage/'
    let videoPath = video.replace(/^public\//, "storage/");
    if (!videoPath.startsWith("storage/")) {
      videoPath = `storage/${videoPath}`;
    }
    return `https://api.iongeyser.com/${videoPath}`;
  }

  // If it's an object with video property
  if (typeof video === "object" && video.video) {
    if (video.video.startsWith("http")) {
      return video.video;
    }
    // Ensure path starts with 'storage/'
    let videoPath = video.video.replace(/^public\//, "storage/");
    if (!videoPath.startsWith("storage/")) {
      videoPath = `storage/${videoPath}`;
    }
    return `https://api.iongeyser.com/${videoPath}`;
  }

  return "";
}

function createPostElement(post) {
  const div = document.createElement("div");
  div.className = "post-card";
  div.dataset.postId = post.id;

  const user = authService.getCurrentUser();
  // Compare as strings to handle both string and number IDs
  const isOwner = user && String(user.id) === String(post.userId);

  const createdAt = new Date(post.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  div.innerHTML = `
    <div class="post-header">
      <div class="post-author">
        <img src="${post.userAvatar || "/images/default-avatar.svg"}" alt="${post.userName}" class="author-avatar">
        <div class="author-info">
          <h4 class="author-name">${post.userName}</h4>
          <span class="post-time">${timeAgo}</span>
        </div>
      </div>
      ${isOwner
      ? `<button class="delete-post-btn" data-post-id="${post.id}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>`
      : ""
    }
    </div>
    <div class="post-content">
      <p class="post-text">${escapeHtml(post.content)}</p>
      ${post.images && post.images.length > 0
      ? `
        <div class="post-images">
          ${post.images
        .slice(0, 2)
        .map(
          (img) => {
            const imgUrl = getImageUrl(img);
            return `<img src="${imgUrl}" alt="Post image" class="post-image" onclick="openImageModal('${imgUrl}')">`;
          }
        )
        .join("")}
        </div>
      `
      : ""
    }
      ${post.videos && post.videos.length > 0
      ? `
        <div class="post-videos">
          ${post.videos
        .map(
          (video) => {
            const videoUrl = getVideoUrl(video);
            return `
            <video controls class="post-video" preload="metadata">
              <source src="${videoUrl}" type="video/mp4">
              Trình duyệt không hỗ trợ video.
            </video>
          `;
          }
        )
        .join("")}
        </div>
      `
      : ""
    }
    </div>
    <div class="post-footer">
      <div class="post-actions">
        <button class="like-btn" data-post-id="${post.id}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="like-count">${post.likeCount || 0}</span>
        </button>
        <button class="comment-count-btn" onclick="window.location.hash='/qna/${post.id}'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>${post.commentCount || 0}</span>
        </button>
      </div>
      <div class="action-group-right">
        <button class="share-post-btn" data-post-content="${escapeHtml(post.content)}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <div class="share-text">
            <span>Chia</span>
            <span>sẻ</span>
          </div>
        </button>
        <button class="view-detail-btn" onclick="window.location.hash='/qna/${post.id}'">
          <span>Xem<br>chi<br>tiết</span>
        </button>
      </div>
    </div>
  `;

  // Kiểm tra user đã like chưa
  if (user) {
    qnaService.checkUserLiked(post.id).then((liked) => {
      const likeBtn = div.querySelector(".like-btn");
      if (liked) {
        likeBtn.classList.add("liked");
      }
    });
  }

  // Xử lý like
  const likeBtn = div.querySelector(".like-btn");
  likeBtn?.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!user) {
      showToast("Vui lòng đăng nhập để thích bài đăng", "error");
      return;
    }
    await handleLike(post.id, likeBtn);
  });

  // Xử lý xóa bài đăng
  const deleteBtn = div.querySelector(".delete-post-btn");
  deleteBtn?.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa bài đăng này?")) {
      await deletePost(post.id);
    }
  });

  // Xử lý chia sẻ
  const shareBtn = div.querySelector(".share-post-btn");
  shareBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#/qna/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      if (typeof showToast === 'function') {
        showToast("Đã sao chép liên kết", "success");
      } else {
        alert("Đã sao chép liên kết");
      }
    }).catch((err) => {
      console.error("Lỗi sao chép:", err);
      if (typeof showToast === 'function') {
        showToast("Không thể sao chép liên kết", "error");
      }
    });
  });

  return div;
}

function showCreatePostModal() {
  const user = authService.getCurrentUser();
  const isAdmin = user && user.username && user.username.toLowerCase() === 'admin';

  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  // HTML Template for the Multi-Platform Post Composer
  modal.innerHTML = `
    <div class="modal-content create-post-modal">
      <div class="modal-header">
        <h2>Tạo bài viết mới</h2>
        <button class="close-modal-btn">&times;</button>
      </div>
      <div class="create-post-form">
        <!-- Platform Selection Checkboxes -->
        <div class="composer-platforms" style="margin-bottom: 15px; display: ${isAdmin ? 'flex' : 'none'}; gap: 15px; align-items: center; flex-wrap: wrap;">
            <span style="font-weight: 500; color: #374151;">Đăng lên:</span>
            <label class="platform-checkbox" style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="checkbox" name="platform" value="website" style="width: 16px; height: 16px;"> Website
            </label>
            <label class="platform-checkbox" style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="checkbox" name="platform" value="facebook" style="width: 16px; height: 16px;"> Facebook Page
            </label>
            <label class="platform-checkbox" style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="checkbox" name="platform" value="youtube" style="width: 16px; height: 16px;"> YouTube
            </label>
            <label class="platform-checkbox" style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="checkbox" name="platform" value="tiktok" style="width: 16px; height: 16px;"> TikTok
            </label>
            <label class="platform-checkbox" style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="checkbox" name="platform" value="app" style="width: 16px; height: 16px;"> App
            </label>
        </div>

        <!-- Youtube Specific Fields -->
        <div class="form-group platform-specific" id="youtube-fields" style="display: none;">
            <input type="text" id="post-title" placeholder="Tiêu đề video (Bắt buộc cho YouTube)">
        </div>
        <div class="form-group platform-specific" id="youtube-video-fields" style="display: none;">
            <input type="text" id="video-url" placeholder="URL Video (Link YouTube) - Hoặc upload video bên dưới">
        </div>

        <!-- Website Specific Fields -->
        <div class="form-group platform-specific" id="website-fields">
            <select id="post-category" style="width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 1rem; outline: none;">
                  
                <option value="news">Tin tức</option>
                <option value="tutorial">Hướng dẫn</option>
                <option value="product">Sản phẩm</option>
                <option value="qna">Hỏi đáp</option>
            </select>
        </div>

        <!-- Common Content Field -->
        <div class="form-group">
            <textarea id="post-content" placeholder="Bạn đang nghĩ gì?" rows="5"></textarea>
        </div>

        <!-- Image & Video Upload Buttons -->
        <div class="form-group upload-groups" style="display: flex; gap: 10px;">
            <label for="image-upload" class="composer-upload-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Thêm ảnh
            </label>
            <input type="file" id="image-upload" multiple accept="image/*" style="display: none;">

            <label for="video-upload" class="composer-upload-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                Thêm video
            </label>
            <input type="file" id="video-upload" multiple accept="video/*" style="display: none;">
        </div>

        <!-- Previews -->
        <div class="image-preview" id="image-preview"></div>
        <div class="video-preview" id="video-preview" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>

        <div class="form-actions">
          <button type="button" class="btn-cancel">Hủy</button>
          <button type="button" id="publish-btn" class="btn-submit">
            <span class="btn-text">Đăng bài</span>
            <span class="btn-loader" style="display: none;">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
            </span>
          </button>
        </div>
        
        <!-- Loading Overlay -->
        <div class="form-loading-overlay" id="form-loading-overlay">
            <div class="form-loading-spinner"></div>
            <div class="form-loading-text">Đang đăng bài...</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // === Elements ===
  const checkboxes = modal.querySelectorAll('input[name="platform"]');
  const contentInput = modal.querySelector('#post-content');
  const imageUpload = modal.querySelector('#image-upload');
  const videoUpload = modal.querySelector('#video-upload');
  const imagePreviewContainer = modal.querySelector('#image-preview');
  const videoPreviewContainer = modal.querySelector('#video-preview');
  const publishBtn = modal.querySelector('#publish-btn');

  const youtubeFields = modal.querySelector('#youtube-fields');
  const youtubeVideoFields = modal.querySelector('#youtube-video-fields');
  const websiteFields = modal.querySelector('#website-fields');
  const titleInput = modal.querySelector('#post-title');
  const videoUrlInput = modal.querySelector('#video-url');
  const categorySelect = modal.querySelector('#post-category');

  // === State (Draft) ===
  let postData = {
    platforms: ['website'],
    content: '',
    images: [], // base64 strings
    title: '',
    category: '',
    videoUrl: ''
  };
  let videoFiles = []; // Array of actual File objects (not saved to localStorage due to size limit)
  let isSubmitting = false;
  let activeVideoUploads = 0;

  const updatePublishBtnState = () => {
    if (isSubmitting || activeVideoUploads > 0) {
      publishBtn.disabled = true;
      if (activeVideoUploads > 0) {
        publishBtn.title = "Vui lòng chờ video xử lý xong...";
      } else {
        publishBtn.title = "";
      }
    } else {
      publishBtn.disabled = false;
      publishBtn.title = "";
    }
  };

  // === Platform Updating Logic ===
  const updatePlatformFields = () => {
    const isYoutube = postData.platforms.includes('youtube');
    const isWebsite = postData.platforms.includes('website');

    youtubeFields.style.display = isYoutube ? 'block' : 'none';
    youtubeVideoFields.style.display = isYoutube ? 'block' : 'none';
    websiteFields.style.display = isWebsite ? 'block' : 'none';

    // Update checkboxes UI to match state
    checkboxes.forEach(cb => {
      cb.checked = postData.platforms.includes(cb.value);
    });
  };

  // === Draft Management ===
  const loadDraft = () => {
    const savedDraft = localStorage.getItem('multiPlatformDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);

        // Migrate old string platform to array platforms
        if (parsed.platform && !parsed.platforms) {
          if (parsed.platform === 'website_facebook') {
            parsed.platforms = ['website', 'facebook'];
          } else {
            parsed.platforms = [parsed.platform];
          }
          delete parsed.platform;
        }

        postData = { ...postData, ...parsed };
        if (!isAdmin) postData.platforms = ['website']; // Force website for non-admins

        contentInput.value = postData.content || '';
        titleInput.value = postData.title || '';
        videoUrlInput.value = postData.videoUrl || '';
        categorySelect.value = postData.category || '';

        updatePlatformFields();
        renderImagePreviews();
      } catch (e) { console.error("Lỗi parse draft:", e); }
    } else {
      updatePlatformFields();
    }
  };

  const saveDraft = () => {
    postData.content = contentInput.value;
    postData.title = titleInput.value;
    postData.videoUrl = videoUrlInput.value;
    postData.category = categorySelect.value;
    localStorage.setItem('multiPlatformDraft', JSON.stringify(postData));
  };

  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      if (!isAdmin && e.target.value !== 'website') {
        e.target.checked = false; // Non-admins can't select other platforms
        return;
      }

      if (e.target.checked) {
        if (!postData.platforms.includes(e.target.value)) {
          postData.platforms.push(e.target.value);
        }
      } else {
        postData.platforms = postData.platforms.filter(p => p !== e.target.value);
      }

      updatePlatformFields();
      saveDraft();
    });
  });

  [contentInput, titleInput, videoUrlInput, categorySelect].forEach(input => {
    input.addEventListener('input', saveDraft);
  });

  // === Image Upload & Processing ===
  imageUpload.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    try {
      // Sử dụng hàm có sẵn của qnaService để nén ảnh (max 500KB) và chuyển sang Base64
      const processedImages = await qnaService.processImages(files);

      processedImages.forEach(imgObj => {
        postData.images.push(imgObj.data);
      });

      renderImagePreviews();
      saveDraft();
    } catch (error) {
      console.error("Lỗi xử lý ảnh:", error);
      showToast("Có lỗi khi xử lý ảnh", "error");
    } finally {
      imageUpload.value = '';
    }
  });

  const renderImagePreviews = () => {
    imagePreviewContainer.innerHTML = '';
    postData.images.forEach((base64String, index) => {
      const div = document.createElement('div');
      div.className = 'preview-item';

      const img = document.createElement('img');
      img.src = base64String;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-image';
      removeBtn.innerHTML = '&times;';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        postData.images.splice(index, 1);
        renderImagePreviews();
        saveDraft();
      };

      div.appendChild(img);
      div.appendChild(removeBtn);
      imagePreviewContainer.appendChild(div);
    });
  };

  // === Video Upload & Processing ===
  videoUpload.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    activeVideoUploads += files.length;
    updatePublishBtnState();

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'video-loading-indicator';
    loadingDiv.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Đang xử lý video...</div>
      <div class="loading-progress">0%</div>
    `;
    videoPreviewContainer.appendChild(loadingDiv);

    const compressionPromises = Array.from(files).map(async (file, fileIndex) => {
      try {
        // Get video info
        const info = await getVideoInfo(file);
                
        // Update loading text
        const loadingText = loadingDiv.querySelector('.loading-text');
        loadingText.textContent = `Đang xử lý video ${fileIndex + 1}/${files.length}...`;
        
        // Check if compression is needed (files > 10MB)
        if (needsCompression(file, 10)) {
          loadingText.textContent = `Đang nén video ${fileIndex + 1}/${files.length} (${info.sizeMB}MB)...`;
                    const compressedFile = await compressVideoSimple(file, 10);
          const compressedInfo = await getVideoInfo(compressedFile);
                    return compressedFile;
        }
        
        return file;
      } catch (error) {
        console.error('Video compression error:', error);
        // If compression fails, use original file
        return file;
      } finally {
        activeVideoUploads = Math.max(0, activeVideoUploads - 1);
        updatePublishBtnState();
      }
    });

    // Wait for all compressions to complete
    const processedFiles = await Promise.all(compressionPromises);
    videoFiles.push(...processedFiles);
    
    // Remove loading indicator
    loadingDiv.remove();
    
    renderVideoPreviews();
    videoUpload.value = '';
  });

  const renderVideoPreviews = () => {
    videoPreviewContainer.innerHTML = '';
    videoFiles.forEach((file, index) => {
      const div = document.createElement('div');
      div.className = 'preview-item video-preview-item';
      div.style.position = 'relative';
      div.style.aspectRatio = '16/9';
      div.style.background = '#000';
      div.style.borderRadius = '10px';
      div.style.overflow = 'hidden';

      const video = document.createElement('video');
      video.controls = true;
      const previewUrl = URL.createObjectURL(file);
      file.previewUrl = previewUrl; // Store reference to revoke later
      video.src = previewUrl;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'contain';

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-video';
      removeBtn.innerHTML = '&times;';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        URL.revokeObjectURL(file.previewUrl); // Cleanup memory
        videoFiles.splice(index, 1);
        renderVideoPreviews();
      };

      div.appendChild(video);
      div.appendChild(removeBtn);
      videoPreviewContainer.appendChild(div);
    });
  };

  // === Close Modal Logic ===
  const closeBtn = modal.querySelector(".close-modal-btn");
  const cancelBtn = modal.querySelector(".btn-cancel");
  const closeModal = () => {
    videoFiles.forEach(file => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
    modal.remove();
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // === Publish Button Logic ===
  publishBtn.addEventListener('click', async () => {
    if (isSubmitting) return;
    if (activeVideoUploads > 0) {
      showToast("Vui lòng chờ video xử lý xong trước khi đăng bài!", "error");
      return;
    }

    if (postData.platforms.length === 0) {
      showToast("Vui lòng chọn ít nhất một nền tảng để đăng!", "error");
      return;
    }

    isSubmitting = true;
    updatePublishBtnState();

    const finalData = {
      platforms: postData.platforms,
      content: postData.content,
      images: postData.images,
      videos: videoFiles.map(f => f.name) // Log video names in JSON
    };

    if (postData.platforms.includes('youtube')) {
      finalData.title = postData.title;
      finalData.videoUrl = postData.videoUrl;
    }
    if (postData.platforms.includes('website')) {
      finalData.category = postData.category;
    }

    // Log JSON to console exactly as requested
        
    // Visual feedback
    const btnText = publishBtn.querySelector(".btn-text");
    const btnLoader = publishBtn.querySelector(".btn-loader");
    const formOverlay = modal.querySelector("#form-loading-overlay");

    btnText.style.display = "none";
    btnLoader.style.display = "inline-flex";
    if (formOverlay) formOverlay.classList.add("active");

    try {
      // Convert base64 back to File objects for the API
      function dataURItoFile(dataURI, filename) {
        try {
          const arr = dataURI.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, { type: mime });
        } catch (e) {
          return null;
        }
      }

      const fileImages = finalData.images.map((b64, idx) => {
        let ext = "png";
        if (b64.includes("image/jpeg") || b64.includes("image/jpg")) ext = "jpg";
        else if (b64.includes("image/webp")) ext = "webp";
        else if (b64.includes("image/gif")) ext = "gif";
        return dataURItoFile(b64, `image_${idx + 1}.${ext}`);
      }).filter(Boolean);

                  
      if (finalData.images.length > 0 && fileImages.length === 0) {
        showToast("Lỗi: Không thể xử lý ảnh, file bị hỏng hoặc quá lớn!", "error");
        isSubmitting = false;
        updatePublishBtnState();
        btnText.style.display = "inline-flex";
        btnLoader.style.display = "none";
        return;
      }

      // LUÔN LUÔN tạo bài viết trên backend để lấy URL ảnh/video thực tế
      // Dựa vào Postman của user, có vẻ status = 0 là trạng thái hiển thị bình thường.
      const postStatus = 0;

      const postPayload = {
        title: finalData.title || "",
        content: finalData.content,
        images: fileImages,
        status: postStatus
      };
      
      // Only include videos if there are actual video files
      if (videoFiles && videoFiles.length > 0) {
        postPayload.videos = videoFiles;
      }

      const createdPostResponse = await qnaService.createPost(postPayload);

            
      if (postData.platforms.includes('website')) {
        showToast("Đăng bài lên website thành công!", "success");
        // Reload posts to update UI
        currentPage = 1;
        await loadPosts();
      }

      const socialPlatforms = postData.platforms.filter(p => p !== 'website');
      if (socialPlatforms.length > 0) {
        // Social Media (Facebook/YouTube) - Dùng Make.com Webhook
        const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/in3ghuzjwfuo9tokhl15eeqnljlgd4u7";

        let uploadedImageUrls = [];
        let uploadedVideoUrls = [];

        // Vì API POST /posts/store không trả về dữ liệu bài viết kèm URL, 
        // ta phải gọi GET /posts để lấy bài viết mới nhất vừa tạo ra!
        try {
                    const latestPostsResponse = await qnaService.getPosts(1, 5);
                    const currentUser = authService.getCurrentUser() || {};
          
          if (latestPostsResponse && latestPostsResponse.posts) {
            const matchedPost = latestPostsResponse.posts.find(p =>
              p.content === finalData.content || String(p.userId) === String(currentUser?.id)
            ) || latestPostsResponse.posts[0];

            if (matchedPost) {
                            if (matchedPost.images && Array.isArray(matchedPost.images)) {
                uploadedImageUrls = matchedPost.images.map(img => getImageUrl(img)).filter(url => url.startsWith("http"));
              }
              if (matchedPost.videos && Array.isArray(matchedPost.videos)) {
                uploadedVideoUrls = matchedPost.videos.map(vid => getVideoUrl(vid)).filter(url => url.startsWith("http"));
              }
            } else {
              console.warn("Không tìm thấy bài viết vừa tạo trong danh sách GET /posts!");
            }
          }
        } catch (err) {
          console.error("Lỗi khi fetch bài viết mới để lấy URL:", err);
        }

                
        // Gọi webhook cho TỪNG nền tảng social
        for (const targetPlatform of socialPlatforms) {
          const socialFormData = new FormData();
          socialFormData.append("content", finalData.content);
          socialFormData.append("platforms", targetPlatform);
          socialFormData.append("platform", targetPlatform); // Gửi thêm trường platform (số ít) để tương thích với bộ lọc cũ của Make.com

          if (targetPlatform === 'youtube') {
            if (finalData.title) socialFormData.append("title", finalData.title);
            if (finalData.videoUrl) socialFormData.append("videoUrl", finalData.videoUrl);
          }

          // Gửi URL ảnh cho Make.com
          if (uploadedImageUrls.length > 0) {
            socialFormData.append("img_url", uploadedImageUrls[0]);
            socialFormData.append("image_urls_json", JSON.stringify(uploadedImageUrls));
            
            // NATIVE ARRAY CHO MAKE.COM Nhận diện dạng Collection/Array
            uploadedImageUrls.forEach((fullUrl) => {
              socialFormData.append("images[]", fullUrl);
            });
          }

          // Gửi URL video cho Make.com
          if (uploadedVideoUrls.length > 0) {
            socialFormData.append("video_url", uploadedVideoUrls[0]);
            socialFormData.append("video_urls_json", JSON.stringify(uploadedVideoUrls));

            // NATIVE ARRAY CHO MAKE.COM Nhận diện dạng Collection/Array
            uploadedVideoUrls.forEach((fullUrl) => {
              socialFormData.append("videos[]", fullUrl);
            });
          }

          // Vẫn giữ lại dạng cũ đề phòng cho ảnh
          uploadedImageUrls.forEach((fullUrl, idx) => {
            socialFormData.append(`image_url_${idx + 1}`, fullUrl);
          });

          // Vẫn giữ lại dạng cũ đề phòng cho video
          uploadedVideoUrls.forEach((fullUrl, idx) => {
            socialFormData.append(`video_url_${idx + 1}`, fullUrl);
          });

                    for (let pair of socialFormData.entries()) {
                      }

                    const response = await fetch(MAKE_WEBHOOK_URL, {
            method: "POST",
            body: socialFormData
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Make.com rejected the webhook for ${targetPlatform}:`, response.status, errorText);
            throw new Error(`Make.com lỗi ${response.status} khi gửi đến ${targetPlatform}.`);
          }

          const responseText = await response.text();
          
          showToast(`Đã yêu cầu đăng bài lên ${targetPlatform}!`, "success");
        }
      }

      // Success - close modal and clear draft
      localStorage.removeItem('multiPlatformDraft');
      closeModal();
    } catch (error) {
      console.error("Publish error:", error);
      showToast("Có lỗi xảy ra khi đăng bài, vui lòng kiểm tra console.", "error");
    } finally {
      btnText.style.display = "inline-flex";
      btnLoader.style.display = "none";
      const formOverlay = modal.querySelector("#form-loading-overlay");
      if (formOverlay) formOverlay.classList.remove("active");
      isSubmitting = false;
      updatePublishBtnState();
    }
  });

  // Init
  loadDraft();
}

async function deletePost(postId) {
  try {
    await qnaService.deletePost(postId);
    showToast("Đã xóa bài đăng", "success");

    // Remove from DOM
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    postElement?.remove();

    // Remove from allPosts array
    allPosts = allPosts.filter(post => post.id !== postId);

    // If no posts left, show empty state
    if (allPosts.length === 0) {
      const postsContainer = document.getElementById("postsContainer");
      postsContainer.innerHTML = `
        <div class="empty-state">
          <p>Chưa có bài đăng nào. Hãy là người đầu tiên đặt câu hỏi!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Delete post error:", error);
    showToast(error.message || "Không thể xóa bài đăng", "error");
  }
}

async function handleLike(postId, likeBtn) {
  try {
    const result = await qnaService.toggleLike(postId);
    const likeCountSpan = likeBtn.querySelector(".like-count");

    if (result.liked) {
      likeBtn.classList.add("liked");
      // If API doesn't return count, increment current count
      if (result.likeCount === 0) {
        const currentCount = parseInt(likeCountSpan.textContent) || 0;
        likeCountSpan.textContent = currentCount + 1;
      } else {
        likeCountSpan.textContent = result.likeCount;
      }
    } else {
      likeBtn.classList.remove("liked");
      // If API doesn't return count, decrement current count
      if (result.likeCount === 0) {
        const currentCount = parseInt(likeCountSpan.textContent) || 0;
        likeCountSpan.textContent = Math.max(0, currentCount - 1);
      } else {
        likeCountSpan.textContent = result.likeCount;
      }
    }
  } catch (error) {
    console.error("Like error:", error);
    showToast(error.message || "Không thể thích bài đăng", "error");
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

  return date.toLocaleDateString("vi-VN");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Global function for image modal
window.openImageModal = function (imageUrl) {
  const modal = document.createElement("div");
  modal.className = "image-modal";
  modal.innerHTML = `
    <div class="image-modal-content">
      <button class="close-image-modal">&times;</button>
      <img src="${imageUrl}" alt="Full size image">
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-image-modal")) {
      modal.remove();
    }
  });
};
