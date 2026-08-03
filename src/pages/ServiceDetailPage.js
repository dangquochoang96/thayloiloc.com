import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { Toast } from "../utils/toast.js";
import { SupportService } from "../services/support.service.js";
import { getImageUrl, formatDate } from "../utils/helpers.js";
import { getSubcategorySVG } from "../utils/icons.js";
import { authService } from "../services/auth.service.js";
import { sampleServices } from "./ServiceQuotationPage.js";
import { geocodeAddress, reverseGeocode } from "../utils/geocoding.js";
import { calculateDistance, getUserLocation } from "../utils/geohash.js";
import { PROVINCES_DATA } from "../utils/provincesData.js";
import { videoService } from "../services/video.service.js";
import "../styles/services/service-detail-page.css";
import "../styles/services/service-quotation.css";
import "../styles/home/video-section.css";



export function ServiceDetailPage(params = {}) {
  const container = document.createElement("div");
  container.className = "service-detail-wrapper";

  // Admin Check
  const currentUser = authService.getCurrentUser();
  const isAccountAdmin = !!(currentUser && (
    currentUser.username?.toLowerCase() === 'admin' ||
    currentUser.role?.toLowerCase() === 'admin' ||
    currentUser.is_admin === true ||
    currentUser.is_admin === 1 ||
    currentUser.user_type?.toLowerCase() === 'admin'
  ));

  // Header
  container.appendChild(Header());

  const main = document.createElement("main");
  main.className = "service-detail-page";

  // Parse service ID
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const serviceId = params.id || urlParams.get("id") || "101";

  // Load service details from localStorage or fallbacks
  let services = [];
  try {
    const local = localStorage.getItem("services_quotation_data");
    if (local) services = JSON.parse(local);
  } catch (e) {
    console.warn("Failed to load services quotation data from localStorage", e);
  }

  if (!services || services.length === 0) {
    services = [...sampleServices];
  } else {
    services = services.map(s => {
      const sample = sampleServices.find(item => String(item.id) === String(s.id));
      return {
        ...s,
        customImage: sample ? sample.customImage : (s.customImage || null)
      };
    });
  }

  let service = services.find(s => String(s.id) === String(serviceId));
  if (!service) {
    service = services[0] || sampleServices[0];
  }

  const formatVND = (num) => new Intl.NumberFormat("vi-VN").format(num) + "đ";
  const isNoWarranty = service.warrantyClass === "no-warranty";
  const imgSrc = service.customImage || getSubcategorySVG(service.subcategory);



  // Default content fallbacks
  const defaultHighlights = [
    "Cam kết kỹ thuật viên giỏi, trên 3 năm kinh nghiệm",
    "Kiểm tra tình trạng thiết bị miễn phí tại nhà",
    "Linh kiện thay thế 100% chính hãng có tem bảo hành",
    "Hoàn tiền nếu không hài lòng với chất lượng dịch vụ"
  ];

  const defaultProcessSteps = [
    { num: 1, title: "Tiếp nhận & Khảo sát", desc: "Thợ kiểm tra tổng quan vị trí lắp đặt/thiết bị và thống nhất với gia chủ." },
    { num: 2, title: "Báo giá minh bạch", desc: "Tư vấn giải pháp tối ưu và xác nhận tổng chi phí trước khi làm." },
    { num: 3, title: "Thi công chuyên nghiệp", desc: "Tiến hành công việc theo đúng tiêu chuẩn kỹ thuật an toàn của nhà sản xuất." },
    { num: 4, title: "Vận hành & Kiểm tra", desc: "Chạy thử nghiệm thiết bị, đo chỉ số nước/điện và vệ sinh khu vực làm việc." },
    { num: 5, title: "Bàn giao & Bảo hành", desc: "Hướng dẫn sử dụng, viết phiếu bảo hành điện tử và thanh toán." }
  ];

  const defaultMaterials = [
    { name: "Dây dẫn nước cao cấp chuẩn 6mm / 10mm", unit: "Mét", price: "15.000đ" },
    { name: "Cút chia nước khóa inox 304", unit: "Cái", price: "60.000đ" },
    { name: "Van áp cao / Van áp thấp RO", unit: "Cái", price: "120.000đ" },
    { name: "Bơm tăng áp 24V siêu êm", unit: "Bộ", price: "380.000đ" }
  ];

  const highlights = (service.highlights && service.highlights.length > 0) ? service.highlights : defaultHighlights;
  const processSteps = (service.processSteps && service.processSteps.length > 0) ? service.processSteps : defaultProcessSteps;
  const materials = (service.materials && service.materials.length > 0) ? service.materials : defaultMaterials;

  const highlightsHTML = highlights.map(h => `<li><i class="fas fa-circle-check"></i> ${h}</li>`).join('');
  const processStepsHTML = processSteps.map((step, idx) => `
    <div class="process-step-item">
      <div class="process-step-num">${step.num || (idx + 1)}</div>
      <div class="process-step-title">${step.title}</div>
      <div class="process-step-desc">${step.desc}</div>
    </div>
  `).join('');
  const materialsRowsHTML = materials.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.unit}</td>
      <td class="price-col">${m.price}</td>
    </tr>
  `).join('');

  const adminBarHTML = isAccountAdmin ? `
    <div class="sd-admin-bar" style="background:#0f172a; color:#fff; padding:12px 20px; border-radius:12px; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
      <div style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.92rem;">
        <i class="fas fa-user-shield" style="color:#f59e0b; font-size:1.1rem;"></i> Bảng Quản Trị Admin
      </div>
      <button id="sdAdminEditBtn" style="background:linear-gradient(135deg, #f43f5e, #e11d48); color:#fff; border:none; padding:8px 18px; border-radius:8px; font-weight:600; font-size:0.88rem; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 2px 8px rgba(225,29,72,0.3); transition:all 0.2s;">
        <i class="fas fa-pen-to-square"></i> Chỉnh sửa toàn bộ nội dung
      </button>
    </div>
  ` : '';

  // Render Page Content
  main.innerHTML = `
    <!-- Header & Breadcrumb -->
    <div class="service-detail-header">
      <div class="container">
        <div class="breadcrumb">
          <a href="#/">Trang chủ</a>
          <i class="fas fa-chevron-right"></i>
          <a href="#/services-quotation">Báo Giá Dịch Vụ</a>
          <i class="fas fa-chevron-right"></i>
          <span class="current-title">${service.name}</span>
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="container">
      ${adminBarHTML}
      
      <!-- HERO CONTAINER (MODELED AFTER THỌ ĐIỆN MÁY XANH) -->
      <div class="tmx-hero-container">
        <!-- LEFT COLUMN: MAIN IMAGE & THUMBNAILS -->
        <div class="tmx-hero-left">
          <div class="tmx-image-card">
            <div class="tmx-warranty-badge ${isNoWarranty ? 'no-warranty' : ''}">
              <i class="fas ${isNoWarranty ? 'fa-info-circle' : 'fa-check'}"></i>
              ${service.warrantyText}
            </div>
            <div class="tmx-main-img-box">
              <img id="tmxMainImg" src="${imgSrc}" alt="${service.name}" />
            </div>
            <div class="tmx-carousel-indicators">
              <span class="tmx-indicator active"></span>
              <span class="tmx-indicator"></span>
            </div>
          </div>
          <div class="tmx-thumbnails-row">
            ${((service.images && service.images.length > 0) ? service.images : [imgSrc, imgSrc]).slice(0, 3).map((img, idx) => `
              <div class="tmx-thumb-item ${idx === 0 ? 'active' : ''}" data-img="${img}">
                <img src="${img}" alt="Ảnh ${idx + 1}" />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- RIGHT COLUMN: TITLE, RATING, PRICE, ACTIONS, HIGHLIGHTS BOX -->
        <div class="tmx-hero-right">
          <h1 class="tmx-service-title">${service.name}</h1>
          
          <div class="tmx-service-rating-line">
            <i class="fas fa-star" style="color: #f59e0b;"></i>
            <span class="tmx-rating-val">${(service.rating || 5.0).toFixed(1)}</span>
            <span class="tmx-dot">•</span>
            <span class="tmx-sold-count">Đã bán ${service.soldCount || 472}</span>
          </div>

          <div class="tmx-service-price">${formatVND(service.price)}</div>

          <div class="tmx-action-btns-row">
            <button class="tmx-btn-cart" id="sdAddToCartBtn">
              Thêm vào giỏ hàng
            </button>
            <button class="tmx-btn-buy" id="sdBookNowBtn">
              Đặt dịch vụ ngay
            </button>
          </div>

          <!-- CARD: ĐẶC ĐIỂM NỔI BẬT -->
          <div class="tmx-highlights-card">
            <h3 class="tmx-highlights-title">Đặc điểm nổi bật</h3>
            <p class="tmx-highlights-desc">
              ${service.description || 'Thợ DMX cung cấp dịch vụ ' + service.name + ' nhanh chóng, an toàn, đúng kỹ thuật, phù hợp khi khách hàng cần di dời, sửa chữa, thay mới hoặc cải tạo vị trí lắp đặt.'}
            </p>
            <h4 class="tmx-highlights-sub">Ưu điểm dịch vụ</h4>
            <ul class="tmx-highlights-list">
              ${highlights.map(h => `<li><span class="bullet-dot">•</span> <span>${h}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- FULL-WIDTH DETAIL CONTENT LIST -->
      <div class="service-fullwidth-content-list" style="margin-top: 28px; display: flex; flex-direction: column; gap: 24px;">

        <!-- 1. 5-Step Process Card -->
        <div class="sd-card">
          <h3 class="sd-card-title">
            <i class="fas fa-list-check"></i> Quy Trình Thực Hiện Chuẩn 5 Bước
          </h3>
          <div class="process-steps-list">
            ${processStepsHTML}
          </div>
        </div>

        <!-- 2. Materials & Spare Parts Price Table -->
        <div class="sd-card">
          <h3 class="sd-card-title">
            <i class="fas fa-table-list"></i> Bảng Phụ Phí Vật Tư & Linh Kiện Tham Khảo
          </h3>
          <div class="materials-table-wrapper">
            <table class="materials-table">
              <thead>
                <tr>
                  <th>Tên vật tư / Phụ kiện phát sinh</th>
                  <th>Đơn vị</th>
                  <th>Đơn giá niêm yết</th>
                </tr>
              </thead>
              <tbody>
                ${materialsRowsHTML}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Technicians Section -->
        <div class="sd-card">
          <h3 class="sd-card-title">
            <i class="fas fa-user-gear"></i> Kỹ Thuật Viên Sẵn Sàng Phục Vụ Dịch Vụ Này
          </h3>
          <div class="sd-techs-grid" id="sdTechsGrid">
            <div style="grid-column:1/-1; text-align:center; padding:15px; color:#64748b;">
              <i class="fas fa-spinner fa-spin"></i> Đang tải danh sách kỹ thuật viên...
            </div>
          </div>
        </div>

        <!-- 4. FULL-WIDTH VIDEO SECTION -->
        <div class="sd-card" id="sdVideoSectionCard">
          <div class="sd-card-header-flex" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
            <h3 class="sd-card-title" style="margin-bottom:0; border-bottom:none; padding-bottom:0; font-size: 1.25rem;">
              <i class="fas fa-play-circle" style="color:var(--primary-color, #f97316);"></i> Quy trình dịch vụ
            </h3>
            <a href="#/video" class="sd-view-all-video-btn" onclick="event.preventDefault(); window.location.hash='#/video';" style="background: #f97316; color: white; padding: 8px 20px; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; transition: all 0.3s ease;">
              Xem tất cả <i class="fas fa-arrow-right"></i>
            </a>
          </div>

          <div id="sdVideoHomeLoading" style="text-align:center; padding:40px;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#f97316;"></i>
            <p style="margin-top:10px; color:#666;">Đang tải video...</p>
          </div>

          <div class="video-playlist-container" id="sdVideoHomePlaylistContainer" style="display:none; background:transparent; box-shadow:none;">
            <div class="video-player-wrapper" style="flex:1; width:100%; max-height:480px; border-radius:12px; overflow:hidden;">
              <div id="sdYoutubePlayer"></div>
            </div>
          </div>
        </div>

        <!-- 5. Customer Reviews Section -->
        <div class="sd-card">
          <h3 class="sd-card-title">
            <i class="fas fa-star"></i> Đánh Giá Từ Khách Hàng (${service.rating || 5.0}/5.0)
          </h3>
          <div class="sd-reviews-summary">
            <div class="sd-score-box">
              <div class="sd-score-num">${(service.rating || 5.0).toFixed(1)}</div>
              <div class="sd-score-stars">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
              </div>
              <div class="sd-score-total">Dựa trên nhận xét thực tế</div>
            </div>
            <div style="flex-grow:1;">
              <p style="margin:0; font-size:0.9rem; color:#475569; line-height:1.6;">
                "Tất cả đánh giá đều đến từ những khách hàng đã trực tiếp sử dụng dịch vụ lắp đặt & bảo dưỡng của chúng tôi trên toàn quốc."
              </p>
            </div>
          </div>

          <div class="sd-reviews-list">
            <div class="sd-review-item">
              <div class="sd-review-user">
                <div class="sd-review-avatar">N</div>
                <div class="sd-review-name">Nguyễn Văn An</div>
                <div class="sd-review-date">2 ngày trước</div>
              </div>
              <div class="sd-review-text">
                Thợ đến rất đúng giờ, làm việc cẩn thận và dọn dẹp sạch sẽ sau khi lắp đặt xong. Rất hài lòng!
              </div>
            </div>
            <div class="sd-review-item">
              <div class="sd-review-user">
                <div class="sd-review-avatar">T</div>
                <div class="sd-review-name">Trần Thị Minh</div>
                <div class="sd-review-date">5 ngày trước</div>
              </div>
              <div class="sd-review-text">
                Giá niêm yết rõ ràng không phát sinh chi phí lung tung. Thợ tư vấn tận tình cách sử dụng máy bền lâu.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Mobile Sticky Quick Bar -->
    <div class="sd-mobile-quick-bar">
      <div>
        <div style="font-size:0.75rem; color:#64748b;">Giá dịch vụ:</div>
        <div class="sd-mqb-price">${formatVND(service.price)}</div>
      </div>
      <button class="sd-mqb-btn" id="sdMobileBookBtn">
        <i class="fas fa-calendar-check"></i> Đặt Lịch Ngay
      </button>
    </div>
  `;

  main.appendChild(container.querySelector(".container") || document.createElement("div"));
  container.appendChild(main);
  container.appendChild(Footer());

  // Attach event handlers
  setTimeout(() => {
    const handleBook = () => {
      const serviceString = `Dịch vụ: ${service.name} - Báo giá: ${formatVND(service.price)} (${service.warrantyText})`;
      Toast.info(`Đang chuyển tới trang đặt lịch...`, 2000);
      setTimeout(() => {
        window.location.hash = `/booking?service_id=6&service_name=${encodeURIComponent(serviceString)}`;
      }, 500);
    };

    // Thumbnails click handling
    container.querySelectorAll(".tmx-thumb-item").forEach(item => {
      item.addEventListener("click", () => {
        container.querySelectorAll(".tmx-thumb-item").forEach(t => t.classList.remove("active"));
        item.classList.add("active");
        const newSrc = item.getAttribute("data-img");
        const mainImg = container.querySelector("#tmxMainImg");
        if (mainImg && newSrc) {
          mainImg.src = newSrc;
        }
      });
    });

    container.querySelector("#sdBookNowBtn")?.addEventListener("click", handleBook);
    container.querySelector("#sdMobileBookBtn")?.addEventListener("click", handleBook);

    if (isAccountAdmin) {
      container.querySelector("#sdAdminEditBtn")?.addEventListener("click", () => {
        openEditServiceModal(service, { highlights, processSteps, materials });
      });
    }

    container.querySelector("#sdAddToCartBtn")?.addEventListener("click", () => {
      try {
        let cart = JSON.parse(localStorage.getItem("services_cart") || "[]");
        const existing = cart.find(i => i.id === service.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            id: service.id,
            name: service.name,
            price: service.price,
            subcategory: service.subcategory,
            quantity: 1,
            warrantyText: service.warrantyText
          });
        }
        localStorage.setItem("services_cart", JSON.stringify(cart));
        Toast.success(`Đã thêm "${service.name}" vào bảng báo giá!`, 2500);
      } catch (e) {
        console.error("Cart error:", e);
      }
    });

    // Load available technicians for this service
    loadTechnicians(container, service);

    // Load video news section
    loadSdVideoHome(container, service);
  }, 100);

  return container;
}

// Function to open service editing modal for admin
function openEditServiceModal(serviceToEdit, defaultData = {}) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'sq-modal-overlay';
  modalOverlay.style.zIndex = '1100';

  let currentImgPreview = serviceToEdit.customImage || getSubcategorySVG(serviceToEdit.subcategory || 'water_purifier');

  const activeHighlights = (serviceToEdit.highlights && serviceToEdit.highlights.length > 0) ? serviceToEdit.highlights : defaultData.highlights;
  const activeProcess = (serviceToEdit.processSteps && serviceToEdit.processSteps.length > 0) ? serviceToEdit.processSteps : defaultData.processSteps;
  const activeMaterials = (serviceToEdit.materials && serviceToEdit.materials.length > 0) ? serviceToEdit.materials : defaultData.materials;

  const highlightsText = activeHighlights ? activeHighlights.join('\n') : '';
  const materialsText = activeMaterials ? activeMaterials.map(m => `${m.name} | ${m.unit} | ${m.price}`).join('\n') : '';

  const processInputsHTML = activeProcess.map((step, idx) => `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px 12px; border-radius:8px; margin-bottom:8px;">
      <div style="font-weight:600; font-size:0.85rem; color:var(--primary-color, #f97316); margin-bottom:4px;">Bước ${step.num || (idx + 1)}</div>
      <input type="text" class="step-title-input" data-idx="${idx}" value="${(step.title || '').replace(/"/g, '&quot;')}" placeholder="Tiêu đề bước..." style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.85rem; margin-bottom:6px;" />
      <input type="text" class="step-desc-input" data-idx="${idx}" value="${(step.desc || '').replace(/"/g, '&quot;')}" placeholder="Mô tả công việc..." style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.85rem;" />
    </div>
  `).join('');

  modalOverlay.innerHTML = `
    <div class="sq-modal-card" style="max-width: 680px; width: 92%; max-height: 85vh; overflow-y: auto;">
      <div class="sq-modal-header" style="position:sticky; top:0; background:#fff; z-index:10;">
        <h3><i class="fas fa-pen-to-square" style="color:var(--primary-color);"></i> Quản Lý Nội Dung Dịch Vụ (Admin)</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="sq-modal-body" style="padding:20px; display:flex; flex-direction:column; gap:16px;">
        
        <!-- 1. Cơ bản -->
        <h4 style="margin:0; font-size:0.95rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:6px;"><i class="fas fa-info-circle" style="color:var(--primary-color, #f97316);"></i> 1. Thông tin chung</h4>
        <div class="sq-form-group">
          <label style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:4px; display:block;">Tên dịch vụ <span style="color:red;">*</span></label>
          <input type="text" id="sqFormName" value="${(serviceToEdit.name || '').replace(/"/g, '&quot;')}" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem;" required />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="sq-form-group">
            <label style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:4px; display:block;">Giá dịch vụ (VNĐ) <span style="color:red;">*</span></label>
            <input type="number" id="sqFormPrice" value="${serviceToEdit.price || 150000}" step="5000" min="0" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem;" required />
          </div>
          <div class="sq-form-group">
            <label style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:4px; display:block;">Chế độ bảo hành</label>
            <input type="text" id="sqFormWarrantyText" value="${(serviceToEdit.warrantyText || 'Bảo hành 30 ngày').replace(/"/g, '&quot;')}" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem;" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="sq-form-group">
            <label style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:4px; display:block;">Loại bảo hành</label>
            <select id="sqFormWarrantyClass" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem;">
              <option value="" ${serviceToEdit.warrantyClass !== 'no-warranty' ? 'selected' : ''}>Bảo hành tiêu chuẩn (Xanh)</option>
              <option value="no-warranty" ${serviceToEdit.warrantyClass === 'no-warranty' ? 'selected' : ''}>Không bảo hành (Đỏ)</option>
            </select>
          </div>
          <div class="sq-form-group">
            <label style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:4px; display:block;">Đánh giá (Star Rating)</label>
            <input type="number" id="sqFormRating" value="${serviceToEdit.rating || 5.0}" step="0.1" min="1" max="5" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem;" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="sq-form-group">
            <label style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:4px; display:block;">Ribbon Trái (Cam)</label>
            <input type="text" id="sqFormRibbonLeft" value="${(serviceToEdit.ribbonLeft || 'Chuẩn hãng').replace(/"/g, '&quot;')}" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem;" />
          </div>
          <div class="sq-form-group">
            <label style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:4px; display:block;">Ribbon Phải (Xanh)</label>
            <input type="text" id="sqFormRibbonRight" value="${(serviceToEdit.ribbonRight || 'Hoàn tất trong 60 phút').replace(/"/g, '&quot;')}" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem;" />
          </div>
        </div>

        <!-- 2. Điểm nổi bật -->
        <h4 style="margin:8px 0 0 0; font-size:0.95rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:6px;"><i class="fas fa-list-check" style="color:var(--primary-color, #f97316);"></i> 2. Các điểm cam kết / nổi bật (Mỗi dòng 1 ý)</h4>
        <div class="sq-form-group">
          <textarea id="sqFormHighlights" rows="4" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem; line-height:1.5;">${highlightsText}</textarea>
        </div>

        <!-- 3. Quy trình thực hiện -->
        <h4 style="margin:8px 0 0 0; font-size:0.95rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:6px;"><i class="fas fa-diagram-project" style="color:var(--primary-color, #f97316);"></i> 3. Quy trình thực hiện chuẩn các bước</h4>
        <div id="sqProcessWrapper">
          ${processInputsHTML}
        </div>

        <!-- 4. Phụ phí vật tư -->
        <h4 style="margin:8px 0 0 0; font-size:0.95rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:6px;"><i class="fas fa-table-list" style="color:var(--primary-color, #f97316);"></i> 4. Bảng phụ phí vật tư tham khảo (Mỗi dòng: Tên vật tư | Đơn vị | Đơn giá)</h4>
        <div class="sq-form-group">
          <textarea id="sqFormMaterials" rows="4" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem; font-family:monospace; line-height:1.5;">${materialsText}</textarea>
        </div>

        <!-- 5. Ảnh -->
        <div class="sq-form-group">
          <label style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:4px; display:block;">Hình ảnh minh họa dịch vụ</label>
          <div style="display:flex; gap:15px; align-items:center;">
            <div style="width:60px; height:60px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; flex-shrink:0;">
              <img id="sqImgPreview" src="${currentImgPreview}" style="width:100%; height:100%; object-fit:cover;" />
            </div>
            <div style="flex-grow:1; display:flex; flex-direction:column; gap:6px;">
              <input type="file" id="sqFormFileInput" accept="image/*" style="font-size:0.8rem;" />
              <input type="text" id="sqFormImgUrl" value="${(serviceToEdit.customImage || '').replace(/"/g, '&quot;')}" placeholder="URL / Data Image..." style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.8rem;" />
            </div>
          </div>
        </div>

      </div>

      <div class="sq-modal-footer" style="position:sticky; bottom:0; background:#fff; z-index:10; display:flex; justify-content:flex-end; gap:10px; padding:14px 20px; border-top:1px solid #e2e8f0;">
        <button class="sq-btn-cancel" id="sqCancelBtn">Hủy</button>
        <button class="sq-btn-submit" id="sqSaveBtn"><i class="fas fa-save"></i> Lưu Thay Đổi</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeBtn = modalOverlay.querySelector('.close-modal');
  const cancelBtn = modalOverlay.querySelector('#sqCancelBtn');
  const saveBtn = modalOverlay.querySelector('#sqSaveBtn');
  const fileInput = modalOverlay.querySelector('#sqFormFileInput');
  const imgUrlInput = modalOverlay.querySelector('#sqFormImgUrl');
  const imgPreview = modalOverlay.querySelector('#sqImgPreview');

  let customImageData = serviceToEdit.customImage || null;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        customImageData = event.target.result;
        imgPreview.src = customImageData;
        imgUrlInput.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  imgUrlInput.addEventListener('input', () => {
    const val = imgUrlInput.value.trim();
    if (val) {
      customImageData = val;
      imgPreview.src = val;
    } else {
      customImageData = null;
      imgPreview.src = getSubcategorySVG(serviceToEdit.subcategory || 'water_purifier');
    }
  });

  const closeModal = () => modalOverlay.remove();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  saveBtn.addEventListener('click', () => {
    const name = modalOverlay.querySelector('#sqFormName').value.trim();
    const price = parseFloat(modalOverlay.querySelector('#sqFormPrice').value) || 0;
    const warrantyText = modalOverlay.querySelector('#sqFormWarrantyText').value.trim() || 'Bảo hành 30 ngày';
    const warrantyClass = modalOverlay.querySelector('#sqFormWarrantyClass').value;
    const rating = parseFloat(modalOverlay.querySelector('#sqFormRating').value) || 5.0;
    const ribbonLeft = modalOverlay.querySelector('#sqFormRibbonLeft').value.trim() || 'Chuẩn hãng';
    const ribbonRight = modalOverlay.querySelector('#sqFormRibbonRight').value.trim() || 'Hoàn tất trong 60 phút';

    // Parse Highlights
    const rawHighlights = modalOverlay.querySelector('#sqFormHighlights').value;
    const parsedHighlights = rawHighlights.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Parse Process Steps
    const stepTitleInputs = modalOverlay.querySelectorAll('.step-title-input');
    const stepDescInputs = modalOverlay.querySelectorAll('.step-desc-input');
    const parsedProcessSteps = [];
    stepTitleInputs.forEach((tInput, idx) => {
      const title = tInput.value.trim();
      const desc = stepDescInputs[idx] ? stepDescInputs[idx].value.trim() : '';
      if (title || desc) {
        parsedProcessSteps.push({ num: idx + 1, title: title || `Bước ${idx + 1}`, desc });
      }
    });

    // Parse Materials Table
    const rawMaterials = modalOverlay.querySelector('#sqFormMaterials').value;
    const parsedMaterials = rawMaterials.split('\n').map(l => l.trim()).filter(l => l.length > 0).map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        name: parts[0] || '',
        unit: parts[1] || 'Cái',
        price: parts[2] || 'Liên hệ'
      };
    });

    if (!name) {
      Toast.error("Vui lòng nhập tên dịch vụ!", 2500);
      return;
    }

    if (price <= 0) {
      Toast.error("Giá dịch vụ phải lớn hơn 0đ!", 2500);
      return;
    }

    // Load services from localStorage
    let services = [];
    try {
      const stored = localStorage.getItem("services_quotation_data");
      if (stored) services = JSON.parse(stored);
    } catch (e) { console.warn(e); }

    if (!services || services.length === 0) {
      services = [...sampleServices];
    }

    const targetIndex = services.findIndex(s => String(s.id) === String(serviceToEdit.id));
    const updatedObj = {
      ...serviceToEdit,
      name,
      price,
      warrantyText,
      warrantyClass,
      rating,
      ribbonLeft,
      ribbonRight,
      customImage: customImageData,
      highlights: parsedHighlights,
      processSteps: parsedProcessSteps,
      materials: parsedMaterials
    };

    if (targetIndex !== -1) {
      services[targetIndex] = updatedObj;
    } else {
      services.push(updatedObj);
    }

    localStorage.setItem("services_quotation_data", JSON.stringify(services));
    window.dispatchEvent(new Event('storage'));
    Toast.success(`Đã cập nhật toàn bộ nội dung dịch vụ: ${name}`, 2000);
    closeModal();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });
}

