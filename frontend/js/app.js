/* app.js — homepage logic */
let allRestaurants = [];
let searchTimer;

document.addEventListener('DOMContentLoaded', async () => {
  await loadRestaurants();
});

async function loadRestaurants(cuisine = 'all', search = '') {
  const grid = document.getElementById('restaurants-grid');
  const noRes = document.getElementById('no-results');
  if (!grid) return;

  grid.innerHTML = '<div class="col-12 text-center py-5"><div class="qb-spinner"></div></div>';

  try {
    let url = '/restaurants?';
    if (cuisine && cuisine !== 'all') url += `cuisine=${cuisine}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    const restaurants = await API.get(url);
    allRestaurants = restaurants;
    renderRestaurants(restaurants);
  } catch(err) {
    grid.innerHTML = `<div class="col-12 text-center py-5"><p style="color:var(--danger)">⚠ Could not load restaurants. Is the server running?<br><small>cd backend && npm install && node seed.js && node server.js</small></p></div>`;
  }
}

function renderRestaurants(list) {
  const grid  = document.getElementById('restaurants-grid');
  const noRes = document.getElementById('no-results');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = '';
    noRes?.classList.remove('d-none');
    return;
  }
  noRes?.classList.add('d-none');

  grid.innerHTML = list.map((r, i) => `
    <div class="col-sm-6 col-xl-4" style="animation:fadeInUp .4s ease ${i * 0.07}s both">
      <a href="pages/restaurant.html?id=${r._id}" class="restaurant-card">
        <div class="rc-img">
          ${r.image
            ? `<img src="${r.image}" alt="${r.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'rc-img-placeholder\\'>🍽️</div>'">`
            : `<div class="rc-img-placeholder">🍽️</div>`}
          <span class="rc-status ${r.isOpen ? 'open' : 'closed'}">${r.isOpen ? '● Open' : '● Closed'}</span>
        </div>
        <div class="rc-body">
          <div class="rc-name">${r.name}</div>
          <div class="rc-cuisine">${r.cuisine}</div>
          <div class="rc-meta">
            <span class="rc-rating">★ ${r.rating.toFixed(1)}</span>
            <span>🕐 ${r.deliveryTime}</span>
            <span>🛵 $${r.deliveryFee.toFixed(2)}</span>
          </div>
          ${r.tags?.length ? `<div class="rc-tags">${r.tags.slice(0,3).map(t => `<span class="rc-tag">${t}</span>`).join('')}</div>` : ''}
        </div>
      </a>
    </div>`).join('');
}

function filterCuisine(cuisine, btn) {
  document.querySelectorAll('.cp').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const search = document.getElementById('nav-search')?.value || '';
  loadRestaurants(cuisine, search);
}

function handleNavSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const active = document.querySelector('.cp.active')?.dataset.cuisine || 'all';
    loadRestaurants(active, val);
  }, 350);
}
