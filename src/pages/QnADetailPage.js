import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { qnaService } from "../services/qna.service.js";
import { authService } from "../services/auth.service.js";
import { api } from "../services/api.js";
import { showShareModal } from "../utils/shareUtils.js";

import qnaDetailTemplate from "../templates/qna-detail.html?raw";
import "../styles/qna-detail.css";

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

export function QnADetailPage() {
  const container = document.createElement("div");

  container.appendChild(Header());

  const main = document.createElement("main");
  const detailSection = document.createElement("div");
  detailSection.innerHTML = qnaDetailTemplate;
  main.appendChild(detailSection.firstElementChild);
  container.appendChild(main);

  container.appendChild(Footer());

  setTimeout(() => {
    initializeQnADetail();
  }, 0);

  return container;
}

function initializeQnADetail() {
  const postId = getPostIdFromUrl();
  if (!postId) {
    showToast("Không tìm thấy bài đăng", "error");
    window.location.hash = "/qna";
    return;
  }

  loadPostDetail(postId);
  loadComments(postId);

  // Xử lý form comment
  const commentForm = document.getElementById("commentForm");
  commentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitComment(postId);
  });

  // Preview comment images
  const commentImages = document.getElementById("commentImages");
  const commentImagePreview = document.getElementById("commentImagePreview");
  
  commentImages?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    commentImagePreview.innerHTML = "";

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement("div");
        div.className = "preview-item-small";
        div.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <button type="button" class="remove-preview" data-type="image" data-index="${index}">&times;</button>
        `;
        commentImagePreview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  });

  // Preview comment videos
  const commentVideos = document.getElementById("commentVideos");
  const commentVideoPreview = document.getElementById("commentVideoPreview");
  
  commentVideos?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    commentVideoPreview.innerHTML = "";
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.className = "preview-item-small";
      div.innerHTML = `
        <video controls preload="metadata">
          <source src="${e.target.result}" type="${file.type}">
        </video>
        <button type="button" class="remove-preview" data-type="video">&times;</button>
      `;
      commentVideoPreview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });

  // Remove preview handlers
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-preview")) {
      const type = e.target.dataset.type;
      if (type === "image") {
        const index = parseInt(e.target.dataset.index);
        const dt = new DataTransfer();
        const files = Array.from(commentImages.files);
        files.forEach((file, i) => {
          if (i !== index) dt.items.add(file);
        });
        commentImages.files = dt.files;
        e.target.closest(".preview-item-small").remove();
      } else if (type === "video") {
        commentVideos.value = "";
        commentVideoPreview.innerHTML = "";
      }
    }
  });

  // Back button
  const backBtn = document.getElementById("backBtn");
  backBtn?.addEventListener("click", () => {
    window.location.hash = "/qna";
  });
}

function getPostIdFromUrl() {
  const hash = window.location.hash;
  const match = hash.match(/\/qna\/([^\/]+)/);
  return match ? match[1] : null;
}

async function loadPostDetail(postId) {
  const postContainer = document.getElementById("postDetail");
  const loadingIndicator = document.getElementById("postLoading");

  try {
    loadingIndicator.style.display = "block";

    // Clear cache to ensure fresh data
    api.clearCache();
    
    const post = await qnaService.getPost(postId);
        
    const user = authService.getCurrentUser();
    // Compare as strings to handle both string and number IDs
    const isOwner = user && String(user.id) === String(post.userId);

    const createdAt = new Date(post.createdAt);

    postContainer.innerHTML = `
      <div class="post-detail-card">
        <div class="post-header">
          <div class="post-author">
            <img src="${post.userAvatar || "/images/default-avatar.svg"}" alt="${post.userName}" class="author-avatar">
            <div class="author-info">
              <h4 class="author-name">${post.userName}</h4>
              <span class="post-time">${createdAt.toLocaleString("vi-VN")}</span>
            </div>
          </div>
          ${
            isOwner
              ? `<div class="post-actions-owner">
              <button class="edit-post-btn" id="editPostBtn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-width="2" stroke-linecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Chỉnh sửa
              </button>
              <button class="delete-post-btn" id="deletePostBtn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Xóa bài
              </button>
            </div>`
              : ""
          }
        </div>
        <div class="post-content">
          <p class="post-text">${escapeHtml(post.content || "").replace(/\n/g, "<br>")}</p>
          ${
            post.images && post.images.length > 0
              ? `
            <div class="post-images-container">
              <button class="image-nav-btn prev" data-target="post-images-${post.id}" aria-label="Ảnh trước">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <div class="post-images" id="post-images-${post.id}">
                ${post.images
                  .map(
                    (img) => {
                      const imgUrl = getImageUrl(img);
                      return `<img src="${imgUrl}" alt="Post image" class="post-image" onclick="openImageModal('${imgUrl}', 'post-images-${post.id}')">`;
                    }
                  )
                  .join("")}
              </div>
              <button class="image-nav-btn next" data-target="post-images-${post.id}" aria-label="Ảnh tiếp theo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          `
              : ""
          }
          ${
            post.videos && post.videos.length > 0
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
        <div class="post-stats">
          <div class="post-actions">
            <button class="like-btn" id="likePostBtn" data-post-id="${post.id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="like-count">${post.likeCount || 0}</span>
            </button>
            <span class="comment-count">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ${post.commentCount || 0} bình luận
            </span>
            <button class="share-post-btn" id="sharePostBtn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Xử lý chỉnh sửa bài đăng
    const editBtn = document.getElementById("editPostBtn");
    editBtn?.addEventListener("click", () => {
      openEditPostModal(post);
    });

    // Xử lý xóa bài đăng
    const deleteBtn = document.getElementById("deletePostBtn");
    deleteBtn?.addEventListener("click", async () => {
      if (confirm("Bạn có chắc muốn xóa bài đăng này?")) {
        try {
          await qnaService.deletePost(postId);
          showToast("Đã xóa bài đăng", "success");
          window.location.hash = "/qna";
        } catch (error) {
          showToast(error.message || "Không thể xóa bài đăng", "error");
        }
      }
    });

    // Xử lý like
    const likeBtn = document.getElementById("likePostBtn");
    if (user) {
      const liked = await qnaService.checkUserLiked(postId);
      if (liked) {
        likeBtn.classList.add("liked");
      }
    }
    
    likeBtn?.addEventListener("click", async () => {
      if (!user) {
        showToast("Vui lòng đăng nhập để thích bài đăng", "error");
        return;
      }
      await handleLike(postId, likeBtn);
    });

    // Xử lý chia sẻ
    const shareBtn = document.getElementById("sharePostBtn");
    shareBtn?.addEventListener("click", () => {
      const url = `${window.location.origin}/#/qna/${postId}`;
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

    // Xử lý mũi tên điều hướng ảnh
    setupImageNavigation();
  } catch (error) {
    console.error("Load post detail error:", error);
    postContainer.innerHTML = `
      <div class="error-state">
        <p>Không thể tải bài đăng</p>
        <button onclick="window.location.hash='/qna'" class="btn-primary">Quay lại</button>
      </div>
    `;
  } finally {
    loadingIndicator.style.display = "none";
  }
}

function loadComments(postId) {
  const commentsContainer = document.getElementById("commentsList");
  const loadingIndicator = document.getElementById("commentsLoading");

  loadingIndicator.style.display = "block";

  // Load comments from API
  qnaService.getComments(postId).then((comments) => {
    loadingIndicator.style.display = "none";

    
    if (comments.length === 0) {
      commentsContainer.innerHTML = `
        <div class="empty-comments">
          <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      `;
      return;
    }

    commentsContainer.innerHTML = comments
      .map((comment) => createCommentElement(comment, postId))
      .join("");

    // Display replies for each comment (already normalized in comment object)
    comments.forEach((comment) => {
      const repliesContainer = document.getElementById(`replies-${comment.id}`);
      if (!repliesContainer) return;
      
      if (comment.replies && comment.replies.length > 0) {
        repliesContainer.innerHTML = comment.replies
          .map((reply) => createReplyElement(reply, comment.id, postId))
          .join("");
        
        // Attach delete handlers for replies
        comment.replies.forEach((reply) => {
          const deleteBtn = document.getElementById(`deleteReply-${reply.id}`);
          deleteBtn?.addEventListener("click", async () => {
            if (confirm("Bạn có chắc muốn xóa phản hồi này?")) {
              await deleteReply(reply.id, comment.id, postId);
            }
          });
        });
      }
    });

    // Attach delete handlers
    comments.forEach((comment) => {
      const deleteBtn = document.getElementById(`deleteComment-${comment.id}`);
      deleteBtn?.addEventListener("click", async () => {
        if (confirm("Bạn có chắc muốn xóa bình luận này?")) {
          await deleteComment(comment.id, postId);
        }
      });
    });

    // Attach like handlers
    comments.forEach(async (comment) => {
      const likeBtn = document.querySelector(`.comment-like-btn[data-comment-id="${comment.id}"]`);
      if (likeBtn) {
        const user = authService.getCurrentUser();
        if (user) {
          const liked = await qnaService.checkCommentLiked(comment.id);
          if (liked) {
            likeBtn.classList.add("liked");
          }
        }
        
        likeBtn.addEventListener("click", async () => {
          if (!user) {
            showToast("Vui lòng đăng nhập để thích bình luận", "error");
            return;
          }
          await handleCommentLike(comment.id, likeBtn);
        });
      }
    });

    // Attach reply handlers
    comments.forEach((comment) => {
      const replyBtn = document.querySelector(`.comment-reply-btn[data-comment-id="${comment.id}"]`);
      const replyForm = document.getElementById(`replyForm-${comment.id}`);
      
      replyBtn?.addEventListener("click", () => {
        const user = authService.getCurrentUser();
        if (!user) {
          showToast("Vui lòng đăng nhập để trả lời", "error");
          return;
        }
        replyForm.style.display = replyForm.style.display === "none" ? "block" : "none";
      });

      const cancelBtn = replyForm?.querySelector(".btn-cancel-reply");
      cancelBtn?.addEventListener("click", () => {
        replyForm.style.display = "none";
        replyForm.querySelector(".reply-input").value = "";
      });

      const submitBtn = replyForm?.querySelector(".btn-submit-reply");
      submitBtn?.addEventListener("click", async () => {
        const replyInput = replyForm.querySelector(".reply-input");
        const content = replyInput.value.trim();
        if (!content) {
          showToast("Vui lòng nhập nội dung phản hồi", "error");
          return;
        }
        try {
          submitBtn.disabled = true;
          const originalText = submitBtn.textContent;
          submitBtn.textContent = "Gửi...";
          await submitReply(comment.id, postId, content, replyInput, replyForm);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Gửi";
          }
        }
      });
    });

    // Xử lý mũi tên điều hướng ảnh trong comments
    setupImageNavigation();
  }).catch((error) => {
    loadingIndicator.style.display = "none";
    console.error("Load comments error:", error);
    commentsContainer.innerHTML = `
      <div class="error-state">
        <p>Không thể tải bình luận</p>
      </div>
    `;
  });
}

