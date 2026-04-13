/* checkout.js */
let selectedPayment = 'Cash on Delivery';

document.addEventListener('DOMContentLoaded', () => {
  renderCheckout();
});

function selectPayment(el, method) {
  selectedPayment = method;
  document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function renderCheckout() {
  const emptyEl   = document.getElementById('cart-empty');
  const contentEl = document.getElementById('cart-content');

  if (!cart?.items?.length) {
    emptyEl.classList.remove('d-none');
    contentEl.classList.add('d-none');
    return;
  }

  // Restaurant name
  document.getElementById('cc-restaurant-name').textContent = cart.restaurantName || 'Your Order';

  // Items list
  const listEl = document.getElementById('cart-items-list');
  listEl.innerHTML = cart.items.map(item => `
    <div class="cart-page-item">
      <div class="cpi-emoji">🍽️</div>
      <div class="cpi-body">
        <div class="cpi-name">${item.name}</div>
        <div class="cpi-price">$${item.price.toFixed(2)} each</div>
      </div>
      <div class="cpi-qty">
        <button class="cpi-qty-btn" onclick="changeCheckoutQty('${item.menuItemId}',-1)">−</button>
        <span class="cpi-qty-num">${item.quantity}</span>
        <button class="cpi-qty-btn" onclick="changeCheckoutQty('${item.menuItemId}',1)">+</button>
      </div>
      <span class="cpi-total">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>`).join('');

  // Summary items
  const osRows = document.getElementById('os-rows');
  osRows.innerHTML = cart.items.map(i => `
    <div class="os-row-item">
      <span>${i.name} × ${i.quantity}</span>
      <span>$${(i.price * i.quantity).toFixed(2)}</span>
    </div>`).join('');

  updateTotals();
}

function changeCheckoutQty(id, delta) {
  changeQty(id, delta);
  renderCheckout();
  if (!cart) { location.reload(); }
}

function updateTotals() {
  if (!cart) return;
  const { subtotal, deliveryFee, total } = cartTotal();
  document.getElementById('os-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('os-delivery').textContent = `$${deliveryFee.toFixed(2)}`;
  document.getElementById('os-total').textContent    = `$${total.toFixed(2)}`;
}

async function placeOrder() {
  if (!currentUser) { openAuthModal(); return; }
  if (!cart?.items?.length) { showToast('Your cart is empty!', 'error'); return; }

  const address = document.getElementById('delivery-address').value.trim();
  const notes   = document.getElementById('order-notes').value.trim();
  if (!address) { showToast('Please enter a delivery address', 'error'); return; }

  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="qb-spinner" style="width:20px;height:20px;border-width:2px"></span> Placing order...';

  const { subtotal, deliveryFee, total } = cartTotal();
  const payload = {
    restaurant:     cart.restaurantId,
    restaurantName: cart.restaurantName,
    items:          cart.items.map(i => ({ menuItem: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity })),
    subtotal, deliveryFee, total,
    address, notes,
    paymentMethod: selectedPayment,
  };

  try {
    const order = await API.post('/orders', payload);
    cart = null;
    localStorage.removeItem('qb_cart');
    updateCartBadge();
    document.getElementById('success-order-id').textContent = `Order ID: ${order._id.slice(-8).toUpperCase()}`;
    new bootstrap.Modal(document.getElementById('orderSuccessModal')).show();
  } catch(err) {
    showToast(err.message || 'Could not place order', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle"></i> Place Order';
  }
}