// Helper to format technician address for user display
function getCleanTechAddress(tech, userLocation = '') {
  const raw = (tech.address || '').replace(/\|+/g, ' ').trim();
  const lower = raw.toLowerCase();

  // Clean internal warehouse status placeholders
  if (!raw || lower.includes('lấy hàng tại kho') || lower.includes('tại kho') || lower.includes('kho hàng')) {
    return `Trụ sở Hà Đông`;
  }

  // Capitalize hyphen-separated address parts
  const parts = raw.split('-').map(p => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' - ');
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// Function to load technicians recommended by 20km radius and ratings
async function loadTechnicians(container, service = {}) {
  const grid = container.querySelector("#sdTechsGrid");
  if (!grid) return;

  const formatVND = (num) => new Intl.NumberFormat("vi-VN").format(num) + "đ";

  // Determine user location / district preference
  const currentUser = authService.getCurrentUser();
  const storedLocation =
    localStorage.getItem("user_selected_district") ||
    localStorage.getItem("services_selected_location") ||
    localStorage.getItem("user_location") ||
    currentUser?.address ||
    "Hà Đông";

  // Update card header subtitle/badge if title element exists
  const cardTitle = grid.closest('.sd-card')?.querySelector('.sd-card-title');
  if (cardTitle) {
    let locBadge = cardTitle.querySelector('.sd-loc-badge');
    if (!locBadge) {
      locBadge = document.createElement('div');
      locBadge.className = 'sd-loc-badge';
      cardTitle.appendChild(locBadge);
    }
    locBadge.style.cssText = 'font-size:0.82rem; font-weight:600; color:#334155; background:#f1f5f9; padding:6px 14px; border-radius:20px; margin-left:auto; display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:1px solid #cbd5e1; transition:all 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.05);';
    locBadge.title = "Bấm để chọn / thay đổi khu vực";
    locBadge.innerHTML = `<i class="fas fa-location-dot" style="color:#ef4444;"></i> Khu vực: <strong>${storedLocation}</strong> <i class="fas fa-chevron-down" style="font-size:0.75rem; color:#64748b; margin-left:2px;"></i>`;

    locBadge.onclick = (e) => {
      e.stopPropagation();
      openLocationModal(container, service);
    };

    locBadge.onmouseenter = () => {
      locBadge.style.background = '#e2e8f0';
      locBadge.style.borderColor = '#94a3b8';
    };
    locBadge.onmouseleave = () => {
      locBadge.style.background = '#f1f5f9';
      locBadge.style.borderColor = '#cbd5e1';
    };
  }

  try {
    const res = await SupportService.getAllSupportTechnicians();
    const allTechs = res.data || res || [];

    if (!Array.isArray(allTechs) || allTechs.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; color:#64748b; text-align:center; padding:20px;">Đội ngũ thợ sẵn sàng hỗ trợ tận nơi 24/7.</div>`;
      return;
    }

    // 1. Geocode user's selected location
    let userCoords = null;
    try {
      userCoords = await geocodeAddress(storedLocation);
    } catch (e) {
      console.warn("Could not geocode storedLocation:", storedLocation, e);
    }

    // 2. Extract keywords for text matching fallback
    const rawTokens = storedLocation.split(/[,|\-\/]/).map(t => t.trim()).filter(Boolean);
    const locationKeywords = [];
    rawTokens.forEach(t => {
      const clean = t.replace(/^(Tỉnh|Thành phố|TP|Quận|Huyện|Phường|Xã|Thôn)\s+/gi, '').trim().toLowerCase();
      if (clean && clean.length >= 2) {
        locationKeywords.push(clean);
      }
    });

    // 3. Find technicians within 20km radius or keyword match
    const matchedTechs = [];

    await Promise.all(
      allTechs.map(async (tech) => {
        let techLat = tech.latitude;
        let techLon = tech.longitude;

        if (!techLat || !techLon) {
          const rawAddr = (tech.address || '').replace(/\|+/g, ' ').trim();
          if (rawAddr) {
            try {
              const coords = await geocodeAddress(rawAddr);
              techLat = coords.latitude;
              techLon = coords.longitude;
            } catch (e) {
              // ignore
            }
          }
        }

        let distKm = null;
        let isMatched = false;

        if (userCoords && techLat && techLon) {
          distKm = calculateDistance(userCoords.latitude, userCoords.longitude, techLat, techLon);
          if (distKm <= 20) {
            isMatched = true;
          }
        }

        // Keyword fallback matching
        const rawAddressLower = (tech.address || '').toLowerCase();
        if (!isMatched && locationKeywords.length > 0) {
          if (locationKeywords.some(kw => rawAddressLower.includes(kw))) {
            isMatched = true;
            if (distKm === null) distKm = 3.5;
          }
        }

        // Warehouse / HQ check for Hanoi / Ha Dong area
        if (!isMatched && (rawAddressLower.includes('lấy hàng tại kho') || rawAddressLower.includes('tại kho'))) {
          const isUserInHanoi = locationKeywords.some(kw => kw.includes('hà đông') || kw.includes('hà nội') || kw.includes('kiến hưng') || kw.includes('thanh xuân') || kw.includes('cầu giấy'));
          if (isUserInHanoi) {
            isMatched = true;
            if (distKm === null) distKm = 4.2;
          }
        }

        if (isMatched) {
          matchedTechs.push({
            ...tech,
            _distKm: distKm !== null ? Math.round(distKm * 10) / 10 : null
          });
        }
      })
    );

    // If no technician found within 20km radius: render empty state with button to find thợ page
    if (matchedTechs.length === 0) {
      const safeLoc = String(storedLocation)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      grid.innerHTML = `
        <div class="sd-no-techs-box" style="grid-column: 1 / -1; background: #fffcf9; border: 2px dashed #fed7aa; border-radius: 16px; padding: 32px 20px; text-align: center; margin: 8px 0;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: #fff7ed; color: #f97316; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 16px auto; border: 2px solid #ffedd5;">
            <i class="fas fa-user-slash"></i>
          </div>
          <h4 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">
            Chưa có kỹ thuật viên trong bán kính 20km
          </h4>
          <p style="font-size: 0.92rem; color: #64748b; margin: 0 0 20px 0; max-width: 520px; margin-left: auto; margin-right: auto; line-height: 1.6;">
            Hiện tại chưa có kỹ thuật viên đăng ký làm việc trong bán kính 20km từ khu vực <strong style="color: #0f172a;">${safeLoc}</strong>. Bạn có thể chọn khu vực khác hoặc xem trang Tìm Thợ.
          </p>
          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
            <button class="sd-change-loc-btn" id="sdChangeLocBtn" style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; color: #f97316; border: 1.5px solid #f97316; padding: 10px 20px; border-radius: 10px; font-size: 0.92rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
              <i class="fas fa-map-marker-alt"></i> Thay Đổi Khu Vực
            </button>
            <a href="#/hotline" class="sd-btn-find-tech" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, var(--primary-color, #f97316) 0%, #ea580c 100%); color: #ffffff; padding: 10px 20px; border-radius: 10px; font-size: 0.92rem; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3); transition: all 0.2s ease;">
              <i class="fas fa-users-gear"></i> Trang Tìm Thợ
            </a>
          </div>
        </div>
      `;

      grid.querySelector('#sdChangeLocBtn')?.addEventListener('click', () => {
        openLocationModal(container, service);
      });
      return;
    }

    // Load ratings asynchronously for matched pool of technicians
    const techRatingsMap = {};
    const samplePool = matchedTechs.slice(0, 15);

    await Promise.all(
      samplePool.map(async (tech) => {
        try {
          const resRating = await SupportService.getListOrderRating(tech.id, true);
          const reviews = resRating.data || resRating || [];
          if (Array.isArray(reviews) && reviews.length > 0) {
            const avg = reviews.reduce((sum, r) => sum + (parseFloat(r.rate) || 5), 0) / reviews.length;
            techRatingsMap[tech.id] = {
              avgRating: Math.round(avg * 10) / 10,
              count: reviews.length
            };
          } else {
            techRatingsMap[tech.id] = { avgRating: 0, count: 0 };
          }
        } catch (e) {
          techRatingsMap[tech.id] = { avgRating: 0, count: 0 };
        }
      })
    );

    // Calculate score based on Distance & Ratings (Must have actual reviews count > 0)
    const scoredTechs = samplePool.map(tech => {
      const ratingObj = techRatingsMap[tech.id] || { avgRating: 0, count: 0 };
      const ratingScore = ratingObj.count > 0 ? ((ratingObj.avgRating * 100) + Math.min(ratingObj.count * 10, 200)) : 0;
      const distPenalty = tech._distKm !== null ? tech._distKm * 10 : 50;

      return {
        ...tech,
        _score: ratingScore - distPenalty,
        _ratingObj: ratingObj
      };
    });

    // Sort technicians descending by total score (closest and highest rated first)
    scoredTechs.sort((a, b) => b._score - a._score);

    // Take top 4 recommended technicians
    const topTechs = scoredTechs.slice(0, 4);

    grid.innerHTML = topTechs.map(tech => {
      const avatarUrl = tech.avartar ? getImageUrl(tech.avartar) : null;
      const avatarHTML = avatarUrl ? `<img src="${avatarUrl}" alt="${tech.username}">` : `<i class="fas fa-user-gear"></i>`;
      const addressText = getCleanTechAddress(tech, storedLocation);
      const techName = tech.username || "Kỹ thuật viên";
      const techPhone = tech.phone || "";
      const ratingObj = tech._ratingObj || { avgRating: 5.0, count: 0 };
      const distText = tech._distKm !== null ? `Cách ${tech._distKm} km` : 'Trong bán kính 20km';

      return `
        <div class="sd-tech-card" data-tech-id="${tech.id}" data-tech-name="${techName}" data-tech-phone="${techPhone}">
          <div class="sd-tech-card-header">
            <div class="sd-tech-avatar">${avatarHTML}</div>
            <div class="sd-tech-header-info">
              <h4 class="sd-tech-name" title="${techName}">${techName}</h4>
              <span class="sd-tech-dist-badge"><i class="fas fa-route"></i> ${distText}</span>
            </div>
          </div>
          <div class="sd-tech-card-body">
            <div class="sd-tech-meta-item" title="${addressText}">
              <i class="fas fa-location-dot" style="color:var(--primary-color, #f97316);"></i>
              <span>${addressText}</span>
            </div>
            <div class="sd-tech-meta-item">
              <i class="fas fa-star" style="color:#f59e0b;"></i>
              <span style="font-weight: 700; color: #0f172a;">${ratingObj.avgRating.toFixed(1)}</span>
              <span style="color:#64748b;">${ratingObj.count > 0 ? `(${ratingObj.count} đánh giá)` : '(Sẵn sàng nhận lịch)'}</span>
            </div>
          </div>
          <div class="sd-tech-actions">
            <button class="sd-tech-detail-btn" type="button" title="Xem thông tin chi tiết thợ">
              <i class="fas fa-eye"></i> Chi tiết
            </button>
            <button class="sd-tech-select-btn" type="button" title="Chọn thợ này đặt lịch">
              <i class="fas fa-calendar-check"></i> Chọn thợ
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Bind click events on tech cards and detail buttons
    grid.querySelectorAll(".sd-tech-card").forEach(card => {
      const techId = card.getAttribute("data-tech-id");
      const techName = card.getAttribute("data-tech-name") || "Kỹ thuật viên";
      const techPhone = card.getAttribute("data-tech-phone") || "";

      // Detail button click
      const detailBtn = card.querySelector(".sd-tech-detail-btn");
      if (detailBtn) {
        detailBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // prevent triggering booking selection
          if (techId) {
            window.location.hash = `#/technician-detail?id=${techId}`;
          }
        });
      }

      // Selection (card or select button) click
      card.addEventListener("click", () => {
        const serviceName = service.name || "Dịch vụ lắp đặt & bảo dưỡng";
        const servicePrice = service.price || 150000;
        const warrantyText = service.warrantyText || "Bảo hành 30 ngày";
        const serviceString = `Dịch vụ: ${serviceName} - Báo giá: ${formatVND(servicePrice)} (${warrantyText})`;

        const tempBooking = {
          service_id: '6',
          service_name: serviceString,
          service_detail_id: service.id || '101',
          service_title: serviceName,
          service_price: servicePrice,
          tech_id: techId,
          tech_name: techName,
          tech_phone: techPhone,
          timestamp: Date.now()
        };

        try {
          localStorage.setItem("temp_booking", JSON.stringify(tempBooking));
          sessionStorage.setItem("temp_booking", JSON.stringify(tempBooking));
        } catch (e) {
          console.warn("Failed to save temp_booking to storage", e);
        }

        Toast.success(`Đã chọn thợ ${techName}! Đang chuyển đến trang đặt lịch...`, 2000);

        setTimeout(() => {
          window.location.hash = `#/booking?service_id=6&service_name=${encodeURIComponent(serviceString)}&techId=${encodeURIComponent(techId)}&techName=${encodeURIComponent(techName)}&techPhone=${encodeURIComponent(techPhone)}`;
        }, 400);
      });
    });

  } catch (e) {
    console.warn("Failed to load technicians for detail page", e);
    grid.innerHTML = `<div style="grid-column:1/-1; color:#64748b;">Đội ngũ thợ sẵn sàng hỗ trợ tận nơi 24/7.</div>`;
  }
}

