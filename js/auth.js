/**
 * Washly - Authentication Page Controller (Login & Register)
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
  initDemoAccountShortcuts();
});

// Password visibility toggles
function initPasswordToggles() {
  const toggleBtns = document.querySelectorAll('.btn-toggle-password');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      btn.textContent = isPassword ? 'Lihat' : 'Sembunyikan';
    });
  });
}

// Login form logic
function initLoginForm() {
  const form = document.getElementById('washly-login-form');
  if (!form) return;

  const roleTabs = document.querySelectorAll('.auth-role-tab');
  const roleInput = document.getElementById('login-role');

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const selectedRole = tab.dataset.role;
      if (roleInput) roleInput.value = selectedRole;
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const role = roleInput ? roleInput.value : 'customer';

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;

    // Email validation
    if (!WashlyValidators.isEmail(email)) {
      showInputError(emailInput, 'Format email tidak valid.');
      hasError = true;
    } else {
      clearInputError(emailInput);
    }

    // Password validation
    if (!WashlyValidators.isNonEmpty(password)) {
      showInputError(passwordInput, 'Kata sandi tidak boleh kosong.');
      hasError = true;
    } else {
      clearInputError(passwordInput);
    }

    if (hasError) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memverifikasi...';

    try {
      const result = await window.WashlyAPI.auth.login({ email, password, role });
      window.WashlyApp.showToast(`Selamat datang kembali, ${result.user.name}!`, 'success');

      setTimeout(() => {
        if (result.user.role === 'admin') {
          window.location.href = 'admin/dashboard.html';
        } else {
          window.location.href = 'customer/dashboard.html';
        }
      }, 500);
    } catch (err) {
      window.WashlyApp.showToast(err.message || 'Login gagal. Periksa email dan password.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Register form logic
function initRegisterForm() {
  const form = document.getElementById('washly-register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    const addressInput = document.getElementById('reg-address');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');

    let hasError = false;

    if (!WashlyValidators.minLength(nameInput.value, 3)) {
      showInputError(nameInput, 'Nama lengkap minimal 3 karakter.');
      hasError = true;
    } else {
      clearInputError(nameInput);
    }

    if (!WashlyValidators.isEmail(emailInput.value)) {
      showInputError(emailInput, 'Format email tidak valid.');
      hasError = true;
    } else {
      clearInputError(emailInput);
    }

    if (!WashlyValidators.isIndonesianPhone(phoneInput.value)) {
      showInputError(phoneInput, 'Nomor HP tidak valid (contoh: 081234567890).');
      hasError = true;
    } else {
      clearInputError(phoneInput);
    }

    if (!WashlyValidators.minLength(passwordInput.value, 6)) {
      showInputError(passwordInput, 'Kata sandi minimal 6 karakter.');
      hasError = true;
    } else {
      clearInputError(passwordInput);
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      showInputError(confirmPasswordInput, 'Konfirmasi kata sandi tidak cocok.');
      hasError = true;
    } else {
      clearInputError(confirmPasswordInput);
    }

    if (hasError) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mendaftarkan akun...';

    try {
      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput ? addressInput.value.trim() : '',
        password: passwordInput.value
      };

      await window.WashlyAPI.auth.register(payload);
      window.WashlyApp.showToast('Akun berhasil dibuat! Mengalihkan ke dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'customer/dashboard.html';
      }, 600);
    } catch (err) {
      window.WashlyApp.showToast(err.message || 'Pendaftaran gagal.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Demo Account Auto-Fill buttons
function initDemoAccountShortcuts() {
  const btnCustomer = document.getElementById('btn-fill-customer');
  const btnAdmin = document.getElementById('btn-fill-admin');

  if (btnCustomer) {
    btnCustomer.addEventListener('click', () => {
      document.getElementById('login-email').value = 'budi@example.com';
      document.getElementById('login-password').value = 'password123';
      const roleCustomerTab = document.querySelector('.auth-role-tab[data-role="customer"]');
      if (roleCustomerTab) roleCustomerTab.click();
    });
  }

  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      document.getElementById('login-email').value = 'admin@washly.id';
      document.getElementById('login-password').value = 'admin123';
      const roleAdminTab = document.querySelector('.auth-role-tab[data-role="admin"]');
      if (roleAdminTab) roleAdminTab.click();
    });
  }
}

function showInputError(inputEl, message) {
  inputEl.classList.add('is-invalid');
  const group = inputEl.closest('.form-group');
  if (group) {
    let errorEl = group.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      group.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function clearInputError(inputEl) {
  inputEl.classList.remove('is-invalid');
  const group = inputEl.closest('.form-group');
  if (group) {
    const errorEl = group.querySelector('.form-error');
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }
}
