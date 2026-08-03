// Pagination utility for list views
export class Pagination {
  constructor(options = {}) {
    this.currentPage = 1;
    this.itemsPerPage = options.itemsPerPage || 10;
    this.maxVisiblePages = options.maxVisiblePages || 5;
    this.onPageChange = options.onPageChange || (() => {});
  }

  // Get paginated items
  getPaginatedItems(items) {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  // Get total pages
  getTotalPages(totalItems) {
    return Math.ceil(totalItems / this.itemsPerPage);
  }

  // Go to specific page
  goToPage(page, totalItems) {
    const totalPages = this.getTotalPages(totalItems);
    if (page < 1 || page > totalPages) return;
    
    this.currentPage = page;
    this.onPageChange(page);
  }

  // Go to next page
  nextPage(totalItems) {
    const totalPages = this.getTotalPages(totalItems);
    if (this.currentPage < totalPages) {
      this.goToPage(this.currentPage + 1, totalItems);
    }
  }

  // Go to previous page
  prevPage(totalItems) {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1, totalItems);
    }
  }

  // Reset to first page
  reset() {
    this.currentPage = 1;
  }

  // Render pagination controls
  render(totalItems, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = this.getTotalPages(totalItems);
    
    if (totalPages <= 1) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';

    // Calculate visible page range
    let startPage = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + this.maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < this.maxVisiblePages) {
      startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
    }

    const pages = [];
    
    // Previous button
    pages.push(`
      <button 
        class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
        onclick="window.paginationInstance_${containerId}.prevPage(${totalItems})"
        ${this.currentPage === 1 ? 'disabled' : ''}
      >
        <i class="fas fa-chevron-left"></i>
      </button>
    `);

    // First page
    if (startPage > 1) {
      pages.push(`
        <button 
          class="pagination-btn" 
          onclick="window.paginationInstance_${containerId}.goToPage(1, ${totalItems})"
        >
          1
        </button>
      `);
      if (startPage > 2) {
        pages.push('<span class="pagination-ellipsis">...</span>');
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(`
        <button 
          class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
          onclick="window.paginationInstance_${containerId}.goToPage(${i}, ${totalItems})"
        >
          ${i}
        </button>
      `);
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('<span class="pagination-ellipsis">...</span>');
      }
      pages.push(`
        <button 
          class="pagination-btn" 
          onclick="window.paginationInstance_${containerId}.goToPage(${totalPages}, ${totalItems})"
        >
          ${totalPages}
        </button>
      `);
    }

    // Next button
    pages.push(`
      <button 
        class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
        onclick="window.paginationInstance_${containerId}.nextPage(${totalItems})"
        ${this.currentPage === totalPages ? 'disabled' : ''}
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    `);

    // Info text
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);
    
    container.innerHTML = `
      <div class="pagination-info">
        Hiển thị <strong>${startItem}-${endItem}</strong> trong tổng số <strong>${totalItems}</strong> kết quả
      </div>
      <div class="pagination-controls">
        ${pages.join('')}
      </div>
    `;

    // Store instance globally for onclick handlers
    window[`paginationInstance_${containerId}`] = this;
  }
}
