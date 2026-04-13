/* cart.js */
let cart = JSON.parse(localStorage.getItem('qb_cart') || 'null');
// cart = { restaurantId, restaurantName, deliveryFee, items:[{menuItemId,name,price,quantity}] }

function saveCart() { localStorage.setItem('qb_cart', JSON.stringify(cart)); updateCartBadge(); }
function clearCart() { cart = null; saveCart(); location.reload(); }

function addToCart(restaurantId, restaurantName, deliveryFee, item) {
  if (cart && cart.restaurantId !== restaurantId) {
    if (!confirm(`Your cart has items from "${cart.restaurantName}". Start a new cart from "${restaurantName}"?`)) return;
    cart = null;
  }
  if (!cart) cart = { restaurantId, restaurantName, deliveryFee, items: [] };
  const existing = cart.items.find(i => i.menuItemId === item.menuItemId);
  if (existing) existing.quantity++;
  else cart.items.push({ ...item, quantity: 1 });
  saveCart();
  showToast(`${item.name} added to cart 🛒`, 'success', 2000);
  renderCartSidebar?.();
}

function changeQty(menuItemId, delta) {
  if (!cart) return;
  const item = cart.items.find(i => i.menuItemId === menuItemId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart.items = cart.items.filter(i => i.menuItemId !== menuItemId);
  if (!cart.items.length) cart = null;
  saveCart();
  renderCartSidebar?.();
}

function cartTotal() {
  if (!cart) return { subtotal: 0, deliveryFee: 0, total: 0 };
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = cart.deliveryFee || 0;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

function updateCartBadge() {
  const count = cart ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0;
  document.querySelectorAll('#nav-cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('d-none', count === 0);
  });
}

function goToCheckout() {
  if (!cart?.items?.length) return;
  if (!currentUser) { openAuthModal(); return; }
  window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'cart.html';
}
