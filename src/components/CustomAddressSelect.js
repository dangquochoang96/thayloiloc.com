import '../styles/components/custom-address-select.css';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format address options into items with FontAwesome theme icons
 * @param {Array} addresses - Array of { id, label, value }
 * @returns {Array} items - Formatted list for select dropdown
 */
export function formatAddressItems(addresses = []) {
  const items = (addresses || []).map(addr => ({
    value: addr.value,
    label: addr.label,
    displayText: `${addr.label}: ${addr.value}`,
    iconClass: 'fas fa-map-marker-alt',
    isCustom: false
  }));

  items.push({
    value: '__custom__',
    label: 'Nhập địa chỉ khác...',
    displayText: 'Nhập địa chỉ khác...',
    iconClass: 'fas fa-pen',
    isCustom: true
  });

  return items;
}

/**
 * Generate HTML string for custom address select box
 * @param {Object} options
 * @param {string} options.selectId - ID for the hidden select element
 * @param {Array} options.addresses - Array of address objects
 * @param {string} [options.selectedValue] - Pre-selected value
 * @returns {string} HTML string
 */
export function renderCustomAddressSelectHTML({ selectId = 'addressSelect', addresses = [], selectedValue = '' }) {
  const items = formatAddressItems(addresses);
  const initialValue = selectedValue || (items.length > 0 ? items[0].value : '__custom__');
  const selectedItem = items.find(i => i.value === initialValue) || items[0];

  return `
    <div class="custom-address-select-wrapper" id="${selectId}_wrapper">
      <!-- Hidden native select for backwards compatibility with forms and selectors -->
      <select id="${selectId}" name="${selectId}" class="missing-select hidden-native-select" style="display: none;">
        ${items.map(item => `
          <option value="${escapeHtml(item.value)}" ${item.value === selectedItem.value ? 'selected' : ''}>
            ${escapeHtml(item.displayText)}
          </option>
        `).join('')}
      </select>

      <!-- Custom Styled Trigger Box -->
      <div class="custom-address-select-trigger" id="${selectId}_trigger" tabindex="0" role="combobox" aria-expanded="false">
        <div class="custom-address-select-content">
          <i class="${selectedItem.iconClass} custom-address-select-icon"></i>
          <span class="custom-address-select-text">${escapeHtml(selectedItem.displayText)}</span>
        </div>
        <i class="fas fa-chevron-down custom-address-select-arrow"></i>
      </div>

      <!-- Custom Dropdown Options Menu -->
      <div class="custom-address-select-options" id="${selectId}_options" role="listbox">
        ${items.map(item => {
          const isSelected = item.value === selectedItem.value;
          return `
            <div class="custom-address-select-option ${isSelected ? 'is-selected' : ''}" data-value="${escapeHtml(item.value)}" role="option">
              <i class="${item.iconClass} custom-address-select-icon"></i>
              <span class="option-text">${escapeHtml(item.displayText)}</span>
              ${isSelected ? '<i class="fas fa-check check-mark"></i>' : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Setup event listeners for a rendered custom address select component
 * @param {HTMLElement|Document} container - Container element containing the wrapper
 * @param {string} selectId - ID of the select element
 * @param {Function} [onChange] - Optional change callback(val)
 */
export function setupCustomAddressSelectListeners(container, selectId, onChange) {
  const wrapper = container.querySelector(`#${selectId}_wrapper`);
  if (!wrapper) return;

  const hiddenSelect = wrapper.querySelector(`#${selectId}`);
  const trigger = wrapper.querySelector(`#${selectId}_trigger`);
  const optionsMenu = wrapper.querySelector(`#${selectId}_options`);
  const options = wrapper.querySelectorAll('.custom-address-select-option');
  const triggerIcon = trigger ? trigger.querySelector('.custom-address-select-icon') : null;
  const triggerText = trigger ? trigger.querySelector('.custom-address-select-text') : null;

  if (!trigger || !optionsMenu || !hiddenSelect) return;

  // Toggle options menu
  const toggleMenu = (show) => {
    const isOpen = typeof show === 'boolean' ? show : !optionsMenu.classList.contains('is-open');
    if (isOpen) {
      optionsMenu.classList.add('is-open');
      trigger.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      optionsMenu.classList.remove('is-open');
      trigger.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Keyboard navigation for trigger
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    } else if (e.key === 'Escape') {
      toggleMenu(false);
    }
  });

  // Handle option selection
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.getAttribute('data-value');
      
      // Update hidden select
      hiddenSelect.value = val;

      // Update options UI state
      options.forEach(o => {
        const isThis = o.getAttribute('data-value') === val;
        o.classList.toggle('is-selected', isThis);
        let check = o.querySelector('.check-mark');
        if (isThis) {
          if (!check) {
            check = document.createElement('i');
            check.className = 'fas fa-check check-mark';
            o.appendChild(check);
          }
        } else if (check) {
          check.remove();
        }
      });

      // Update trigger UI content
      const iconInOpt = opt.querySelector('.custom-address-select-icon');
      const textInOpt = opt.querySelector('.option-text');

      if (triggerIcon && iconInOpt) {
        triggerIcon.className = `${iconInOpt.className}`;
      }
      if (triggerText && textInOpt) {
        triggerText.textContent = textInOpt.textContent;
      }

      toggleMenu(false);

      // Trigger change event on native select
      const event = new Event('change', { bubbles: true });
      hiddenSelect.dispatchEvent(event);

      if (typeof onChange === 'function') {
        onChange(val);
      }
    });
  });

  // Close menu when clicking outside
  const onOutsideClick = (e) => {
    if (!wrapper.contains(e.target)) {
      toggleMenu(false);
    }
  };
  document.addEventListener('click', onOutsideClick);

  // Sync function if value changed externally
  hiddenSelect.syncCustomUI = (newVal) => {
    const targetVal = newVal !== undefined ? newVal : hiddenSelect.value;
    options.forEach(o => {
      if (o.getAttribute('data-value') === targetVal) {
        o.click();
      }
    });
  };
}