function createCommentElement(comment, postId) {
  const user = authService.getCurrentUser();
  // Compare as strings to handle both string and number IDs
  const isOwner = user && String(user.id) === String(comment.userId);

  const createdAt = new Date(comment.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  return `
    <div class="comment-item" data-comment-id="${comment.id}">
      <img src="${comment.userAvatar || "/images/default-avatar.svg"}" alt="${comment.userName}" class="comment-avatar">
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${comment.userName}</span>
          <span class="comment-time">${timeAgo}</span>
          ${
            isOwner
              ? `<button class="delete-comment-btn" id="deleteComment-${comment.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>`
              : ""
          }
        </div>
        <p class="comment-text">${escapeHtml(comment.content)}</p>
        ${
          comment.images && comment.images.length > 0
            ? `
          <div class="comment-images-container">
            <button class="comment-nav-btn prev" data-target="comment-images-${comment.id}" aria-label="Ảnh trước">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <div class="comment-images" id="comment-images-${comment.id}">
              ${comment.images
                .map(
                  (img) => {
                    const imgUrl = getImageUrl(img);
                    return `<img src="${imgUrl}" alt="Comment image" class="comment-image" onclick="openImageModal('${imgUrl}', 'comment-images-${comment.id}')">`;
                  }
                )
                .join("")}
            </div>
            <button class="comment-nav-btn next" data-target="comment-images-${comment.id}" aria-label="Ảnh tiếp theo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        `
            : ""
        }
        ${
          comment.videos && comment.videos.length > 0
            ? `
          <div class="comment-videos">
            ${comment.videos
              .map(
                (video) => {
                  const videoUrl = getVideoUrl(video);
                  return `
              <video controls class="comment-video" preload="metadata">
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
        <div class="comment-actions">
          <button class="comment-like-btn" data-comment-id="${comment.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="comment-like-count">${comment.likeCount || 0}</span>
          </button>
          <button class="comment-reply-btn" data-comment-id="${comment.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Trả lời
          </button>
        </div>
        <div class="reply-form" id="replyForm-${comment.id}" style="display: none;">
          <textarea class="reply-input" placeholder="Viết phản hồi..." rows="2" maxlength="500"></textarea>
          <div class="reply-form-actions">
            <button class="btn-cancel-reply">Hủy</button>
            <button class="btn-submit-reply">Gửi</button>
          </div>
        </div>
        <div class="replies-container" id="replies-${comment.id}"></div>
      </div>
    </div>
  `;
}

async function submitComment(postId) {
  const user = authService.getCurrentUser();
  if (!user) {
    showToast("Bạn cần đăng nhập để bình luận", "error");
    return;
  }

  const commentInput = document.getElementById("commentInput");
  const commentImages = document.getElementById("commentImages");
  const commentVideos = document.getElementById("commentVideos");
  const submitBtn = document.getElementById("submitCommentBtn");
  const content = commentInput.value.trim();

  if (!content) {
    showToast("Vui lòng nhập nội dung bình luận", "error");
    return;
  }

  try {
    submitBtn.disabled = true;

    // Compress images client-side before sending to qnaService
    const rawImages = commentImages ? Array.from(commentImages.files) : [];
    const processedImages = [];
    for (const file of rawImages) {
      if (file.size > 500 * 1024) {
        try {
          const compressed = await qnaService.compressImage(file, 500 * 1024);
          processedImages.push(compressed);
        } catch (err) {
          console.error("Failed to compress comment image, using original:", err);
          processedImages.push(file);
        }
      } else {
        processedImages.push(file);
      }
    }

    const commentData = {
      content,
      images: processedImages,
      videos: commentVideos ? Array.from(commentVideos.files) : [],
    };

    await qnaService.addComment(postId, commentData);

    commentInput.value = "";
    if (commentImages) commentImages.value = "";
    if (commentVideos) commentVideos.value = "";
    
    // Clear previews
    const imagePreview = document.getElementById("commentImagePreview");
    const videoPreview = document.getElementById("commentVideoPreview");
    if (imagePreview) imagePreview.innerHTML = "";
    if (videoPreview) videoPreview.innerHTML = "";

    showToast("Đã thêm bình luận", "success");
    
    // Reload comments to show the new one (cache already cleared in service)
    // Wait a bit for API to update
    setTimeout(() => {
      loadComments(postId);
    }, 500);
  } catch (error) {
    console.error("Submit comment error:", error);
    showToast(error.message || "Không thể thêm bình luận", "error");
  } finally {
    submitBtn.disabled = false;
  }
}

async function deleteComment(commentId, postId) {
  try {
    await qnaService.deleteComment(commentId, postId);
    showToast("Đã xóa bình luận", "success");
    
    // Reload comments (cache already cleared in service)
    setTimeout(() => {
      loadComments(postId);
    }, 500);
  } catch (error) {
    console.error("Delete comment error:", error);
    showToast(error.message || "Không thể xóa bình luận", "error");
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

async function handleCommentLike(commentId, likeBtn) {
  try {
    const result = await qnaService.toggleCommentLike(commentId);
    const likeCount = likeBtn.querySelector(".comment-like-count");
    
    if (result.liked) {
      likeBtn.classList.add("liked");
    } else {
      likeBtn.classList.remove("liked");
    }
    
    likeCount.textContent = result.likeCount;
  } catch (error) {
    console.error("Comment like error:", error);
    showToast(error.message || "Không thể thích bình luận", "error");
  }
}

async function submitReply(commentId, postId, content, replyInput, replyForm) {
  try {
    await qnaService.addReply(commentId, postId, content);
    showToast("Đã thêm phản hồi", "success");
    replyInput.value = "";
    replyForm.style.display = "none";
    
    // Reload comments to show new reply (cache already cleared in service)
    setTimeout(() => {
      loadComments(postId);
    }, 500);
  } catch (error) {
    console.error("Submit reply error:", error);
    showToast(error.message || "Không thể thêm phản hồi", "error");
  }
}

function createReplyElement(reply, commentId, postId) {
  const user = authService.getCurrentUser();
  // Compare as strings to handle both string and number IDs
  const isOwner = user && String(user.id) === String(reply.userId);

  const createdAt = new Date(reply.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  return `
    <div class="reply-item" data-reply-id="${reply.id}">
      <img src="${reply.userAvatar || "/images/default-avatar.svg"}" alt="${reply.userName}" class="reply-avatar">
      <div class="reply-content">
        <div class="reply-header">
          <span class="reply-author">${reply.userName}</span>
          <span class="reply-time">${timeAgo}</span>
          ${
            isOwner
              ? `<button class="delete-reply-btn" id="deleteReply-${reply.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>`
              : ""
          }
        </div>
        <p class="reply-text">${escapeHtml(reply.content)}</p>
      </div>
    </div>
  `;
}

async function deleteReply(replyId, commentId, postId) {
  try {
    await qnaService.deleteReply(replyId, commentId);
    showToast("Đã xóa phản hồi", "success");
    
    // Reload comments (cache already cleared in service)
    setTimeout(() => {
      loadComments(postId);
    }, 500);
  } catch (error) {
    console.error("Delete reply error:", error);
    showToast(error.message || "Không thể xóa phản hồi", "error");
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

// Setup image navigation arrows
function setupImageNavigation() {
  const navButtons = document.querySelectorAll('.image-nav-btn, .comment-nav-btn');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.target;
      const container = document.getElementById(targetId);
      if (!container) return;

      const scrollAmount = 310; // Width of image + gap
      const isPrev = btn.classList.contains('prev');
      
      if (isPrev) {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }

      // Update button states after scroll
      setTimeout(() => updateNavButtonStates(container), 100);
    });
  });

  // Update initial button states
  document.querySelectorAll('.post-images, .comment-images').forEach(container => {
    updateNavButtonStates(container);
    
    // Update on scroll
    container.addEventListener('scroll', () => {
      updateNavButtonStates(container);
    });
  });
}

function updateNavButtonStates(container) {
  const prevBtn = document.querySelector(`[data-target="${container.id}"].prev`);
  const nextBtn = document.querySelector(`[data-target="${container.id}"].next`);
  
  if (!prevBtn || !nextBtn) return;

  // Disable prev if at start
  if (container.scrollLeft <= 0) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  // Disable next if at end
  const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
  if (isAtEnd) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

// Global function for image modal with navigation
window.openImageModal = function (imageUrl, imageContainer) {
  // Get all images from the container
  let images = [];
  let currentIndex = 0;
  
  if (imageContainer) {
    const container = typeof imageContainer === 'string' 
      ? document.getElementById(imageContainer) 
      : imageContainer;
    
    if (container) {
      const imgElements = container.querySelectorAll('.post-image, .comment-image');
      images = Array.from(imgElements).map(img => img.src);
      currentIndex = images.indexOf(imageUrl);
      if (currentIndex === -1) currentIndex = 0;
    }
  }
  
  // If no images found, just show single image
  if (images.length === 0) {
    images = [imageUrl];
    currentIndex = 0;
  }

  const modal = document.createElement("div");
  modal.className = "image-modal";
  
  const showImage = (index) => {
    const modalContent = modal.querySelector('.image-modal-content');
    const img = modalContent.querySelector('img');
    const counter = modalContent.querySelector('.image-counter');
    const prevBtn = modalContent.querySelector('.modal-nav-prev');
    const nextBtn = modalContent.querySelector('.modal-nav-next');
    
    img.src = images[index];
    currentIndex = index;
    
    if (counter && images.length > 1) {
      counter.textContent = `${index + 1} / ${images.length}`;
    }
    
    // Update button states
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === images.length - 1;
  };
  
  modal.innerHTML = `
    <button class="close-image-modal" aria-label="Đóng">&times;</button>
    ${images.length > 1 ? `
      <button class="modal-nav-btn modal-nav-prev" aria-label="Ảnh trước">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button class="modal-nav-btn modal-nav-next" aria-label="Ảnh tiếp theo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      <div class="image-counter">${currentIndex + 1} / ${images.length}</div>
    ` : ''}
    <div class="image-modal-content">
      <img src="${images[currentIndex]}" alt="Full size image">
    </div>
  `;

  document.body.appendChild(modal);

  // Navigation handlers
  if (images.length > 1) {
    const prevBtn = modal.querySelector('.modal-nav-prev');
    const nextBtn = modal.querySelector('.modal-nav-next');
    
    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        showImage(currentIndex - 1);
      }
    });
    
    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentIndex < images.length - 1) {
        showImage(currentIndex + 1);
      }
    });
    
    // Keyboard navigation
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        showImage(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        showImage(currentIndex + 1);
      } else if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleKeyPress);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    // Clean up on close
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('close-image-modal')) {
        document.removeEventListener('keydown', handleKeyPress);
        modal.remove();
      }
    });
  } else {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('close-image-modal')) {
        modal.remove();
      }
    });
  }
};

// Open edit post modal
function openEditPostModal(post) {
  const modal = document.createElement("div");
  modal.className = "edit-post-modal";
  modal.id = "editPostModal";
  
  // Handle null/undefined content
  const postContent = post.content && post.content !== "null" ? post.content : "";
  
  modal.innerHTML = `
    <div class="edit-post-modal-content">
      <div class="edit-post-modal-header">
        <h3>Chỉnh sửa bài đăng</h3>
        <button class="close-edit-modal" aria-label="Đóng">&times;</button>
      </div>
      <form id="editPostForm" class="edit-post-form">
        <div class="form-group">
          <label for="editPostContent">Nội dung (Content)</label>
          <textarea 
            id="editPostContent" 
            name="content" 
            rows="6" 
            maxlength="2000" 
            placeholder="Nhập nội dung..."
            required
          >${postContent ? escapeHtml(postContent) : ''}</textarea>
          <div class="char-count">
            <span id="editCharCount">${postContent.length}</span>/2000
          </div>
        </div>
        
        <div class="form-group">
          <label>Hình ảnh hiện tại (click để thay thế)</label>
          <div class="current-images" id="currentImages">
            ${post.images && post.images.length > 0 
              ? post.images.map((img) => `
                <div class="current-image-item" data-image-id="${img.id}">
                  <img src="${getImageUrl(img)}" alt="Current image">
                  <div class="image-overlay">
                    <button type="button" class="btn-replace-image" data-image-id="${img.id}">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-width="2"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                      </svg>
                      Thay ảnh
                    </button>
                  </div>
                  <input 
                    type="file" 
                    class="hidden-file-input" 
                    id="replaceImage${img.id}" 
                    accept="image/*"
                    data-image-id="${img.id}"
                    style="display: none;"
                  >
                </div>
              `).join('')
              : '<p class="no-images">Chưa có hình ảnh</p>'
            }
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" id="cancelEditBtn">Hủy</button>
          <button type="submit" class="btn-submit" id="submitEditBtn">
            <span class="btn-text">Cập nhật</span>
            <span class="btn-loading" style="display: none;">
              <i class="fas fa-spinner fa-spin"></i> Đang cập nhật...
            </span>
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Character count
  const contentTextarea = document.getElementById("editPostContent");
  const charCount = document.getElementById("editCharCount");
  contentTextarea?.addEventListener("input", () => {
    charCount.textContent = contentTextarea.value.length;
  });

  // Handle replace image buttons
  const replaceImageBtns = modal.querySelectorAll(".btn-replace-image");
  replaceImageBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const imageId = btn.dataset.imageId;
      const fileInput = document.getElementById(`replaceImage${imageId}`);
      fileInput?.click();
    });
  });

  // Handle file input changes for replacing images
  const fileInputs = modal.querySelectorAll(".hidden-file-input");
  fileInputs.forEach(input => {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const imageId = input.dataset.imageId;
      const imageItem = modal.querySelector(`.current-image-item[data-image-id="${imageId}"]`);
      
      if (imageItem) {
        // Show preview of new image
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = imageItem.querySelector("img");
          img.src = e.target.result;
          
          // Add indicator that this image will be replaced
          imageItem.classList.add("will-replace");
          const overlay = imageItem.querySelector(".image-overlay");
          overlay.innerHTML = `
            <span class="replace-indicator">✓ Sẽ thay ảnh mới</span>
          `;
        };
        reader.readAsDataURL(file);
      }
    });
  });

  // Close modal handlers
  const closeBtn = modal.querySelector(".close-edit-modal");
  const cancelBtn = document.getElementById("cancelEditBtn");
  
  const closeModal = () => {
    modal.remove();
  };
  
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Submit form
  const form = document.getElementById("editPostForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitEditPost(post.id, form, modal);
  });
}

