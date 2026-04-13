# 🍔 QuickBite — Online Food Delivery System

A full-stack food delivery web app built with **HTML, CSS, JavaScript, Node.js, Express, and MongoDB**.

---

## 📁 Project Structure

```
quickbite/
├── frontend/
│   ├── index.html              ← Homepage (browse restaurants)
│   ├── css/
│   │   └── style.css           ← All styles
│   ├── js/
│   │   ├── api.js              ← Fetch helper
│   │   ├── auth.js             ← Login/Register/Logout
│   │   ├── cart.js             ← Cart logic
│   │   ├── app.js              ← Homepage JS
│   │   ├── restaurant.js       ← Restaurant & menu page
│   │   ├── checkout.js         ← Cart/Checkout page
│   │   ├── orders.js           ← Order history
│   │   └── admin.js            ← Admin panel
│   └── pages/
│       ├── restaurant.html     ← Restaurant detail + menu
│       ├── cart.html           ← Cart & checkout
│       ├── orders.html         ← My orders
│       └── admin.html          ← Admin panel
│
└── backend/
    ├── server.js               ← Express app entry point
    ├── seed.js                 ← Sample data seeder
    ├── package.json
    ├── .env                    ← Config (DB URI, JWT secret)
    ├── models/
    │   ├── User.js
    │   ├── Restaurant.js
    │   ├── MenuItem.js
    │   └── Order.js
    ├── routes/
    │   ├── auth.js
    │   ├── restaurants.js
    │   ├── menu.js
    │   ├── orders.js
    │   └── admin.js
    └── middleware/
        └── auth.js
```

---

## ✅ Setup Instructions

### Step 1 — Install Node.js
Download from: https://nodejs.org (choose LTS)
```bash
node -v   # Should show v18+
npm -v
```

### Step 2 — Install MongoDB
Download from: https://www.mongodb.com/try/download/community

- **Windows**: Installs as a service, starts automatically
- **Mac**: `brew install mongodb-community && brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

Verify: open a terminal and run `mongosh` — you should see a `>` prompt.

### Step 3 — Install Backend Dependencies
```bash
cd quickbite/backend
npm install
```

### Step 4 — Seed Sample Data
```bash
npm run seed
```
This creates:
- **Admin account**: admin@quickbite.com / admin123
- **User account**: john@example.com / password123
- 6 restaurants with full menus

### Step 5 — Start the Backend Server
```bash
npm start
# or for auto-reload during development:
npm run dev
```
You should see:
```
✅  MongoDB connected
🚀  QuickBite running → http://localhost:5000
```

### Step 6 — Open the Frontend
Open `quickbite/frontend/index.html` in your browser.

**Option A**: Double-click `index.html`

**Option B** (recommended — avoids CORS issues): Use VS Code Live Server extension, or:
```bash
cd quickbite/frontend
python -m http.server 8080
```
Then visit: http://localhost:8080

---

## 🔑 Default Login Credentials

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@quickbite.com     | admin123   |
| User  | john@example.com        | password123|

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/auth/register    | Create account     |
| POST   | /api/auth/login       | Sign in            |
| GET    | /api/auth/me          | Get current user   |

### Restaurants
| Method | Endpoint                  | Description        |
|--------|---------------------------|--------------------|
| GET    | /api/restaurants          | List all           |
| GET    | /api/restaurants/:id      | Get single         |

### Menu
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/menu/:restaurantId | Get menu items   |

### Orders
| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| POST   | /api/orders       | Place order        |
| GET    | /api/orders/my    | My orders          |

### Admin (requires admin token)
| Method | Endpoint                         | Description        |
|--------|----------------------------------|--------------------|
| GET    | /api/admin/stats                 | Dashboard stats    |
| GET/POST/PUT/DELETE | /api/admin/restaurants | Manage restaurants |
| GET/POST/PUT/DELETE | /api/admin/menu        | Manage menu items  |
| GET    | /api/admin/orders                | All orders         |
| PATCH  | /api/admin/orders/:id/status     | Update order status|
| GET    | /api/admin/users                 | All users          |

---

## 🚨 Troubleshooting

| Problem | Fix |
|---------|-----|
| "MongoDB error" | Start MongoDB service. Run `mongosh` to test connection |
| "Cannot load restaurants" | Make sure backend is running on port 5000 |
| Blank page / CORS error | Use Live Server or Python HTTP server instead of double-clicking |
| Admin panel says "access denied" | Log in as admin@quickbite.com first |
| No data showing | Run `npm run seed` in the backend folder |

---

## 🚀 Features

- ✅ Browse restaurants by cuisine or search
- ✅ View full menu with categories
- ✅ Add to cart (multi-item, qty control)
- ✅ User registration & login with JWT
- ✅ Place orders with delivery address
- ✅ Order history per user
- ✅ Admin dashboard with stats
- ✅ Admin CRUD for restaurants & menu items
- ✅ Admin order status management
- ✅ Responsive design (mobile-friendly)
