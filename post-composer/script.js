document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const checkboxes = document.querySelectorAll('input[name="platform"]');
    const contentInput = document.getElementById('post-content');
    const imageUpload = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview');
    const publishBtn = document.getElementById('publish-btn');
    
    // Platform specific fields
    const youtubeFields = document.getElementById('youtube-fields');
    const websiteFields = document.getElementById('website-fields');
    const titleInput = document.getElementById('post-title');
    const videoUrlInput = document.getElementById('video-url');
    const categorySelect = document.getElementById('post-category');

    // === Application State (Draft) ===
    let postData = {
        platforms: ['website'], // default
        content: '',
        images: [], // array to hold base64 image strings
        title: '',
        category: '',
        videoUrl: ''
    };

    // === Platform Updating Logic ===
    const updatePlatformFields = () => {
        const isYoutube = postData.platforms.includes('youtube');
        const isWebsite = postData.platforms.includes('website');

        youtubeFields.style.display = isYoutube ? 'block' : 'none';
        websiteFields.style.display = isWebsite ? 'block' : 'none';

        // Update checkboxes UI
        checkboxes.forEach(cb => {
            cb.checked = postData.platforms.includes(cb.value);
        });
    };

    // === Draft Management ===
    // 1. Load draft from localStorage when page loads
    const loadDraft = () => {
        const savedDraft = localStorage.getItem('postDraft');
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                
                // Migrate from platform string to platforms array
                if (parsedDraft.platform && !parsedDraft.platforms) {
                    if (parsedDraft.platform === 'website_facebook') {
                        parsedDraft.platforms = ['website', 'facebook'];
                    } else {
                        parsedDraft.platforms = [parsedDraft.platform];
                    }
                    delete parsedDraft.platform;
                }

                postData = { ...postData, ...parsedDraft };
                
                // Populate UI with draft data
                contentInput.value = postData.content || '';
                titleInput.value = postData.title || '';
                videoUrlInput.value = postData.videoUrl || '';
                categorySelect.value = postData.category || '';
                
                // Update platform fields
                updatePlatformFields();

                // Render saved images
                renderImagePreviews();
            } catch (e) {
                console.error("Failed to parse draft data:", e);
            }
        } else {
            updatePlatformFields();
        }
    };

    // 2. Save current state to localStorage
    const saveDraft = () => {
        postData.content = contentInput.value;
        postData.title = titleInput.value;
        postData.videoUrl = videoUrlInput.value;
        postData.category = categorySelect.value;
        
        localStorage.setItem('postDraft', JSON.stringify(postData));
    };

    // Add change listeners to checkboxes
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
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

    // === Auto-Save Listeners ===
    // Listen to text/select inputs to trigger auto-save
    const inputs = [contentInput, titleInput, videoUrlInput, categorySelect];
    inputs.forEach(input => {
        input.addEventListener('input', saveDraft);
    });

    // Helper to compress and resize an image file client-side
    const compressImage = (file, maxSize = 500 * 1024) => {
        return new Promise((resolve) => {
            // If the file is already small enough, just convert to base64
            if (file.size <= maxSize) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
                return;
            }

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

                        // Convert to base64 with jpeg compression quality 0.7
                        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                        resolve(compressedBase64);
                    } catch (err) {
                        console.error("Canvas compression failed, returning original file as base64:", err);
                        resolve(e.target.result);
                    }
                };
                img.onerror = () => {
                    console.error("Image loading failed, returning original file as base64");
                    resolve(e.target.result);
                };
                img.src = e.target.result;
            };
            reader.onerror = () => {
                console.error("FileReader failed");
                resolve(null);
            };
            reader.readAsDataURL(file);
        });
    };

    // === Image Upload & Processing ===
    imageUpload.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        // Convert each selected file to Base64 (compressing/resizing if too large)
        for (const file of Array.from(files)) {
            if (file.type.startsWith('image/')) {
                const base64String = await compressImage(file);
                if (base64String) {
                    postData.images.push(base64String); // Store base64 in state
                    renderImagePreviews(); // Update UI
                    saveDraft(); // Auto save
                }
            } else {
                // For non-image files, read as regular base64
                const reader = new FileReader();
                reader.onload = (event) => {
                    postData.images.push(event.target.result);
                    renderImagePreviews();
                    saveDraft();
                };
                reader.readAsDataURL(file);
            }
        }
        
        // Reset file input so the user can select the same file again if they deleted it
        imageUpload.value = ''; 
    });


    // === Render Image Previews ===
    const renderImagePreviews = () => {
        // Clear current previews
        imagePreviewContainer.innerHTML = '';
        
        postData.images.forEach((base64String, index) => {
            // Create wrapper
            const div = document.createElement('div');
            div.className = 'preview-item';
            
            // Create Image
            const img = document.createElement('img');
            img.src = base64String;
            
            // Create Remove Button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '✕';
            removeBtn.title = 'Xóa ảnh';
            removeBtn.onclick = () => removeImage(index);

            // Append to DOM
            div.appendChild(img);
            div.appendChild(removeBtn);
            imagePreviewContainer.appendChild(div);
        });
    };

    // Remove image from state and re-render
    const removeImage = (index) => {
        postData.images.splice(index, 1);
        renderImagePreviews();
        saveDraft(); // Auto save after removing
    };

    // === Publish Button Logic ===
    let isSubmitting = false;
    publishBtn.addEventListener('click', () => {
        if (isSubmitting) return;

        if (postData.platforms.length === 0) {
            alert("Vui lòng chọn ít nhất một nền tảng để đăng!");
            return;
        }

        isSubmitting = true;
        publishBtn.disabled = true;
        const originalText = publishBtn.textContent;
        publishBtn.textContent = "Đang đăng...";

        // Build final JSON payload based on selected platform
        const finalData = {
            platforms: postData.platforms,
            content: postData.content,
            images: postData.images
        };

        // Add platform specific fields
        if (postData.platforms.includes('youtube')) {
            finalData.title = postData.title;
            finalData.videoUrl = postData.videoUrl;
        } 
        if (postData.platforms.includes('website')) {
            finalData.category = postData.category;
        }

        // Log formatted JSON to console
        console.log("=== DỮ LIỆU ĐĂNG BÀI ===");
        console.log(JSON.stringify(finalData, null, 2));
        alert("Đã log dữ liệu ra console! Vui lòng nhấn F12 để kiểm tra.");

        setTimeout(() => {
            isSubmitting = false;
            publishBtn.disabled = false;
            publishBtn.textContent = originalText;
        }, 1000);
    });

    // === Initialize Application ===
    loadDraft();
});
