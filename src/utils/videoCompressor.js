/**
 * Video Compressor Utility
 * Compress video files before upload to reduce file size
 */

/**
 * Compress video file using HTML5 Canvas and MediaRecorder API
 * @param {File} file - Original video file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1280)
 * @param {number} options.maxHeight - Maximum height (default: 720)
 * @param {number} options.quality - Video quality 0-1 (default: 0.7)
 * @param {number} options.fps - Frames per second (default: 30)
 * @param {number} options.videoBitrate - Video bitrate in bps (default: 2500000 = 2.5Mbps)
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<File>} Compressed video file
 */
export async function compressVideo(file, options = {}, onProgress = null) {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.7,
    fps = 30,
    videoBitrate = 2000000 // 2 Mbps (good balance of quality and size)
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    
    // Style and append video element to DOM as a "visible" element to prevent background throttling
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '300px';
    video.style.height = '200px';
    video.style.opacity = '0.01';
    video.style.zIndex = '-9999';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    
    let intervalId = null;
    let isFinished = false;
    
    const cleanup = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
      try {
        URL.revokeObjectURL(video.src);
      } catch (e) {
        console.warn("Failed to revoke object URL:", e);
      }
    };
    
    video.onloadedmetadata = async () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw the initial frame immediately
        ctx.drawImage(video, 0, 0, width, height);
        
        // Check if MediaRecorder supports video encoding
        const mimeType = getSupportedMimeType();
        if (!mimeType) {
          cleanup();
          reject(new Error('Browser không hỗ trợ nén video'));
          return;
        }
        
        // Capture video track from Canvas
        const stream = canvas.captureStream(fps);
        
        // Capture audio track from Video element and add to stream (maintains audio)
        try {
          const videoStream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null);
          if (videoStream) {
            const audioTracks = videoStream.getAudioTracks();
            if (audioTracks && audioTracks.length > 0) {
              stream.addTrack(audioTracks[0]);
                          }
          }
        } catch (audioErr) {
          console.warn("Failed to capture/add audio track:", audioErr);
        }
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: videoBitrate
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          cleanup();
          
          const blob = new Blob(chunks, { type: mimeType });
          const compressedFile = new File(
            [blob],
            file.name,
            { type: file.type }
          );
          
                    resolve(compressedFile);
        };
        
        mediaRecorder.onerror = (error) => {
          cleanup();
          reject(error);
        };
        
        // Function to stop recording with a slight delay to flush encoder
        const stopRecording = () => {
          if (isFinished) return;
          isFinished = true;
          
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          
          // Wait 300ms to ensure the final frames are processed and saved
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 300);
        };
        
        video.currentTime = 0;
        
        video.onplay = () => {
          mediaRecorder.start();
          
          const duration = video.duration || 1;
          
          intervalId = setInterval(() => {
            if (video.ended || video.currentTime >= duration) {
              stopRecording();
              return;
            }
            
            // If video is temporarily paused or buffering, do not draw and do not stop
            if (video.paused) {
              return;
            }
            
            ctx.drawImage(video, 0, 0, width, height);
            
            // Report progress
            if (onProgress) {
              const progress = Math.min(100, (video.currentTime / duration) * 100);
              onProgress(progress);
            }
          }, 1000 / fps);
        };
        
        video.onpause = () => {
          // Auto-resume playback if paused during compression (unless finished or ended)
          if (!isFinished && !video.ended && video.currentTime < video.duration - 0.5) {
                        video.play().catch(err => console.warn("Failed to resume playback:", err));
          }
        };
        
        video.onended = () => {
          stopRecording();
        };
        
        // Play the video to start the process
        video.play().catch((playErr) => {
          cleanup();
          reject(new Error('Không thể phát video để nén: ' + playErr.message));
        });
        
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    
    video.onerror = () => {
      cleanup();
      reject(new Error('Không thể load video'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Get supported MIME type for MediaRecorder
 * @returns {string|null} Supported MIME type
 */
function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264',
    'video/webm',
    'video/mp4'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return null;
}

/**
 * Simple video compression by reducing resolution and bitrate
 * Faster and maintains original aspect ratio
 * @param {File} file - Original video file
 * @param {number} maxSizeMB - Maximum size in MB (default: 50)
 * @returns {Promise<File>} Compressed video or original if already small
 */
export async function compressVideoSimple(file, maxSizeMB = 50) {
  const fileSizeMB = file.size / 1024 / 1024;
  
  // If file is already small enough, return as is
  if (fileSizeMB <= maxSizeMB) {
        return file;
  }
  
    
  // Calculate compression ratio
  const ratio = maxSizeMB / fileSizeMB;
  
  // Adjust quality and resolution based on ratio
  let quality = 0.8;
  let maxWidth = 1920;
  let maxHeight = 1080;
  let videoBitrate = 3000000; // 3 Mbps
  
  if (ratio < 0.3) {
    // Need heavy compression
    quality = 0.6;
    maxWidth = 1280;
    maxHeight = 720;
    videoBitrate = 1500000; // 1.5 Mbps
  } else if (ratio < 0.5) {
    // Medium compression
    quality = 0.7;
    maxWidth = 1280;
    maxHeight = 720;
    videoBitrate = 2000000; // 2 Mbps
  } else if (ratio < 0.8) {
    // Light compression
    quality = 0.75;
    maxWidth = 1920;
    maxHeight = 1080;
    videoBitrate = 2500000; // 2.5 Mbps
  }
  
  return compressVideo(file, {
    maxWidth,
    maxHeight,
    quality,
    videoBitrate
  });
}

/**
 * Check if video file is too large and needs compression
 * @param {File} file - Video file
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} True if needs compression
 */
export function needsCompression(file, maxSizeMB = 50) {
  return (file.size / 1024 / 1024) > maxSizeMB;
}

/**
 * Get video file info
 * @param {File} file - Video file
 * @returns {Promise<Object>} Video info (width, height, duration, size)
 */
export async function getVideoInfo(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        sizeMB: (file.size / 1024 / 1024).toFixed(2),
        sizeBytes: file.size
      });
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      reject(new Error('Cannot load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}