// Video Playlist State and Helper Functions for Service Detail Page
let sdVideoPlaylist = [];
let sdVideoCurrentIndex = 0;
let sdYoutubePlayerInstance = null;

function loadSdYoutubeAPI() {
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const existingReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof existingReady === "function") existingReady();
      resolve();
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    } else {
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

function loadSdVideoHome(container, service = {}) {
  videoService.getAllVideos()
    .then((result) => {
      const videoLoading = container.querySelector("#sdVideoHomeLoading");
      const videoPlaylistContainer = container.querySelector("#sdVideoHomePlaylistContainer");

      if (videoLoading) videoLoading.style.display = "none";
      if (videoPlaylistContainer) videoPlaylistContainer.style.display = "flex";

      let allVideosList = [];
      if (result && result.data && Array.isArray(result.data)) {
        allVideosList = result.data;
      } else if (Array.isArray(result)) {
        allVideosList = result;
      }

      // Extract service name & subcategory
      const subcat = (service.subcategory || '').toLowerCase();
      const serviceNameLower = (service.name || '').toLowerCase();

      // Device phrases mapping
      const devicePhrasesMap = {
        water_purifier: ['máy lọc nước', 'lọc nước', 'lõi lọc', 'màng lọc', 'ro', 'nano', 'geyser', 'karofi', 'kangaroo'],
        water_heater: ['bình nóng lạnh', 'máy nước nóng', 'bình nước nóng', 'nước nóng', 'ariston', 'ferroli', 'picenza', 'rossi'],
        camera: ['camera', 'ezviz', 'imou', 'dahua', 'hikvision'],
        air_purifier: ['máy lọc không khí', 'máy lọc khí', 'lọc không khí', 'lọc khí', 'sharp', 'xiaomi', 'daikin']
      };

      const devicePhrases = devicePhrasesMap[subcat] || ['máy lọc nước'];

      // Extract action phrase from service name (e.g. "lắp đặt", "thay", "sửa", "bảo dưỡng", "vệ sinh", "tháo")
      const actionMatches = serviceNameLower.match(/(lắp đặt|lắp|sửa|bảo dưỡng|vệ sinh|thay|tháo|sục rửa|khắc phục)/i);
      const actionKeyword = actionMatches ? actionMatches[0].toLowerCase() : '';

      // Score videos based on precise action + device content match
      const scoredVideos = allVideosList.map(v => {
        const title = (v.name || v.title || '').toLowerCase();
        const desc = (v.description || '').toLowerCase();
        const text = title + ' ' + desc;

        let score = 0;

        // 1. Must match target device phrase
        const matchedDevice = devicePhrases.find(dp => text.includes(dp));
        if (!matchedDevice) {
          return { video: v, score: 0 };
        }
        score += 40;

        // 2. Action match (e.g., "lắp đặt" / "lắp")
        if (actionKeyword) {
          if (text.includes(actionKeyword) || (actionKeyword === 'lắp đặt' && text.includes('lắp'))) {
            score += 50;
          }
        }

        // 3. Combined phrase match (e.g., "lắp đặt máy lọc nước")
        if (actionKeyword && matchedDevice) {
          const combinedPhrase1 = `${actionKeyword} ${matchedDevice}`;
          const combinedPhrase2 = `lắp ${matchedDevice}`;
          if (text.includes(combinedPhrase1) || text.includes(combinedPhrase2)) {
            score += 30;
          }
        }

        // 4. Word token matches
        const nameTokens = serviceNameLower.split(/[\s+\/(),-]+/).filter(t => t.length >= 2);
        nameTokens.forEach(t => {
          if (text.includes(t)) score += 5;
        });

        return { video: v, score };
      });

      // Filter videos with score >= 40 and sort descending by score
      const matchedVideos = scoredVideos
        .filter(item => item.score >= 40)
        .sort((a, b) => b.score - a.score)
        .map(item => item.video);

      // ONLY display videos strictly matching the service topic
      sdVideoPlaylist = matchedVideos;

      if (sdVideoPlaylist.length > 0) {
        sdVideoCurrentIndex = 0;
        renderSdVideoPlaylist(container);
        loadSdYoutubeAPI().then(() => {
          initSdYoutubePlayer(container);
        });
      } else {
        // If no video matches this service, hide the video section completely
        const videoSectionCard = container.querySelector('#sdVideoSectionCard');
        if (videoSectionCard) {
          videoSectionCard.style.display = 'none';
        }
      }
    })
    .catch((err) => {
      console.error("Error loading service detail videos:", err);
      const videoSectionCard = container.querySelector('#sdVideoSectionCard');
      if (videoSectionCard) {
        videoSectionCard.style.display = 'none';
      }
    });
}

function renderSdVideoPlaylist(container) {
  const listContainer = container.querySelector("#sdVideoHomePlaylist");
  if (!listContainer) return;

  listContainer.innerHTML = sdVideoPlaylist.map((item, index) => {
    const imageUrl = item.link ? videoService.getYoutubeThumbnail(item.link) : "/images/logo.png";
    const title = item.name || item.title || "Video hướng dẫn";
    const date = item.created_at || new Date().toISOString();

    return `
      <div class="video-playlist-item ${index === sdVideoCurrentIndex ? 'active' : ''}" data-index="${index}">
        <div class="video-playlist-thumb">
          <img src="${imageUrl}" alt="${title}" onerror="this.src='/images/logo.png'">
        </div>
        <div class="video-playlist-info">
          <h3 class="video-playlist-title">${title}</h3>
          <span class="video-playlist-date"><i class="fas fa-calendar"></i> ${formatDate(date)}</span>
        </div>
      </div>
    `;
  }).join('');

  listContainer.querySelectorAll('.video-playlist-item').forEach(itemEl => {
    itemEl.addEventListener('click', () => {
      const idx = parseInt(itemEl.getAttribute('data-index'), 10);
      if (!isNaN(idx)) {
        playSdVideoFromList(container, idx);
      }
    });
  });
}

function initSdYoutubePlayer(container) {
  const currentVideo = sdVideoPlaylist[sdVideoCurrentIndex];
  if (!currentVideo) return;

  const videoId = videoService.extractVideoId(currentVideo.link);
  if (!videoId) return;

  const playerEl = container.querySelector("#sdYoutubePlayer");
  if (!playerEl) return;

  try {
    sdYoutubePlayerInstance = new window.YT.Player(playerEl, {
      videoId: videoId,
      playerVars: {
        'autoplay': 1,
        'mute': 1,
        'rel': 0,
        'iv_load_policy': 3,
        'modestbranding': 1
      },
      events: {
        'onReady': (e) => e.target.playVideo(),
        'onStateChange': (e) => {
          if (e.data === window.YT.PlayerState.ENDED) {
            // Keep playing current video or stop
          }
        }
      }
    });
  } catch (e) {
    console.warn("Could not init YouTube Player:", e);
  }
}

function playNextSdVideo(container) {
  sdVideoCurrentIndex++;
  if (sdVideoCurrentIndex >= sdVideoPlaylist.length) {
    sdVideoCurrentIndex = 0;
  }
  updateSdPlayerAndList(container);
}

function playSdVideoFromList(container, index) {
  sdVideoCurrentIndex = index;
  updateSdPlayerAndList(container);
}

function updateSdPlayerAndList(container) {
  const currentVideo = sdVideoPlaylist[sdVideoCurrentIndex];
  if (!currentVideo) return;

  const videoId = videoService.extractVideoId(currentVideo.link);

  if (sdYoutubePlayerInstance && typeof sdYoutubePlayerInstance.loadVideoById === 'function' && videoId) {
    sdYoutubePlayerInstance.loadVideoById(videoId);
  }

  renderSdVideoPlaylist(container);
}

// Function to open location picker modal for Service Detail Page
function openLocationModal(container, service = {}) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'address-modal-overlay';
  modalOverlay.style.zIndex = '1200';

  let selectedProvince = null;
  let searchTerm = '';

  const renderModalContent = () => {
    modalOverlay.innerHTML = `
      <div class="address-modal-card">
        <div class="address-modal-header">
          <h2><i class="fas fa-map-marker-alt" style="color:var(--primary-color, #f97316);"></i> Chọn khu vực của bạn</h2>
          <button class="address-modal-close" id="closeAddrBtn">&times;</button>
        </div>

        <div class="address-search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="addrSearchInput" value="${searchTerm.replace(/"/g, '&quot;')}" placeholder="Tìm kiếm vị trí (Tỉnh, Quận/Huyện, Phường/Xã)..." />
        </div>

        ${!selectedProvince ? `
          <button class="use-current-location-btn" id="addrUseGpsBtn">
            <i class="fas fa-crosshairs"></i> Sử dụng vị trí hiện tại (GPS)
          </button>
        ` : ''}

        ${selectedProvince ? `
          <div class="address-selected-hierarchy">
            <div class="hierarchy-header">
              <span class="hierarchy-title">Khu vực được chọn</span>
              <button class="hierarchy-reset-btn" id="addrResetBtn">Thiết lập lại</button>
            </div>
            <div class="stepper-tree">
              <div class="stepper-node">
                <div class="stepper-icon-done"><i class="fas fa-check"></i></div>
                <span class="stepper-label">${selectedProvince.name}</span>
              </div>
              <div class="stepper-line"></div>
              <div class="stepper-node">
                <div class="stepper-icon-active"></div>
                <span class="stepper-label placeholder">Chọn Phường/Xã / Quận/Huyện</span>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="address-section-title">
          ${selectedProvince ? 'Chọn Phường/Xã / Quận/Huyện' : 'Chọn Tỉnh/Thành phố'}
        </div>

        <div class="address-items-list" id="addrItemsList">
        </div>
      </div>
    `;

    const itemsList = modalOverlay.querySelector('#addrItemsList');
    const term = searchTerm.trim().toLowerCase();

    if (!selectedProvince) {
      let customRowHTML = '';
      if (searchTerm.trim().length > 0) {
        const safeTerm = searchTerm.trim().replace(/"/g, '&quot;');
        customRowHTML = `
          <div class="address-item-row custom-search-item" data-name="${safeTerm}" style="background:#fff7ed; color:#f97316; font-weight:600; border-bottom:1px solid #ffedd5; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-location-dot"></i> Sử dụng vị trí tìm kiếm: "${safeTerm}"
          </div>
        `;
      }

      const filtered = PROVINCES_DATA.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.districts.some(d => d.toLowerCase().includes(term))
      );

      if (filtered.length === 0 && !term) {
        itemsList.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Không tìm thấy tỉnh/thành phố phù hợp</div>`;
      } else {
        itemsList.innerHTML = customRowHTML + filtered.map(p => `
          <div class="address-item-row prov-item" data-name="${p.name}">${p.name}</div>
        `).join('');
      }
    } else {
      let customRowHTML = '';
      if (searchTerm.trim().length > 0) {
        const safeTerm = `${selectedProvince.name}, ${searchTerm.trim()}`.replace(/"/g, '&quot;');
        customRowHTML = `
          <div class="address-item-row custom-search-item" data-name="${safeTerm}" style="background:#fff7ed; color:#f97316; font-weight:600; border-bottom:1px solid #ffedd5; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-location-dot"></i> Sử dụng vị trí tìm kiếm: "${safeTerm}"
          </div>
        `;
      }

      const filtered = selectedProvince.districts.filter(d => d.toLowerCase().includes(term));

      if (filtered.length === 0 && !term) {
        itemsList.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">Không tìm thấy phường/xã phù hợp</div>`;
      } else {
        itemsList.innerHTML = customRowHTML + filtered.map(d => `
          <div class="address-item-row dist-item" data-name="${d}">${d}</div>
        `).join('');
      }
    }

    // Attach events
    modalOverlay.querySelector('#closeAddrBtn')?.addEventListener('click', () => modalOverlay.remove());

    const searchInput = modalOverlay.querySelector('#addrSearchInput');
    searchInput?.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderModalContent();
      const newSearchInput = modalOverlay.querySelector('#addrSearchInput');
      if (newSearchInput) {
        newSearchInput.focus();
        newSearchInput.setSelectionRange(searchTerm.length, searchTerm.length);
      }
    });

    modalOverlay.querySelector('#addrResetBtn')?.addEventListener('click', () => {
      selectedProvince = null;
      searchTerm = '';
      renderModalContent();
    });

    const useGpsBtn = modalOverlay.querySelector('#addrUseGpsBtn');
    if (useGpsBtn) {
      useGpsBtn.addEventListener('click', async () => {
        useGpsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lấy vị trí...';
        useGpsBtn.disabled = true;
        try {
          const coords = await getUserLocation();
          const geoData = await reverseGeocode(coords.latitude, coords.longitude);
          const addr = geoData.address || {};
          let detectedDistrict = addr.city_district || addr.district || addr.suburb || addr.county || addr.town || addr.city || '';
          detectedDistrict = detectedDistrict.replace(/^(Quận|Huyện|Thành phố|Phường|Xã)\s+/i, '').trim();

          if (detectedDistrict) {
            updateLocationAndRefresh(detectedDistrict);
            Toast.success(`Đã tự động xác định vị trí: ${detectedDistrict}`, 3000);
            modalOverlay.remove();
          } else {
            Toast.warning("Không tìm thấy thông tin khu vực cụ thể từ GPS.", 2500);
          }
        } catch (err) {
          console.error("GPS Error:", err);
          Toast.error("Không thể lấy vị trí hiện tại. Vui lòng cho phép quyền định vị.", 3000);
        } finally {
          if (modalOverlay.isConnected) {
            useGpsBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Sử dụng vị trí hiện tại (GPS)';
            useGpsBtn.disabled = false;
          }
        }
      });
    }

    itemsList.querySelectorAll('.custom-search-item').forEach(item => {
      item.addEventListener('click', () => {
        const customLoc = item.getAttribute('data-name');
        if (customLoc) {
          updateLocationAndRefresh(customLoc);
          Toast.success(`Đã chọn địa chỉ: ${customLoc}`, 2500);
          modalOverlay.remove();
        }
      });
    });

    itemsList.querySelectorAll('.prov-item').forEach(item => {
      item.addEventListener('click', () => {
        const provName = item.getAttribute('data-name');
        selectedProvince = PROVINCES_DATA.find(p => p.name === provName);
        searchTerm = '';
        renderModalContent();
      });
    });

    itemsList.querySelectorAll('.dist-item').forEach(item => {
      item.addEventListener('click', () => {
        const distName = item.getAttribute('data-name');
        const finalLocation = `${selectedProvince.name}, ${distName}`;
        updateLocationAndRefresh(finalLocation);
        Toast.success(`Đã chọn địa chỉ: ${finalLocation}`, 2500);
        modalOverlay.remove();
      });
    });
  };

  const updateLocationAndRefresh = (newLoc) => {
    localStorage.setItem("user_selected_district", newLoc);
    localStorage.setItem("services_selected_location", newLoc);
    localStorage.setItem("user_location", newLoc);
    loadTechnicians(container, service);
  };

  renderModalContent();
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.remove();
  });

  document.body.appendChild(modalOverlay);
}
