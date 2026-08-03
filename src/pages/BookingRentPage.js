import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { authService } from "../services/auth.service.js";
import { servicesService } from "../services/services.service.js";
import { productService } from "../services/product.service.js";
import { api } from "../services/api.js";
import { favoriteStore } from "../services/favorite.store.js";
import { SupportService } from "../services/support.service.js";
import { notificationService } from "../services/notification.service.js";
import { getImageUrl } from "../utils/helpers.js";

// Import HTML templates
import loginRequiredTemplate from "../templates/booking/login-required.html?raw";
import bookingFormTemplate from "../templates/booking/booking-form.html?raw";
import { renderCustomAddressSelectHTML, setupCustomAddressSelectListeners } from "../components/CustomAddressSelect.js";
import { renderTechnicianCards } from "../components/TechnicianCardSelect.js";

// Import CSS styles
import "../styles/booking/booking-form.css";

export function BookingRentPage() {
  const container = document.createElement("div");

  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "booking-main";
  main.style.cssText = `
    padding: 100px 0 60px;
    min-height: 70vh;
    background: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  `;

  // Create centered container
  const centeredContainer = document.createElement("div");
  centeredContainer.className = "booking-container";
  centeredContainer.style.cssText = `
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding: 0 20px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 40px;
  `;

  if (!authService.isAuthenticated()) {
    centeredContainer.innerHTML = loginRequiredTemplate;
    main.appendChild(centeredContainer);
    container.appendChild(main);
    container.appendChild(Footer());
    return container;
  }

  const user = authService.getUser();

  // Check for service selection from URL parameters
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const selectedServiceId = urlParams.get('service_id');
  const selectedServiceName = urlParams.get('service_name');
  const selectedTechId = urlParams.get('techId');
  const selectedTechName = urlParams.get('techName');
  const selectedTechPhone = urlParams.get('techPhone');

  const title = document.createElement("h1");
  title.textContent = selectedServiceName ? `Đặt Lịch - ${decodeURIComponent(selectedServiceName)}` : "Đặt Lịch Dịch Vụ Máy Thuê";
  title.style.cssText = `
    margin-bottom: 2rem;
    text-align: center;
    color: #1a1a2e;
    font-size: 2.2rem;
    font-weight: 700;
  `;
  centeredContainer.appendChild(title);

  // Show selected service info if available
  if (selectedServiceId && selectedServiceName) {
    const serviceInfo = document.createElement("div");
    serviceInfo.className = "selected-service-info";
    serviceInfo.style.cssText = `
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      padding: 20px;
      border-radius: 15px;
      margin-bottom: 30px;
      border-left: 5px solid #f97316;
      text-align: center;
    `;
    serviceInfo.innerHTML = `
      <h3 style="color: #f97316; margin-bottom: 10px;">
        <i class="fas fa-check-circle"></i> Dịch vụ đã chọn
      </h3>
      <p style="color: #333; font-weight: 500; margin: 0;">
        ${decodeURIComponent(selectedServiceName)}
      </p>
    `;
    centeredContainer.appendChild(serviceInfo);
  }

  // Show selected technician info box helper
  let techInfoCard = centeredContainer.querySelector('.selected-tech-info');

  const updateSelectedTechInfoBox = (tId, tName, tPhone) => {
    if (!tId || !tName) {
      if (techInfoCard) {
        techInfoCard.style.display = 'none';
      }
      return;
    }

    if (!techInfoCard) {
      techInfoCard = document.createElement("div");
      techInfoCard.className = "selected-tech-info";
      techInfoCard.style.cssText = `
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        padding: 20px;
        border-radius: 15px;
        margin-bottom: 30px;
        border-left: 5px solid #2196f3;
        text-align: center;
        cursor: pointer;
        transition: all 0.25s ease;
        box-shadow: 0 4px 14px rgba(33, 150, 243, 0.15);
      `;
      techInfoCard.title = "Bấm để xem thông tin chi tiết kỹ thuật viên";

      techInfoCard.addEventListener("mouseenter", () => {
        techInfoCard.style.transform = "translateY(-3px)";
        techInfoCard.style.boxShadow = "0 8px 22px rgba(33, 150, 243, 0.25)";
      });
      techInfoCard.addEventListener("mouseleave", () => {
        techInfoCard.style.transform = "none";
        techInfoCard.style.boxShadow = "0 4px 14px rgba(33, 150, 243, 0.15)";
      });

      const serviceInfo = centeredContainer.querySelector('.selected-service-info');
      if (serviceInfo && serviceInfo.nextSibling) {
        centeredContainer.insertBefore(techInfoCard, serviceInfo.nextSibling);
      } else if (title && title.nextSibling) {
        centeredContainer.insertBefore(techInfoCard, title.nextSibling);
      } else {
        centeredContainer.appendChild(techInfoCard);
      }
    }

    const decodedName = decodeURIComponent(tName);
    const decodedPhone = tPhone ? decodeURIComponent(tPhone) : '';

    techInfoCard.style.display = 'block';
    techInfoCard.innerHTML = `
      <h3 style="color: #2196f3; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <i class="fas fa-user-check"></i> Kỹ thuật viên đã chọn
      </h3>
      <p style="color: #1e293b; font-weight: 700; font-size: 1.15rem; margin: 5px 0;">
        ${decodedName}
      </p>
      ${decodedPhone ? `<p style="color: #475569; margin: 5px 0; font-weight: 500;">
        <i class="fas fa-phone"></i> ${decodedPhone}
      </p>` : ''}
      <div style="margin-top: 12px;">
        <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #0284c7; background: #ffffff; padding: 5px 14px; border-radius: 20px; font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
          <i class="fas fa-eye"></i> Bấm để xem chi tiết kỹ thuật viên <i class="fas fa-chevron-right" style="font-size: 0.75rem;"></i>
        </span>
      </div>
    `;

    techInfoCard.onclick = () => {
      window.location.hash = `#/technician-detail?id=${tId}`;
    };
  };

  // Show selected technician info if available initially
  if (selectedTechId && selectedTechName) {
    updateSelectedTechInfoBox(selectedTechId, selectedTechName, selectedTechPhone);
  }

  const formContainer = document.createElement("div");
  formContainer.innerHTML = bookingFormTemplate;
  const form = formContainer.querySelector("#booking-form");

  centeredContainer.appendChild(form);

  // Auto-populate type_task field if service is selected
  if (selectedServiceId) {
    const typeTaskField = form.querySelector('#type_task');
    if (typeTaskField) {
      typeTaskField.value = selectedServiceId;
    }
  }

  // Handle conditional service name field
  const typeTaskField = form.querySelector('#type_task');
  const serviceNameGroup = form.querySelector('#service-name-group');
  const serviceNameField = form.querySelector('#service_name');

  // Function to toggle service name field visibility
  const toggleServiceNameField = () => {
    if (typeTaskField.value === '6') { // 'Khác' option
      serviceNameGroup.style.display = 'block';
      serviceNameField.required = true;
    } else {
      serviceNameGroup.style.display = 'none';
      serviceNameField.required = false;
      serviceNameField.value = '';
    }
  };

  // Initial check
  toggleServiceNameField();

  // Listen for changes
  typeTaskField.addEventListener('change', toggleServiceNameField);

  // Add responsive styles
  const style = document.createElement("style");
  style.textContent = `
    .booking-main {
      padding: 100px 0 60px !important;
      min-height: 70vh !important;
      background: #f8f9fa !important;
      display: flex !important;
      justify-content: center !important;
      align-items: flex-start !important;
    }

    .booking-container {
      max-width: 800px !important;
      width: 100% !important;
      margin: 0 auto !important;
      background: white !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
      padding: 40px !important;
    }

    .booking-container h1 {
      text-align: center !important;
      color: #1a1a2e !important;
      font-size: 2.2rem !important;
      font-weight: 700 !important;
      margin-bottom: 2rem !important;
    }

    .selected-service-info {
      text-align: center !important;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9) !important;
      padding: 20px !important;
      border-radius: 15px !important;
      margin-bottom: 30px !important;
      border-left: 5px solid #f97316 !important;
    }
    
    #service-name-group {
      transition: all 0.3s ease;
    }
    
    #service_name {
      width: 100%;
      padding: 12px;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }
    
    #service_name:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    #service_name:required:valid {
      border-color: #10b981;
    }
    
    #service_name:required:invalid {
      border-color: #ef4444;
    }
    
    /* Image upload styles */
    .preview-item {
      position: relative;
      display: inline-block;
      margin: 5px;
      width: 100px;
      height: 100px;
    }
    
    .preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 2px solid #d1d5db;
    }
    
    .remove-image {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    
    .image-upload-container {
      border: 2px dashed #d1d5db;
      border-radius: var(--radius-md);
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.3s ease;
    }
    
    .image-upload-container.drag-over {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .booking-main {
        padding: 80px 0 40px !important;
      }
      
      .booking-container {
        margin: 0 15px !important;
        padding: 25px !important;
        border-radius: 15px !important;
      }
      
      .booking-container h1 {
        font-size: 1.8rem !important;
      }
    }

    @media (max-width: 480px) {
      .booking-container {
        margin: 0 10px !important;
        padding: 20px !important;
      }
      
      .booking-container h1 {
        font-size: 1.6rem !important;
      }
    }
  `;
  container.appendChild(style);

  // Add the centered container to main
  main.appendChild(centeredContainer);

  // Load danh sách sản phẩm
  const productSelect = form.querySelector("#product_id");
  const addressInput = form.querySelector("#address");
  const staffSelect = form.querySelector("#staff");
  const staffCardsContainer = form.querySelector("#staff-cards-container");
  const staffInfo = form.querySelector("#staff-info");
  const staffInfoName = form.querySelector("#staff-info-name");
  const staffInfoPhone = form.querySelector("#staff-info-phone");
  let staffData = []; // cache staff list for lookup
  let productsData = []; // Store products data with addresses

  // Dynamic address select setup for logged-in user
  const setupAddressSelect = () => {
    if (!addressInput) return;
    const addressGroup = addressInput.closest('.form-group');
    if (!addressGroup) return;

    let addressOptions = [];
    if (user && user.address) {
      addressOptions.push({ label: 'Địa chỉ tài khoản', value: user.address });
    }

    if (productsData && productsData.length > 0) {
      productsData.forEach(p => {
        if (p.address && typeof p.address === 'string' && p.address.trim()) {
          const trimmed = p.address.trim();
          if (!addressOptions.some(a => a.value.trim() === trimmed)) {
            addressOptions.push({
              label: `Địa chỉ thiết bị (${p.product?.name || p.name || 'Sản phẩm'})`,
              value: trimmed
            });
          }
        }
      });
    }

    let existingSelectGroup = form.querySelector('#booking-address-select-group');
    if (addressOptions.length > 0) {
      if (!existingSelectGroup) {
        existingSelectGroup = document.createElement('div');
        existingSelectGroup.id = 'booking-address-select-group';
        existingSelectGroup.style.marginBottom = '8px';
        addressGroup.insertBefore(existingSelectGroup, addressInput);
      }

      existingSelectGroup.innerHTML = renderCustomAddressSelectHTML({
        selectId: 'booking_address_select',
        addresses: addressOptions,
        selectedValue: addressInput.value
      });

      const selectElem = existingSelectGroup.querySelector('#booking_address_select');

      setupCustomAddressSelectListeners(existingSelectGroup, 'booking_address_select', (val) => {
        if (val === '__custom__') {
          addressInput.value = '';
          addressInput.focus();
        } else {
          addressInput.value = val;
        }
        const evt = new Event('input', { bubbles: true });
        addressInput.dispatchEvent(evt);
      });

      if (selectElem) {
        if (!addressInput.value) {
          addressInput.value = selectElem.value;
        } else {
          const matchOpt = addressOptions.find(opt => opt.value === addressInput.value);
          if (matchOpt && typeof selectElem.syncCustomUI === 'function') {
            selectElem.syncCustomUI(matchOpt.value);
          }
        }
      }
    }
  };

  // Auto-fill địa chỉ từ thông tin user
  if (addressInput && user.address) {
    addressInput.value = user.address;
  }
  setupAddressSelect();

  // Set min time for time_start input to prevent past dates
  const timeStartInput = form.querySelector("#time_start");
  if (timeStartInput) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    timeStartInput.min = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  // Initialize FavoriteStore (single source of truth)
  favoriteStore.init(user.id);

  // Load suggested technicians list
  let suggestedTechs = [];
  const sampleFallbackTechs = [
    { id: 101, username: "KỸ THUẬT HỖ TRỢ ONLINE", phone: "0987.654.321", address: "40 hữu lê - hữu hoà - thanh trì - Hà Nội" },
    { id: 102, username: "SH-KTDV-NV-HaDN", phone: "0912.345.678", address: "Lấy hàng tại kho" },
    { id: 103, username: "Mai Văn Chính", phone: "0978.123.456", address: "Hh03D khu đô thị Thanh Hà" },
    { id: 104, username: "SH-LX-NV-DuongC", phone: "0904.567.890", address: "Lấy hàng tại kho" },
    { id: 105, username: "Đỗ Mạnh Cường", phone: "0936.888.999", address: "Nam Từ Liêm, Hà Nội" }
  ];

  const loadSuggestedTechnicians = async () => {
    try {
      const res = await SupportService.getAllSupportTechnicians();
      const all = res.data || res || [];
      if (Array.isArray(all) && all.length > 0) {
        suggestedTechs = all.slice(0, 15);
      } else {
        suggestedTechs = sampleFallbackTechs;
      }
    } catch (e) {
      console.warn("Could not load suggested technicians from API, using fallback list", e);
      suggestedTechs = sampleFallbackTechs;
    } finally {
      renderStaffDropdown(favoriteStore.getFavorites() || []);
    }
  };

  // Render staff cards & dropdown từ store state & suggested list
  function renderStaffDropdown(favorites = []) {
    const techsToSuggest = suggestedTechs.length > 0 ? suggestedTechs : sampleFallbackTechs;
    const currentAddress = addressInput ? addressInput.value.trim() : "";
    renderTechnicianCards({
      cardsContainer: staffCardsContainer,
      selectElement: staffSelect,
      favorites: favorites,
      suggestedTechs: techsToSuggest,
      selectedTechId: selectedTechId || "",
      staffData: staffData,
      userAddress: currentAddress
    });
  }

  // Listen to address changes to dynamically filter technicians within 20km
  let addressDebounceTimer = null;
  const onAddressChange = (immediate = false) => {
    clearTimeout(addressDebounceTimer);
    if (immediate) {
      renderStaffDropdown(favoriteStore.getAll ? favoriteStore.getAll() : []);
    } else {
      addressDebounceTimer = setTimeout(() => {
        renderStaffDropdown(favoriteStore.getAll ? favoriteStore.getAll() : []);
      }, 100);
    }
  };

  if (addressInput) {
    addressInput.addEventListener('input', () => {
      const selectElem = form.querySelector('#booking_address_select');
      if (selectElem && selectElem.value !== '__custom__') {
        const currentVal = addressInput.value.trim();
        if (currentVal !== selectElem.value && typeof selectElem.syncCustomUI === 'function') {
          selectElem.syncCustomUI('__custom__');
        }
      }
      onAddressChange(false);
    });
    addressInput.addEventListener('change', () => onAddressChange(true));
    addressInput.addEventListener('blur', () => onAddressChange(true));
    addressInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addressInput.blur();
        onAddressChange(true);
      }
    });
  }

  loadSuggestedTechnicians();

  // Show KTV info when staff is selected
  staffSelect.addEventListener('change', () => {
    const selected = staffData.find(s => String(s.id) === String(staffSelect.value));
    if (selected) {
      const techName = selected.username || selected.name || "KTV";
      const techPhone = selected.phone || "";
      staffInfoName.textContent = techName;
      staffInfoPhone.textContent = techPhone;
      staffInfo.style.display = 'flex';
      staffInfo.style.alignItems = 'center';
      staffInfo.style.cursor = 'pointer';
      staffInfo.title = 'Bấm để xem chi tiết kỹ thuật viên';

      let hint = staffInfo.querySelector('.staff-detail-hint');
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'staff-detail-hint';
        hint.style.cssText = 'font-size: 0.8rem; background: #ffffff; padding: 2px 8px; border-radius: 10px; margin-left: auto; color: #dc2626; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: inline-flex; align-items: center; gap: 4px;';
        hint.innerHTML = '<i class="fas fa-eye"></i> Xem chi tiết';
        staffInfo.appendChild(hint);
      }

      // Update the "Kỹ thuật viên đã chọn" banner card
      updateSelectedTechInfoBox(selected.id, techName, techPhone);
    } else {
      staffInfo.style.display = 'none';
      updateSelectedTechInfoBox(null, null, null);
    }
  });

  if (staffInfo) {
    staffInfo.addEventListener('click', () => {
      if (staffSelect.value) {
        window.location.hash = `#/technician-detail?id=${staffSelect.value}`;
      }
    });
  }

  // Subscribe to FavoriteStore
  const unsubscribe = favoriteStore.subscribe(({ favorites, loading, error }) => {
    if (!loading && !error) {
      renderStaffDropdown(favorites);
    }

    if (error) {
      console.error('❌ FavoriteStore error:', error);
      staffSelect.innerHTML = '<option value="">-- Không chọn (hệ thống sẽ tự động phân công) --</option>';
      const option = document.createElement('option');
      option.value = '';
      option.textContent = '⚠️ Không thể tải danh sách thợ yêu thích';
      option.disabled = true;
      staffSelect.appendChild(option);
    }
  });

  // Cleanup khi rời trang
  window.addEventListener('hashchange', () => {
    unsubscribe();
      }, { once: true });

  productService
    .getListProduct(user.id)
    .then((products) => {
      productSelect.innerHTML = '<option value="">-- Chọn sản phẩm máy thuê --</option>';

      // Lọc các sản phẩm có order_type_label là "Thuê"
      const rentProducts = (products || []).filter(p => p.order_type_label === "Thuê");

      if (rentProducts.length > 0) {
        productsData = rentProducts; // Store the products data
        setupAddressSelect();
        rentProducts.forEach((product) => {
          const option = document.createElement("option");
          option.value = product.id;

          let productName = product.product?.name || product.name || "Máy thuê";
          option.textContent = `${productName}`;
          productSelect.appendChild(option);
                  });
      } else {
        productSelect.innerHTML =
          '<option value="">Chưa có sản phẩm máy thuê nào</option>';
      }
    })
    .catch((error) => {
      console.error("Error loading rent products:", error);
      productSelect.innerHTML =
        '<option value="">Lỗi khi tải máy thuê</option>';
    });

  // Auto-fill address when product is selected
  productSelect.addEventListener("change", (e) => {
    const selectedProductId = e.target.value;
    if (selectedProductId && productsData.length > 0) {
      const selectedProduct = productsData.find(
        (p) => String(p.id) === String(selectedProductId)
      );
      if (selectedProduct) {
        // Prioritize product address
        const displayAddress = selectedProduct.address;
        if (displayAddress) {
          addressInput.value = displayAddress;
        }
      }
    }
  });

  // Preview images
  const imageInput = form.querySelector("#images");
  const imagePreview = form.querySelector("#image-preview");

  // Store selected files at function scope level
  let selectedFiles = [];

  imageInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

    // Add new files, but limit to 4 total
    files.forEach(file => {
      if (file.type.startsWith("image/") && selectedFiles.length < 4) {
        selectedFiles.push(file);
      }
    });

    // Refresh the preview
    renderImagePreviews();
  });

  // Function to render image previews
  function renderImagePreviews() {
    imagePreview.innerHTML = "";

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewItem = document.createElement("div");
        previewItem.className = "preview-item";
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="Preview ${index + 1}">
          <button type="button" class="remove-image" data-index="${index}">
            <i class="fas fa-times"></i>
          </button>
        `;

        // Add event listener to remove button
        const removeButton = previewItem.querySelector(".remove-image");
        removeButton.addEventListener("click", (e) => {
          e.stopPropagation();
          // Remove the file from selectedFiles array using the data-index attribute
          const currentIndex = parseInt(removeButton.getAttribute("data-index"));
          selectedFiles.splice(currentIndex, 1);

          // Update the file input value to reflect removed files
          const dt = new DataTransfer();
          selectedFiles.forEach(file => dt.items.add(file));
          imageInput.files = dt.files;

          // Re-render previews
          renderImagePreviews();
        });

        imagePreview.appendChild(previewItem);
      };
      reader.readAsDataURL(file);
    });

    // Update the file input to reflect current selected files
    const dt = new DataTransfer();
    selectedFiles.forEach(file => dt.items.add(file));
    imageInput.files = dt.files;
  }

  // Handle drag and drop
  const uploadContainer = form.querySelector('.image-upload-container');
  if (uploadContainer) {
    uploadContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadContainer.classList.add('drag-over');
    });

    uploadContainer.addEventListener('dragleave', () => {
      uploadContainer.classList.remove('drag-over');
    });

    uploadContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadContainer.classList.remove('drag-over');

      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));

      // Add new files, but limit to 4 total
      files.forEach(file => {
        if (selectedFiles.length < 4) {
          selectedFiles.push(file);
        }
      });

      // Refresh the preview
      renderImagePreviews();
    });
  }

  // Form submission
  const errorMsg = form.querySelector("#error-msg");
  const successMsg = form.querySelector("#success-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    submitBtn.disabled = true;

    // Validate past dates
    if (form.time_start && form.time_start.value) {
      const selectedDate = new Date(form.time_start.value);
      const now = new Date();
      if (selectedDate.getTime() < now.getTime() - 5 * 60 * 1000) {
        errorMsg.textContent = "Thời gian bắt đầu không được là thời gian trong quá khứ.";
        errorMsg.style.display = "block";
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
      }
    }

    try {
      // Upload images first and get URLs
      const imageFiles = imageInput.files;
      let imageUrls = [];

      if (imageFiles.length > 0) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải ảnh...';
        try {
          imageUrls = await api.uploadMultipleImages(imageFiles);
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          errorMsg.textContent = "Không thể tải ảnh lên. Vui lòng thử lại.";
          errorMsg.style.display = "block";
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          return;
        }
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đặt lịch...';
      }

      // Format datetime to "DD/MM/YYYY HH:mm"
      const formatDateTime = (datetimeLocal) => {
        const date = new Date(datetimeLocal);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      };

      // Prepare booking data
      const bookingData = {
        customer: user.id,
        time_start: formatDateTime(form.time_start.value),
        type_task: form.type_task.value,
        des: form.des.value || "",
        status: "1",
        priority: "1",
        user_create: "161",
        images: imageUrls, // Use uploaded image URLs
        address: form.address.value,
      };

      // Only include product_id if selected
      if (form.product_id && form.product_id.value) {
        bookingData.product_id = form.product_id.value;
      }

      // Thêm staff nếu user đã chọn
      if (form.staff.value) {
        bookingData.staff = form.staff.value;
      }

      // Add service name if 'Khác' is selected
      if (form.type_task.value === '6' && form.service_name.value.trim()) {
        bookingData.name = form.service_name.value.trim();
      }

      // MỚI: Gọi api bookingRentService thay vì bookingService
      const response = await servicesService.bookingRentService(bookingData);

      successMsg.textContent =
        "Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.";
      successMsg.style.display = "block";

      // Gửi thông báo sau khi đặt lịch thành công
      try {
        const serviceName = form.type_task.selectedOptions[0]?.text || 'Dịch vụ máy thuê';
        const notificationData = notificationService.formatBookingNotificationData(
          { ...bookingData, id: response.data?.id || response.id },
          user,
          serviceName
        );
        await notificationService.sendBookingNotification(notificationData);
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError);
      }

      // Reset form and image preview
      form.reset();
      imagePreview.innerHTML = "";
      imageInput.value = ""; // Clear the image input

      setTimeout(() => {
        successMsg.style.display = "none";
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 2000);
    } catch (error) {
      console.error("Error submitting booking:", error);
      errorMsg.textContent =
        error.message || "Đặt lịch thất bại. Vui lòng thử lại.";
      errorMsg.style.display = "block";
    } finally {
      // Ensure button is re-enabled in case of error
      if (submitBtn.disabled) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    }
  });

  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
