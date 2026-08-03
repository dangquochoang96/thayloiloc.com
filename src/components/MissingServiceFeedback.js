import { authService } from '../services/auth.service.js';
import { productService } from '../services/product.service.js';
import { api } from '../services/api.js';
import { Toast } from '../utils/toast.js';
import { renderCustomAddressSelectHTML, setupCustomAddressSelectListeners } from './CustomAddressSelect.js';
import '../styles/components/missing-service-feedback.css';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function MissingServiceFeedback({ categoryName = '' } = {}) {
  const container = document.createElement('div');
  container.className = 'missing-service-container';

  const user = authService.getCurrentUser();
  const isLoggedIn = !!user;

  // Extract phone number if user is logged in
  const userPhone = isLoggedIn
    ? (user?.phone || user?.phone_number || user?.phoneNumber || (user?.username && /^\d+$/.test(user.username) ? user.username : ''))
    : '';

  const customerId = isLoggedIn
    ? (user?.id || user?.user_id || user?.userId || '')
    : '';

  const userAddress = isLoggedIn
    ? (user?.address || user?.diachi || user?.dia_chi || '')
    : '';

  const availableAddresses = [];
  if (isLoggedIn && userAddress) {
    availableAddresses.push({
      id: 'profile',
      label: 'Địa chỉ tài khoản',
      value: userAddress
    });
  }

  const subtitleText = categoryName
    ? `Hiện chưa có dịch vụ sẵn cho "${categoryName}". Vui lòng gửi yêu cầu để chúng tôi hỗ trợ!`
    : 'Hiện chưa có dịch vụ sẵn cho lựa chọn này. Vui lòng gửi yêu cầu để chúng tôi hỗ trợ!';

  const renderForm = () => {
    container.innerHTML = `
      <div class="missing-service-card">
        <div class="missing-service-header">
          <div class="missing-service-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>Không tìm thấy dịch vụ</h3>
          <p>${escapeHtml(subtitleText)}</p>
        </div>

        <form class="missing-service-form" id="missingServiceForm">
          <div class="form-group">
            <label for="missingPhone">
              <i class="fas fa-phone-alt"></i> Số điện thoại liên hệ
              ${isLoggedIn && userPhone ? '<span class="user-status-badge"><i class="fas fa-check-circle"></i> Đã đăng nhập</span>' : '<span class="required-star">*</span>'}
            </label>
            <input 
              type="tel" 
              id="missingPhone" 
              name="phone" 
              class="missing-input" 
              placeholder="Nhập số điện thoại của bạn..."
              value="${escapeHtml(userPhone)}" 
              ${isLoggedIn && userPhone ? 'readonly' : 'required'}
            />
            ${isLoggedIn && userPhone ? '<small class="input-note"><i class="fas fa-info-circle"></i> Tự động lấy từ tài khoản của bạn</small>' : '<small class="input-note">Vui lòng nhập SĐT để chúng tôi gọi lại tư vấn</small>'}
          </div>

          <div class="form-group" id="addressGroup">
            <label for="missingAddress">
              <i class="fas fa-map-marker-alt"></i> Địa chỉ nhận hỗ trợ
              ${isLoggedIn ? '<span class="user-status-badge"><i class="fas fa-check-circle"></i> Đã đăng nhập</span>' : '<span class="required-star">*</span>'}
            </label>
            ${isLoggedIn ? `
              <div id="addressSelectContainer">
                ${renderAddressSelectorHTML(availableAddresses)}
              </div>
              <div id="customAddressGroup" class="custom-address-group" style="${availableAddresses.length > 0 ? 'display: none;' : ''} margin-top: 8px;">
                <input 
                  type="text" 
                  id="missingAddressCustom" 
                  name="addressCustom" 
                  class="missing-input" 
                  placeholder="Nhập địa chỉ nhận dịch vụ..." 
                  value="${availableAddresses.length === 0 ? escapeHtml(userAddress) : ''}"
                />
              </div>
              <small class="input-note" id="addressNote">
                ${availableAddresses.length > 0 
                  ? '<i class="fas fa-info-circle"></i> Chọn địa chỉ từ tài khoản hoặc chọn "Nhập địa chỉ khác"' 
                  : '<i class="fas fa-info-circle"></i> Nhập địa chỉ cụ thể để kỹ thuật viên hỗ trợ'}
              </small>
            ` : `
              <input 
                type="text" 
                id="missingAddress" 
                name="address" 
                class="missing-input" 
                placeholder="Nhập địa chỉ nhận hỗ trợ (VD: Số 10, Ngõ 5, Hà Đông, Hà Nội)..."
                required
              />
              <small class="input-note"><i class="fas fa-info-circle"></i> Vui lòng nhập địa chỉ để chúng tôi hỗ trợ tận nơi</small>
            `}
          </div>

          <div class="form-group">
            <label for="missingDescription">
              <i class="fas fa-edit"></i> Dịch vụ bạn đang tìm kiếm <span class="required-star">*</span>
            </label>
            <textarea 
              id="missingDescription" 
              name="description" 
              rows="3" 
              class="missing-textarea" 
              placeholder="Mô tả chi tiết loại thiết bị, sự cố hoặc dịch vụ bạn cần hỗ trợ..."
              required
            ></textarea>
          </div>

          <button type="submit" class="missing-submit-btn" id="missingSubmitBtn">
            <i class="fas fa-paper-plane"></i> Gửi Yêu Cầu Hỗ Trợ
          </button>
        </form>
      </div>
    `;

    setupAddressListeners();
    setupFormSubmit();
  };

  const renderAddressSelectorHTML = (addresses) => {
    if (!addresses || addresses.length === 0) return '';
    return renderCustomAddressSelectHTML({
      selectId: 'missingAddressSelect',
      addresses: addresses
    });
  };

  const setupAddressListeners = () => {
    const customAddressGroup = container.querySelector('#customAddressGroup');
    const customAddressInput = container.querySelector('#missingAddressCustom');

    setupCustomAddressSelectListeners(container, 'missingAddressSelect', (val) => {
      if (val === '__custom__') {
        if (customAddressGroup) customAddressGroup.style.display = 'block';
        if (customAddressInput) customAddressInput.focus();
      } else {
        if (customAddressGroup) customAddressGroup.style.display = 'none';
      }
    });
  };

  // Fetch extra addresses from products if user is logged in
  if (isLoggedIn && customerId) {
    productService.getListProduct(customerId).then(products => {
      if (Array.isArray(products) && products.length > 0) {
        let added = false;
        products.forEach(p => {
          if (p.address && typeof p.address === 'string' && p.address.trim()) {
            const trimmed = p.address.trim();
            if (!availableAddresses.some(a => a.value.trim() === trimmed)) {
              availableAddresses.push({
                id: `prod_${p.id}`,
                label: `Địa chỉ thiết bị (${p.product?.name || p.name || 'Sản phẩm'})`,
                value: trimmed
              });
              added = true;
            }
          }
        });

        if (added) {
          const containerSelect = container.querySelector('#addressSelectContainer');
          const customAddressGroup = container.querySelector('#customAddressGroup');
          if (containerSelect) {
            containerSelect.innerHTML = renderAddressSelectorHTML(availableAddresses);
            if (availableAddresses.length > 0 && customAddressGroup) {
              customAddressGroup.style.display = 'none';
            }
            setupAddressListeners();
          }
        }
      }
    }).catch(err => {
      console.warn('Could not fetch user product addresses for feedback form:', err);
    });
  }

  const setupFormSubmit = () => {
    const form = container.querySelector('#missingServiceForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const phoneInput = form.querySelector('#missingPhone');
      const descInput = form.querySelector('#missingDescription');
      const submitBtn = form.querySelector('#missingSubmitBtn');

      const phone = phoneInput ? phoneInput.value.trim() : '';
      const description = descInput ? descInput.value.trim() : '';

      // Address resolution
      let address = '';
      if (isLoggedIn) {
        const addressSelect = form.querySelector('#missingAddressSelect');
        const customInput = form.querySelector('#missingAddressCustom');

        if (addressSelect && addressSelect.value !== '__custom__') {
          address = addressSelect.value.trim();
        } else if (customInput) {
          address = customInput.value.trim();
        }
      } else {
        const addressInput = form.querySelector('#missingAddress');
        if (addressInput) {
          address = addressInput.value.trim();
        }
      }

      if (!phone) {
        Toast.error('Vui lòng nhập số điện thoại liên hệ!');
        if (phoneInput) phoneInput.focus();
        return;
      }

      // Basic phone validation (9-11 digits)
      const cleanPhone = phone.replace(/[\s\-\.]/g, '');
      const phoneRegex = /^[0-9]{9,11}$/;
      if (!phoneRegex.test(cleanPhone)) {
        Toast.error('Số điện thoại không hợp lệ. Vui lòng nhập từ 9-11 chữ số.');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!address) {
        Toast.error('Vui lòng chọn hoặc nhập địa chỉ nhận hỗ trợ!');
        const customInput = form.querySelector('#missingAddressCustom') || form.querySelector('#missingAddress');
        if (customInput) {
          customInput.focus();
        }
        return;
      }

      if (!description) {
        Toast.error('Vui lòng nhập nội dung dịch vụ bạn cần!');
        if (descInput) descInput.focus();
        return;
      }

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi yêu cầu...';

      try {
        const formData = new FormData();
        const fullDesc = `[Yêu cầu dịch vụ chưa có${categoryName ? `: ${categoryName}` : ''}] SĐT: ${phone} | Địa chỉ: ${address} | Nội dung: ${description}`;

        formData.append('description', fullDesc);
        formData.append('phone', phone);
        formData.append('phone_number', phone);
        formData.append('address', address);
        formData.append('history_id', '');
        formData.append('app', '3');
        if (customerId) {
          formData.append('customer_id', customerId);
        }

        const res = await api.postFormData('/feedbacks', formData);
        
        // Success state
        container.innerHTML = `
          <div class="missing-service-card success-state">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>Gửi yêu cầu thành công!</h3>
            <p>Cảm ơn bạn đã phản hồi. Đội ngũ tư vấn sẽ liên hệ lại qua số điện thoại <strong>${escapeHtml(phone)}</strong> (Địa chỉ: <strong>${escapeHtml(address)}</strong>) trong thời gian sớm nhất.</p>
            <button type="button" class="missing-reset-btn" id="missingResetBtn">
              <i class="fas fa-redo"></i> Gửi thêm yêu cầu khác
            </button>
          </div>
        `;

        const resetBtn = container.querySelector('#missingResetBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            renderForm();
          });
        }
      } catch (error) {
        console.error('Error submitting missing service feedback:', error);
        Toast.error(error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  };

  renderForm();

  return container;
}
