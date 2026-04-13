/* restaurant.js */
let restaurantData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = '../index.html'; return; }
  await loadRestaurant(id);
  await loadMenu(id);
  renderCartSidebar();
});

async function loadRestaurant(id) {
  try {
    restaurantData = await API.get(`/restaurants/${id}`);
    document.title = `${restaurantData.name} — QuickBite`;
    const heroEl = document.getElementById('r-hero');
    if (restaurantData.image) {
      heroEl.style.backgroundImage = `url(${restaurantData.image})`;
      heroEl.style.backgroundSize = 'cover';
      heroEl.style.backgroundPosition = 'center';
    }
    document.getElementById('rh-info').innerHTML = `
      <div class="rhi-name">${restaurantData.name}</div>
      <div class="rhi-meta">
        <span>🍽️ ${restaurantData.cuisine}</span>
        <span>★ ${restaurantData.rating.toFixed(1)}</span>
        <span>🕐 ${restaurantData.deliveryTime}</span>
        <span>🛵 Delivery: $${restaurantData.deliveryFee.toFixed(2)}</span>
        <span>🛒 Min: $${restaurantData.minOrder}</span>
      </div>`;
    document.getElementById('cs-restaurant-name').textContent = restaurantData.name;
  } catch { location.href = '../index.html'; }
}

async function loadMenu(id) {
  const sectionsEl = document.getElementById('menu-sections');
  const catNavEl   = document.getElementById('cat-nav');
  try {
    const { grouped } = await API.get(`/menu/${id}`);
    const categories = Object.keys(grouped);
    if (!categories.length) { sectionsEl.innerHTML = '<p class="text-muted">No menu items available.</p>'; return; }

    catNavEl.innerHTML = categories.map(c =>
      `<button class="mcn-btn" onclick="scrollToSection('${c}',this)">${c}</button>`
    ).join('');
    catNavEl.querySelector('.mcn-btn')?.classList.add('active');

    sectionsEl.innerHTML = categories.map(cat => `
      <div class="menu-section" id="section-${cat.replace(/\s+/g,'-')}">
        <div class="ms-title">${cat}</div>
        ${grouped[cat].map(item => renderMenuItem(item)).join('')}
      </div>`).join('');
  } catch(err) {
    sectionsEl.innerHTML = `<p style="color:var(--danger)">Failed to load menu.</p>`;
  }
}

function renderMenuItem(item) {
  const inCart  = cart?.items?.find(i => i.menuItemId === item._id);
  const qtyHtml = inCart
    ? `<div class="mic-qty">
         <button class="mic-qty-btn" onclick="updateQty('${item._id}',-1)">−</button>
         <span class="mic-qty-num">${inCart.quantity}</span>
         <button class="mic-qty-btn" onclick="updateQty('${item._id}',1)">+</button>
       </div>`
    : `<button class="mic-add-btn" onclick="addItem('${item._id}','${escHtml(item.name)}',${item.price})">+</button>`;

  return `
    <div class="menu-item-card" id="mic-${item._id}">
      <div class="mic-img">${item.image ? `<img src="${item.image}" alt="${escHtml(item.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="this.parentElement.textContent='🍽️'">` : '🍽️'}</div>
      <div class="mic-body">
        <div class="mic-badges">
          <span class="mic-badge ${item.isVeg ? 'veg' : 'nonveg'}">${item.isVeg ? '🌿 Veg' : '🍖 Non-veg'}</span>
          ${item.isBestseller ? '<span class="mic-badge best">⭐ Bestseller</span>' : ''}
        </div>
        <div class="mic-name">${escHtml(item.name)}</div>
        <div class="mic-desc">${escHtml(item.description)}</div>
        <div class="mic-footer">
          <span class="mic-price">$${item.price.toFixed(2)}</span>
          ${qtyHtml}
        </div>
      </div>
    </div>`;
}

function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function addItem(id, name, price) {
  if (!restaurantData) return;
  addToCart(restaurantData._id, restaurantData.name, restaurantData.deliveryFee, { menuItemId: id, name, price });
  refreshMenuItem(id);
  renderCartSidebar();
}

function updateQty(id, delta) {
  changeQty(id, delta);
  refreshMenuItem(id);
  renderCartSidebar();
}

function refreshMenuItem(id) {
  const item = document.getElementById('mic-' + id);
  if (!item) return;
  const menuItem = document.querySelector(`[onclick*="${id}"]`);
  // Re-render just the qty/add button part
  const inCart = cart?.items?.find(i => i.menuItemId === id);
  const footer = item.querySelector('.mic-footer');
  const price  = footer.querySelector('.mic-price').textContent;
  const qtyHtml = inCart
    ? `<div class="mic-qty"><button class="mic-qty-btn" onclick="updateQty('${id}',-1)">−</button><span class="mic-qty-num">${inCart.quantity}</span><button class="mic-qty-btn" onclick="updateQty('${id}',1)">+</button></div>`
    : `<button class="mic-add-btn" onclick="addItem('${id}','${footer.previousElementSibling?.previousElementSibling?.previousElementSibling?.textContent||'Item'}',${parseFloat(price.replace('$',''))})">+</button>`;
  footer.innerHTML = `<span class="mic-price">${price}</span>${qtyHtml}`;
}

function renderCartSidebar() {
  const emptyEl  = document.getElementById('cs-empty');
  const itemsEl  = document.getElementById('cs-items');
  const totalEl  = document.getElementById('cs-total');
  if (!emptyEl) return;

  if (!cart?.items?.length) {
    emptyEl.style.display = '';
    itemsEl.style.display = 'none';
    totalEl.style.display = 'none';
    return;
  }
  emptyEl.style.display = 'none';
  itemsEl.style.display = '';
  totalEl.style.display = '';

  itemsEl.innerHTML = cart.items.map(i => `
    <div class="cs-item">
      <span class="csi-name">${escHtml(i.name)}</span>
      <div class="csi-qty">
        <button class="csi-qty-btn" onclick="updateQty('${i.menuItemId}',-1); renderCartSidebar()">−</button>
        <span>${i.quantity}</span>
        <button class="csi-qty-btn" onclick="updateQty('${i.menuItemId}',1); renderCartSidebar()">+</button>
      </div>
      <span class="csi-price">$${(i.price * i.quantity).toFixed(2)}</span>
    </div>`).join('');

  const { subtotal, deliveryFee, total } = cartTotal();
  document.getElementById('cst-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cst-delivery').textContent = `$${deliveryFee.toFixed(2)}`;
  document.getElementById('cst-total').textContent    = `$${total.toFixed(2)}`;
}

function scrollToSection(cat, btn) {
  document.querySelectorAll('.mcn-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById(`section-${cat.replace(/\s+/g,'-')}`);
  el?.scrollIntoView({ behavior:'smooth', block:'start' });
}
