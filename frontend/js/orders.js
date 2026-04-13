/* orders.js */
document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) {
    document.getElementById('orders-loading').classList.add('d-none');
    document.getElementById('orders-require-auth').classList.remove('d-none');
    return;
  }
  loadOrders();
});

const STATUS_LABELS = {
  pending:'Pending', confirmed:'Confirmed', preparing:'Preparing',
  out_for_delivery:'Out for Delivery', delivered:'Delivered', cancelled:'Cancelled'
};

async function loadOrders() {
  const loadEl = document.getElementById('orders-loading');
  const emptyEl= document.getElementById('orders-empty');
  const listEl = document.getElementById('orders-list');
  try {
    const orders = await API.get('/orders/my');
    loadEl.classList.add('d-none');
    if (!orders.length) { emptyEl.classList.remove('d-none'); return; }
    listEl.innerHTML = orders.map(o => `
      <div class="order-history-card">
        <div class="ohc-head">
          <div>
            <div class="ohc-restaurant">${o.restaurantName || 'Restaurant'}</div>
            <div class="ohc-date">${new Date(o.createdAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
          </div>
          <span class="order-status-badge status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span>
        </div>
        <div class="ohc-items">
          ${o.items.map(i => `
            <div class="ohc-item">
              <span>${i.name} × ${i.quantity}</span>
              <span>$${(i.price * i.quantity).toFixed(2)}</span>
            </div>`).join('')}
        </div>
        <div class="ohc-total">
          <span>Total</span>
          <span>$${o.total.toFixed(2)}</span>
        </div>
        <div style="margin-top:12px;font-size:.8rem;color:var(--text-soft)">
          <i class="bi bi-geo-alt"></i> ${o.address}
          &nbsp;·&nbsp;
          <i class="bi bi-credit-card"></i> ${o.paymentMethod}
        </div>
      </div>`).join('');
  } catch(err) {
    loadEl.classList.add('d-none');
    document.getElementById('orders-list').innerHTML = `<p style="color:var(--danger)">⚠ Could not load orders.</p>`;
  }
}
