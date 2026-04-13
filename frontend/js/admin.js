/* admin.js */
let allRestaurantsList = [];
let deleteCallback = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('Admin access only. Please log in as admin.');
    window.location.href = '../index.html';
    return;
  }
  document.getElementById('at-user').textContent = `👤 ${currentUser.name}`;
  loadDashboard();
});

/* ── TAB NAV ── */
function showAdminTab(tab, btn) {
  document.querySelectorAll('.atab').forEach(el => el.classList.add('d-none'));
  document.querySelectorAll('.asn-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`atab-${tab}`).classList.remove('d-none');
  btn.classList.add('active');
  document.getElementById('at-title').textContent = btn.textContent.trim();
  const loaders = { dashboard: loadDashboard, restaurants: loadAdminRestaurants, menu: loadAdminMenu, orders: loadAdminOrders, users: loadAdminUsers };
  loaders[tab]?.();
  // Close sidebar on mobile
  document.getElementById('admin-sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('admin-sidebar').classList.toggle('open');
}

/* ── DASHBOARD ── */
async function loadDashboard() {
  try {
    const stats = await API.get('/admin/stats');
    document.getElementById('sc-users').textContent = stats.users;
    document.getElementById('sc-restaurants').textContent = stats.restaurants;
    document.getElementById('sc-orders').textContent = stats.orders;
    document.getElementById('sc-revenue').textContent = `$${stats.revenue.toFixed(2)}`;

    const tbl = document.getElementById('recent-orders-table');
    if (!stats.recentOrders?.length) { tbl.innerHTML = '<p class="p-4 text-muted">No orders yet.</p>'; return; }
    tbl.innerHTML = `<table class="admin-table">
      <thead><tr><th>Order ID</th><th>Customer</th><th>Restaurant</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${stats.recentOrders.map(o => `
        <tr>
          <td><code>#${o._id.slice(-6).toUpperCase()}</code></td>
          <td>${o.user?.name || '—'}</td>
          <td>${o.restaurantName || '—'}</td>
          <td><strong>$${o.total?.toFixed(2)}</strong></td>
          <td><span class="order-status-badge status-${o.status}">${o.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
  } catch(err) { showToast('Failed to load stats', 'error'); }
}

/* ── RESTAURANTS ── */
async function loadAdminRestaurants() {
  const el = document.getElementById('restaurants-table');
  el.innerHTML = '<div class="text-center p-4"><div class="qb-spinner"></div></div>';
  try {
    allRestaurantsList = await API.get('/admin/restaurants');
    el.innerHTML = `<table class="admin-table">
      <thead><tr><th>Name</th><th>Cuisine</th><th>Rating</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${allRestaurantsList.map(r => `
        <tr>
          <td><strong>${r.name}</strong></td>
          <td>${r.cuisine}</td>
          <td>★ ${r.rating?.toFixed(1)}</td>
          <td>$${r.deliveryFee?.toFixed(2)}</td>
          <td>${r.isOpen ? '<span style="color:var(--success);font-weight:700">Open</span>' : '<span style="color:var(--danger)">Closed</span>'}</td>
          <td><div class="tbl-actions">
            <button class="tbl-btn tbl-edit" onclick="openRestaurantModal('${r._id}')">Edit</button>
            <button class="tbl-btn tbl-del" onclick="confirmDelete('restaurant','${r._id}','${r.name}')">Delete</button>
          </div></td>
        </tr>`).join('')}</tbody></table>`;
  } catch { el.innerHTML = '<p class="p-4 text-danger">Failed to load.</p>'; }
}

function openRestaurantModal(id) {
  const r = id ? allRestaurantsList.find(x => x._id === id) : null;
  document.getElementById('rm-title').textContent = r ? 'Edit Restaurant' : 'Add Restaurant';
  document.getElementById('rm-id').value       = r?._id || '';
  document.getElementById('rm-name').value     = r?.name || '';
  document.getElementById('rm-cuisine').value  = r?.cuisine || '';
  document.getElementById('rm-desc').value     = r?.description || '';
  document.getElementById('rm-image').value    = r?.image || '';
  document.getElementById('rm-time').value     = r?.deliveryTime || '30-45 min';
  document.getElementById('rm-fee').value      = r?.deliveryFee || '';
  document.getElementById('rm-min').value      = r?.minOrder || '';
  document.getElementById('rm-rating').value   = r?.rating || '';
  document.getElementById('rm-address').value  = r?.address || '';
  document.getElementById('rm-error').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('restaurantModal')).show();
}

async function saveRestaurant() {
  const id = document.getElementById('rm-id').value;
  const body = {
    name:         document.getElementById('rm-name').value.trim(),
    cuisine:      document.getElementById('rm-cuisine').value.trim(),
    description:  document.getElementById('rm-desc').value.trim(),
    image:        document.getElementById('rm-image').value.trim(),
    deliveryTime: document.getElementById('rm-time').value.trim(),
    deliveryFee:  parseFloat(document.getElementById('rm-fee').value) || 0,
    minOrder:     parseFloat(document.getElementById('rm-min').value) || 0,
    rating:       parseFloat(document.getElementById('rm-rating').value) || 4.0,
    address:      document.getElementById('rm-address').value.trim(),
  };
  const errEl = document.getElementById('rm-error');
  errEl.classList.add('d-none');
  try {
    id ? await API.put(`/admin/restaurants/${id}`, body) : await API.post('/admin/restaurants', body);
    bootstrap.Modal.getInstance(document.getElementById('restaurantModal'))?.hide();
    showToast(`Restaurant ${id ? 'updated' : 'created'}!`, 'success');
    loadAdminRestaurants();
  } catch(err) { errEl.textContent = err.message; errEl.classList.remove('d-none'); }
}

/* ── MENU ITEMS ── */
let allMenuItems = [];
async function loadAdminMenu() {
  const el = document.getElementById('menu-table');
  el.innerHTML = '<div class="text-center p-4"><div class="qb-spinner"></div></div>';
  try {
    allMenuItems = await API.get('/admin/menu');
    if (!allRestaurantsList.length) allRestaurantsList = await API.get('/admin/restaurants');
    el.innerHTML = `<table class="admin-table">
      <thead><tr><th>Name</th><th>Restaurant</th><th>Category</th><th>Price</th><th>Veg</th><th>Actions</th></tr></thead>
      <tbody>${allMenuItems.map(m => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${m.restaurant?.name || '—'}</td>
          <td>${m.category}</td>
          <td>$${m.price?.toFixed(2)}</td>
          <td>${m.isVeg ? '🌿' : '🍖'}</td>
          <td><div class="tbl-actions">
            <button class="tbl-btn tbl-edit" onclick="openMenuModal('${m._id}')">Edit</button>
            <button class="tbl-btn tbl-del" onclick="confirmDelete('menu','${m._id}','${m.name}')">Delete</button>
          </div></td>
        </tr>`).join('')}</tbody></table>`;
  } catch { el.innerHTML = '<p class="p-4 text-danger">Failed to load.</p>'; }
}

async function openMenuModal(id) {
  if (!allRestaurantsList.length) allRestaurantsList = await API.get('/admin/restaurants');
  const m = id ? allMenuItems.find(x => x._id === id) : null;
  document.getElementById('mm-title').textContent = m ? 'Edit Menu Item' : 'Add Menu Item';
  document.getElementById('mm-id').value          = m?._id || '';
  document.getElementById('mm-name').value        = m?.name || '';
  document.getElementById('mm-category').value    = m?.category || '';
  document.getElementById('mm-desc').value        = m?.description || '';
  document.getElementById('mm-price').value       = m?.price || '';
  document.getElementById('mm-image').value       = m?.image || '';
  document.getElementById('mm-veg').checked       = m?.isVeg || false;
  document.getElementById('mm-bestseller').checked= m?.isBestseller || false;
  document.getElementById('mm-available').checked = m?.isAvailable !== false;

  const select = document.getElementById('mm-restaurant');
  select.innerHTML = allRestaurantsList.map(r =>
    `<option value="${r._id}" ${m?.restaurant?._id === r._id || m?.restaurant === r._id ? 'selected' : ''}>${r.name}</option>`
  ).join('');

  document.getElementById('mm-error').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('menuModal')).show();
}

async function saveMenuItem() {
  const id = document.getElementById('mm-id').value;
  const body = {
    restaurant:   document.getElementById('mm-restaurant').value,
    name:         document.getElementById('mm-name').value.trim(),
    category:     document.getElementById('mm-category').value.trim(),
    description:  document.getElementById('mm-desc').value.trim(),
    price:        parseFloat(document.getElementById('mm-price').value) || 0,
    image:        document.getElementById('mm-image').value.trim(),
    isVeg:        document.getElementById('mm-veg').checked,
    isBestseller: document.getElementById('mm-bestseller').checked,
    isAvailable:  document.getElementById('mm-available').checked,
  };
  const errEl = document.getElementById('mm-error');
  errEl.classList.add('d-none');
  try {
    id ? await API.put(`/admin/menu/${id}`, body) : await API.post('/admin/menu', body);
    bootstrap.Modal.getInstance(document.getElementById('menuModal'))?.hide();
    showToast(`Menu item ${id ? 'updated' : 'created'}!`, 'success');
    loadAdminMenu();
  } catch(err) { errEl.textContent = err.message; errEl.classList.remove('d-none'); }
}

/* ── ORDERS ── */
const STATUS_OPTS = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
async function loadAdminOrders() {
  const el = document.getElementById('orders-table');
  el.innerHTML = '<div class="text-center p-4"><div class="qb-spinner"></div></div>';
  try {
    const orders = await API.get('/admin/orders');
    if (!orders.length) { el.innerHTML = '<p class="p-4 text-muted">No orders yet.</p>'; return; }
    el.innerHTML = `<table class="admin-table">
      <thead><tr><th>ID</th><th>Customer</th><th>Restaurant</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${orders.map(o => `
        <tr>
          <td><code>#${o._id.slice(-6).toUpperCase()}</code></td>
          <td>${o.user?.name || '—'}<br><small style="color:var(--text-soft)">${o.user?.email || ''}</small></td>
          <td>${o.restaurantName || '—'}</td>
          <td>${o.items?.length} item(s)</td>
          <td><strong>$${o.total?.toFixed(2)}</strong></td>
          <td>
            <select class="status-select" onchange="updateOrderStatus('${o._id}',this.value)">
              ${STATUS_OPTS.map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s.replace('_',' ')}</option>`).join('')}
            </select>
          </td>
        </tr>`).join('')}</tbody></table>`;
  } catch { el.innerHTML = '<p class="p-4 text-danger">Failed to load.</p>'; }
}

