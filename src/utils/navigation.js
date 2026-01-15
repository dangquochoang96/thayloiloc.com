// Global navigation functions

// Global function for navigation
export function navigateTo(path) {
  window.location.hash = path;
}

// Global function for viewing news detail
export function viewNewsDetail(newsId) {
  console.log('View news detail:', newsId);
  navigateTo(`/news/${newsId}`);
}

// Make functions available globally
window.navigateTo = navigateTo;
window.viewNewsDetail = viewNewsDetail;