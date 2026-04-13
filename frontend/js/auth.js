/* auth.js */
let currentUser = JSON.parse(localStorage.getItem('qb_user') || 'null');
let authModal;

document.addEventListener('DOMContentLoaded', () => {
  authModal = new bootstrap.Modal(document.getElementById('authModal'));
  renderNav();
});

function renderNav() {
  const area   = document.getElementById('nav-auth-area');
  const mArea  = document.getElementById('mobile-auth-area');
  if (!area) return;

  if (currentUser) {
    const initials = currentUser.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const adminLink = currentUser.role === 'admin' ? `<a href="${getBase()}pages/admin.html" class="um-item"><i class="bi bi-speedometer2"></i> Admin Panel</a>` : '';
    area.innerHTML = `
      <div class="user-dropdown" id="user-dropdown">
        <button class="user-btn" onclick="toggleUserMenu()">
          <div class="user-avatar">${initials}</div>
          ${currentUser.name.split(' ')[0]}
          <i class="bi bi-chevron-down" style="font-size:.7rem"></i>
        </button>
        <div class="user-menu d-none" id="user-menu">
          <a href="${getBase()}pages/orders.html" class="um-item"><i class="bi bi-bag"></i> My Orders</a>
          ${adminLink}
          <div class="um-divider"></div>
          <button class="um-item danger" onclick="logout()"><i class="bi bi-box-arrow-right"></i> Sign Out</button>
        </div>
      </div>`;
  } else {
    area.innerHTML = `<button class="btn-auth" onclick="openAuthModal()">Sign In</button>`;
  }

  // Mobile
  if (mArea) {
    mArea.innerHTML = currentUser
      ? `<a href="${getBase()}pages/orders.html" class="um-item" style="color:var(--text)"><i class="bi bi-bag"></i> My Orders</a>
         <button class="um-item danger" onclick="logout()"><i class="bi bi-box-arrow-right"></i> Sign Out</button>`
      : `<button class="btn-auth w-100 mt-2" onclick="openAuthModal()">Sign In</button>`;
  }

  updateCartBadge();
}

function getBase() {
  const p = window.location.pathname;
  return p.includes('/pages/') ? '../' : '';
}

function toggleUserMenu() {
  document.getElementById('user-menu')?.classList.toggle('d-none');
}
document.addEventListener('click', e => {
  const dd = document.getElementById('user-dropdown');
  if (dd && !dd.contains(e.target)) document.getElementById('user-menu')?.classList.add('d-none');
});

function openAuthModal() { authModal?.show(); }

function switchAuthTab(tab) {
  document.getElementById('form-login').classList.toggle('d-none', tab !== 'login');
  document.getElementById('form-register').classList.toggle('d-none', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

async function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.classList.add('d-none');
  try {
    const data = await API.post('/auth/login', { email, password });
    localStorage.setItem('qb_token', data.token);
    localStorage.setItem('qb_user', JSON.stringify(data.user));
    currentUser = data.user;
    authModal?.hide();
    renderNav();
    showToast('Welcome back, ' + data.user.name + '! 👋', 'success');
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

async function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('reg-error');
  errEl.classList.add('d-none');
  try {
    const data = await API.post('/auth/register', { name, email, phone, password });
    localStorage.setItem('qb_token', data.token);
    localStorage.setItem('qb_user', JSON.stringify(data.user));
    currentUser = data.user;
    authModal?.hide();
    renderNav();
    showToast('Account created! Welcome to QuickBite 🎉', 'success');
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

function logout() {
  localStorage.removeItem('qb_token');
  localStorage.removeItem('qb_user');
  localStorage.removeItem('qb_cart');
  currentUser = null;
  window.location.href = getBase() + 'index.html';
}

function toggleMobileNav() {
  document.getElementById('qb-mobile-nav')?.classList.toggle('d-none');
}

/* ── TOAST ── */
function showToast(msg, type = 'info', duration = 3000) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `qb-toast ${type}`;
  t.innerHTML = `<span>${icons[type] || '🔔'}</span><span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; setTimeout(() => t.remove(), 300); }, duration);
}
