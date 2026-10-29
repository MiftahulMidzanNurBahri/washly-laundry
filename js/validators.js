/**
 * Washly - Form Validation & Input Sanitization
 */

const WashlyValidators = (() => {
  return {
    isEmail(value) {
      if (!value) return false;
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(value).trim());
    },

    isIndonesianPhone(value) {
      if (!value) return false;
      // Allow 08xx or +62xx with 10-15 digits
      const cleaned = String(value).replace(/[\s-]/g, '');
      const re = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
      return re.test(cleaned);
    },

    isNonEmpty(value) {
      return value !== null && value !== undefined && String(value).trim().length > 0;
    },

    isValidWeight(value) {
      if (value === null || value === undefined || value === '') return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0 && num <= 200;
    },

    minLength(value, length) {
      return String(value || '').trim().length >= length;
    },

    // Sanitize untrusted input before rendering if ever needed
    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };
})();

if (typeof window !== 'undefined') {
  window.WashlyValidators = WashlyValidators;
}
