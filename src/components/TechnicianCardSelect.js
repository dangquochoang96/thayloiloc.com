/**
 * TechnicianCardSelect.js
 * Visual Card Selector component for Choosing Favorite/Suggested Technicians
 * Includes Smart Distance & Rating recommendations (Nearest & Best Rated Techs within 20km)
 * Strict Rule 1: Only technicians with actual reviews/ratings (count > 0) are suggested as Top Rated.
 * Strict Rule 2: Filter suggested technicians by 20km radius from user address.
 * Strict Rule 3: Display current filter target address explicitly on section header.
 */

import { calculateDistance } from "../utils/geohash.js";
import { geocodeAddress } from "../utils/geocoding.js";
import { SupportService } from "../services/support.service.js";

let renderSequenceId = 0;

export async function renderTechnicianCards({
  cardsContainer,
  selectElement,
  favorites = [],
  suggestedTechs = [],
  selectedTechId = "",
  staffData = [],
  userAddress = ""
}) {
  if (!cardsContainer || !selectElement) return;

  const currentSeq = ++renderSequenceId;

  // Always read the live address from form input if available
  const formParent = cardsContainer.closest('form') || selectElement.form || document;
  const addressInputElem = formParent.querySelector("#address");
  const targetAddress = (addressInputElem && addressInputElem.value.trim() !== '') 
    ? addressInputElem.value.trim() 
    : (userAddress || "").trim();

  // Show smooth loading state immediately while distance calculation runs
  if (targetAddress && cardsContainer) {
    const safeLocLabel = targetAddress
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    cardsContainer.innerHTML = `
      <div class="staff-card-loading-state">
        <div class="staff-card-loading-spinner"></div>
        <div style="font-size: 0.88rem; font-weight: 600; color: #1e293b;">Đang tìm kỹ thuật viên gần địa chỉ của bạn...</div>
        <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">Đang tìm thợ trong bán kính 20km từ "${safeLocLabel}"</div>
      </div>
    `;
  }

  // 1. Geocode target address
  let userCoords = null;
  if (targetAddress) {
    try {
      userCoords = await geocodeAddress(targetAddress);
    } catch (e) {
      console.warn("Could not geocode target address:", targetAddress, e);
    }
  }

  if (currentSeq !== renderSequenceId) return;

  // Helper function to process distance for a technician item
  const processTechDistance = async (tech) => {
    let techLat = tech.latitude;
    let techLon = tech.longitude;

    if (!techLat || !techLon) {
      const addr = (tech.address || tech.area || '').replace(/\|+/g, ' ').trim();
      if (addr) {
        try {
          const coords = await geocodeAddress(addr);
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
      distKm = Math.round(distKm * 10) / 10;
      if (distKm <= 20) {
        isMatched = true;
      }
    } else if (!targetAddress) {
      isMatched = true;
    }

    return {
      ...tech,
      _distKm: distKm,
      _isWithin20km: isMatched
    };
  };

  // Calculate distance for Favorites AND Suggested Technicians
  const [processedFavs, processedSuggested] = await Promise.all([
    Promise.all(favorites.map(f => processTechDistance(f))),
    Promise.all(suggestedTechs.map(s => processTechDistance(s)))
  ]);

  if (currentSeq !== renderSequenceId) return;

  // Filter suggested techs to only those within 20km
  const validSuggestedTechs = processedSuggested.filter(t => t._isWithin20km);

  // Clear existing cards container
  cardsContainer.innerHTML = "";

  // Prepare full list of staff for form value lookup
  staffData.length = 0;
  processedFavs.forEach(f => staffData.push(f));
  validSuggestedTechs.forEach(s => {
    if (!staffData.some(item => String(item.id) === String(s.id))) {
      staffData.push(s);
    }
  });

  const currentVal = selectElement.value || selectedTechId || "";

  // Keep native select options in sync for form submission
  selectElement.innerHTML = '<option value="">-- Không chọn (hệ thống sẽ tự động phân công) --</option>';

  if (processedFavs.length > 0) {
    const favGroup = document.createElement('optgroup');
    favGroup.label = '❤️ Thợ yêu thích của bạn';
    processedFavs.forEach(staff => {
      const option = document.createElement('option');
      option.value = staff.id;
      option.textContent = `❤️ ${staff.username || 'Kỹ thuật viên'} - ${staff.phone || ''}`;
      favGroup.appendChild(option);
    });
    selectElement.appendChild(favGroup);
  }

  if (validSuggestedTechs.length > 0) {
    const suggestGroup = document.createElement('optgroup');
    suggestGroup.label = '⭐ Gợi ý thợ giỏi gần bạn';
    validSuggestedTechs.forEach(staff => {
      const alreadyInFav = processedFavs.some(f => String(f.id) === String(staff.id));
      if (!alreadyInFav) {
        const option = document.createElement('option');
        option.value = staff.id;
        option.textContent = `⭐ ${staff.username || 'Kỹ thuật viên'}${staff.phone ? ` - ${staff.phone}` : ''}`;
        suggestGroup.appendChild(option);
      }
    });
    if (suggestGroup.children.length > 0) {
      selectElement.appendChild(suggestGroup);
    }
  }

  // 1. Render Auto-Assign Card (Default option)
  const isAutoSelected = !currentVal;
  const autoCard = document.createElement("div");
  autoCard.className = `staff-card-item ${isAutoSelected ? "selected" : ""}`;
  autoCard.dataset.value = "";
  autoCard.innerHTML = `
    <div class="staff-card-header">
      <div class="staff-card-avatar auto-avatar">
        <i class="fas fa-magic"></i>
      </div>
      <div class="staff-card-title-group">
        <div class="staff-card-name">Tự động phân công</div>
        <div class="staff-card-phone"><i class="fas fa-bolt"></i> Hệ thống chọn thợ gần bạn nhất</div>
      </div>
      <div class="staff-card-radio">
        <i class="fas fa-check"></i>
      </div>
    </div>
    <div class="staff-card-footer">
      <span class="staff-card-tag auto-tag"><i class="fas fa-tachometer-alt"></i> Nhanh nhất</span>
      <span style="font-size: 0.75rem; color: #64748b; font-weight: 500;">Khuyên dùng</span>
    </div>
  `;
  cardsContainer.appendChild(autoCard);

  // Helper to render card for a KTV item
  const createTechCard = (staff, isFavorite = false) => {
    const isSelected = String(currentVal) === String(staff.id);
    const card = document.createElement("div");
    card.className = `staff-card-item ${isSelected ? "selected" : ""}`;
    card.dataset.value = staff.id;

    const initial = (staff.username || staff.name || "K").trim().charAt(0).toUpperCase();
    const phoneStr = staff.phone || "Chưa cập nhật SĐT";
    const rawAddr = staff.address || staff.area || "";
    
    const hasDist = typeof staff._distKm === 'number' && !isNaN(staff._distKm);
    const distSuffix = hasDist ? ` (Cách ${staff._distKm} km)` : '';
    const displayAddr = rawAddr ? `${rawAddr}${distSuffix}` : '';

    card.innerHTML = `
      <div class="staff-card-header">
        <div class="staff-card-avatar ${isFavorite ? "fav-avatar" : ""}">
          ${staff.avatar ? `<img src="${staff.avatar}" alt="${staff.username || 'KTV'}">` : initial}
        </div>
        <div class="staff-card-title-group">
          <div class="staff-card-name" title="${staff.username || 'Kỹ thuật viên'}">${staff.username || 'Kỹ thuật viên'}</div>
          <div class="staff-card-phone"><i class="fas fa-phone"></i> ${phoneStr}</div>
          <div class="staff-card-rating" id="staff-rating-${staff.id}">
            <i class="far fa-star" style="color:#cbd5e1;"></i> <span style="color:#94a3b8; font-size:0.75rem;">Chưa có đánh giá</span>
          </div>
        </div>
        <div class="staff-card-radio">
          <i class="fas fa-check"></i>
        </div>
      </div>
      ${displayAddr ? `
      <div class="staff-card-body">
        <div class="staff-card-address" title="${displayAddr}">
          <i class="fas fa-map-marker-alt"></i> <span id="staff-addr-${staff.id}">${displayAddr}</span>
        </div>
      </div>` : ''}
      <div class="staff-card-footer">
        <span class="staff-card-tag-wrapper" id="staff-tag-wrapper-${staff.id}">
          ${isFavorite 
            ? `<span class="staff-card-tag fav-tag"><i class="fas fa-heart"></i> Yêu thích</span>` 
            : `<span class="staff-card-tag suggest-tag"><i class="fas fa-user-check"></i> Sẵn sàng</span>`}
        </span>
        <button type="button" class="staff-card-detail-btn" data-tech-id="${staff.id}">
          <i class="fas fa-user-circle"></i> Chi tiết
        </button>
      </div>
    `;

    return card;
  };

  // 2. Render Favorite Technicians Section (if any)
  if (processedFavs.length > 0) {
    const favHeader = document.createElement("div");
    favHeader.className = "staff-card-section-title";
    favHeader.style.cssText = "grid-column: 1 / -1; font-weight: 700; font-size: 0.88rem; color: #dc2626; margin-top: 6px; display: flex; align-items: center; gap: 6px;";
    favHeader.innerHTML = `<i class="fas fa-heart"></i> Thợ Yêu Thích Của Bạn (${processedFavs.length})`;
    cardsContainer.appendChild(favHeader);

    processedFavs.forEach(staff => {
      const card = createTechCard(staff, true);
      cardsContainer.appendChild(card);
    });
  }

  // 3. Render Suggested Technicians Section (ONLY techs within 20km)
  const suggestedFiltered = validSuggestedTechs.filter(s => !processedFavs.some(f => String(f.id) === String(s.id)));

  if (suggestedFiltered.length > 0) {
    const suggestHeader = document.createElement("div");
    suggestHeader.className = "staff-card-section-title";
    suggestHeader.style.cssText = "grid-column: 1 / -1; font-weight: 700; font-size: 0.88rem; color: #ea580c; margin-top: 10px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;";
    const locBadgeText = targetAddress ? `<span style="font-size: 0.78rem; font-weight: 500; color: #475569; background: #f1f5f9; padding: 2px 8px; border-radius: 12px; margin-left: auto; border: 1px solid #e2e8f0;"><i class="fas fa-map-pin" style="color:#ea580c;"></i> Địa chỉ lọc: "${targetAddress}"</span>` : '';
    suggestHeader.innerHTML = `<i class="fas fa-star"></i> Gợi Ý Thợ Giỏi Gần Bạn (${suggestedFiltered.length}) ${locBadgeText}`;
    cardsContainer.appendChild(suggestHeader);

    suggestedFiltered.forEach(staff => {
      const card = createTechCard(staff, false);
      cardsContainer.appendChild(card);
    });
  } else if (targetAddress) {
    const safeLoc = targetAddress
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const emptyNotice = document.createElement("div");
    emptyNotice.className = "staff-card-empty-notice";
    emptyNotice.style.cssText = "grid-column: 1 / -1; background: #fffcf9; border: 1px dashed #fed7aa; border-radius: 10px; padding: 12px 14px; text-align: center; margin-top: 6px; font-size: 0.84rem; color: #64748b;";
    emptyNotice.innerHTML = `
      <i class="fas fa-info-circle" style="color:#f97316; margin-right: 4px;"></i>
      <span>Không có kỹ thuật viên nào trong bán kính 20km từ địa chỉ <strong>"${safeLoc}"</strong>. Bạn có thể chọn <strong>"Tự động phân công"</strong> để hệ thống tự động sắp xếp thợ gần nhất.</span>
    `;
    cardsContainer.appendChild(emptyNotice);
  }

  // Bind click events on cards
  const allCards = cardsContainer.querySelectorAll(".staff-card-item");
  allCards.forEach(card => {
    card.addEventListener("click", (e) => {
      const detailBtn = e.target.closest(".staff-card-detail-btn");
      if (detailBtn) {
        e.stopPropagation();
        const techId = detailBtn.dataset.techId;
        if (techId) {
          window.location.hash = `#/technician-detail?id=${techId}`;
        }
        return;
      }

      const val = card.dataset.value || "";
      selectElement.value = val;

      allCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");

      const changeEvent = new Event("change", { bubbles: true });
      selectElement.dispatchEvent(changeEvent);
    });
  });

  enhanceTechnicianCardsWithRatings([...processedFavs, ...validSuggestedTechs], cardsContainer, currentSeq);
}

/**
 * Calculates ratings asynchronously to add 'Gần bạn nhất' and 'Đánh giá tốt nhất' badges
 * CRITICAL RULE: Nearest badge 'Gần bạn nhất' is ONLY added if distance is <= 20km!
 */
async function enhanceTechnicianCardsWithRatings(staffList = [], cardsContainer, seqId) {
  if (!staffList || staffList.length === 0 || !cardsContainer) return;

  let minDistance = Infinity;
  let nearestTechId = null;
  let highestScore = -Infinity;
  let topRatedTechId = null;

  // Find nearest technician ONLY within 20km!
  staffList.forEach(tech => {
    if (typeof tech._distKm === 'number' && !isNaN(tech._distKm) && tech._distKm <= 20 && tech._distKm < minDistance) {
      minDistance = tech._distKm;
      nearestTechId = tech.id;
    }
  });

  // Process rating for each tech
  await Promise.all(
    staffList.map(async (tech) => {
      let avgRating = 0;
      let ratingCount = 0;

      try {
        const resRating = await SupportService.getListOrderRating(tech.id, true);
        const reviews = resRating.data || resRating || [];
        if (Array.isArray(reviews) && reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rate) || 5), 0);
          avgRating = Math.round((sum / reviews.length) * 10) / 10;
          ratingCount = reviews.length;
        }
      } catch (e) {
        avgRating = 0;
        ratingCount = 0;
      }

      if (seqId !== renderSequenceId) return;

      if (ratingCount > 0) {
        const score = (avgRating * 100) + Math.min(ratingCount * 15, 250);
        if (score > highestScore) {
          highestScore = score;
          topRatedTechId = tech.id;
        }
      }

      const ratingEl = cardsContainer.querySelector(`#staff-rating-${tech.id}`);
      if (ratingEl) {
        if (ratingCount > 0) {
          ratingEl.innerHTML = `<i class="fas fa-star" style="color:#f59e0b;"></i> ${avgRating.toFixed(1)} <span style="color:#64748b; font-size:0.75rem;">(${ratingCount} đánh giá)</span>`;
        } else {
          ratingEl.innerHTML = `<i class="far fa-star" style="color:#cbd5e1;"></i> <span style="color:#94a3b8; font-size:0.75rem;">Chưa có đánh giá</span>`;
        }
      }
    })
  );

  if (seqId !== renderSequenceId) return;

  // Apply Nearest and Top Rated tags to matched tech cards
  staffList.forEach(tech => {
    const tagWrapper = cardsContainer.querySelector(`#staff-tag-wrapper-${tech.id}`);
    if (!tagWrapper) return;

    const isNearest = nearestTechId !== null && String(tech.id) === String(nearestTechId);
    const isTopRated = topRatedTechId !== null && String(tech.id) === String(topRatedTechId);

    if (isNearest && isTopRated) {
      tagWrapper.innerHTML = `<span class="staff-card-tag nearest-tag"><i class="fas fa-crown"></i> Gần nhất & Đánh giá cao nhất</span>`;
    } else if (isNearest) {
      const distText = typeof tech._distKm === 'number' && !isNaN(tech._distKm) ? `${tech._distKm} km` : 'Gần bạn nhất';
      tagWrapper.innerHTML = `<span class="staff-card-tag nearest-tag"><i class="fas fa-location-arrow"></i> Gần bạn nhất (${distText})</span>`;
    } else if (isTopRated) {
      tagWrapper.innerHTML = `<span class="staff-card-tag top-rated-tag"><i class="fas fa-award"></i> Đánh giá tốt nhất</span>`;
    }
  });

  // Enable touch & mouse drag swipe
  enableSwipeToScroll(cardsContainer);
}

/**
 * Enables smooth Pointer Events swiping (touch, mouse, stylus) on cards container
 */
export function enableSwipeToScroll(container) {
  if (!container || container.dataset.swipeBound) return;
  container.dataset.swipeBound = "true";

  let isPointerDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let isDragging = false;

  container.style.touchAction = "pan-y";
  container.style.cursor = "grab";

  container.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    
    isPointerDown = true;
    isDragging = false;
    startX = e.clientX;
    scrollLeft = container.scrollLeft;
    container.style.cursor = "grabbing";
  });

  container.addEventListener("pointermove", (e) => {
    if (!isPointerDown) return;
    const diffX = e.clientX - startX;
    
    if (Math.abs(diffX) > 5) {
      isDragging = true;
      container.scrollLeft = scrollLeft - diffX;
    }
  });

  const endDrag = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    container.style.cursor = "grab";
  };

  container.addEventListener("pointerup", endDrag);
  container.addEventListener("pointercancel", endDrag);

  // Prevent card click selection if user was dragging/swiping
  container.addEventListener("click", (e) => {
    if (isDragging) {
      e.stopPropagation();
      e.preventDefault();
      isDragging = false;
    }
  }, true);
}