async function updateOrderStatus(id, status) {
  try {
    await API.patch(`/admin/orders/${id}/status`, { status });
    showToast('Order status updated', 'success');
  } catch { showToast('Failed to update status', 'error'); }
}

/* ── USERS ── */
async function loadAdminUsers() {
  const el = document.getElementById('users-table');
  el.innerHTML = '<div class="text-center p-4"><div class="qb-spinner"></div></div>';
  try {
    const users = await API.get('/admin/users');
    el.innerHTML = `<table class="admin-table">
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
      <tbody>${users.map(u => `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>${u.email}</td>
          <td>${u.phone || '—'}</td>
          <td><span style="padding:3px 10px;border-radius:50px;font-size:.72rem;font-weight:800;background:${u.role==='admin'?'#fff3ed':'#f0f0f5'};color:${u.role==='admin'?'var(--primary)':'var(--text-soft)'}">${u.role}</span></td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
        </tr>`).join('')}</tbody></table>`;
  } catch { el.innerHTML = '<p class="p-4 text-danger">Failed to load.</p>'; }
}

/* ── DELETE CONFIRM ── */
function confirmDelete(type, id, name) {
  document.getElementById('delete-msg').textContent = `Delete "${name}"? This cannot be undone.`;
  const btn = document.getElementById('confirm-delete-btn');
  btn.onclick = async () => {
    try {
      type === 'restaurant' ? await API.delete(`/admin/restaurants/${id}`) : await API.delete(`/admin/menu/${id}`);
      bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
      showToast('Deleted successfully', 'success');
      type === 'restaurant' ? loadAdminRestaurants() : loadAdminMenu();
    } catch { showToast('Delete failed', 'error'); }
  };
  new bootstrap.Modal(document.getElementById('deleteModal')).show();
}