async function submitEditPost(postId, form, modal) {
  const submitBtn = document.getElementById("submitEditBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");
  
  try {
    submitBtn.disabled = true;
    btnText.style.display = "none";
    btnLoading.style.display = "inline-block";

    const formData = new FormData(form);
    const content = formData.get("content").trim();
    
    if (!content) {
      showToast("Vui lòng nhập nội dung bài đăng", "error");
      submitBtn.disabled = false;
      btnText.style.display = "inline-block";
      btnLoading.style.display = "none";
      return;
    }

    // Collect replaced images with their IDs and compress them if needed
    const replacedImages = {};
    const fileInputs = modal.querySelectorAll(".hidden-file-input");
    for (const input of Array.from(fileInputs)) {
      if (input.files && input.files.length > 0) {
        const imageId = input.dataset.imageId;
        const file = input.files[0];
        if (file.size > 500 * 1024) {
          try {
            const compressed = await qnaService.compressImage(file, 500 * 1024);
            replacedImages[imageId] = compressed;
          } catch (err) {
            console.error("Failed to compress replaced image, using original:", err);
            replacedImages[imageId] = file;
          }
        } else {
          replacedImages[imageId] = file;
        }
      }
    }

    const postData = {
      content,
      replacedImages,
    };
    
    const result = await qnaService.updatePost(postId, postData);
    
    showToast("Đã cập nhật bài đăng thành công!", "success");
    modal.remove();
    api.clearCache();
    
    setTimeout(() => {
      window.location.hash = "/qna";
    }, 500);
  } catch (error) {
    console.error("Submit edit post error:", error);
    showToast(error.message || "Không thể cập nhật bài đăng", "error");
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = "inline-block";
    btnLoading.style.display = "none";
  }
}
