require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const EMOJI_IMAGES = {
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  pizza:  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
  sushi:  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80',
  indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
  chinese:'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80',
  tacos:  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80',
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');
  await Promise.all([User.deleteMany(), Restaurant.deleteMany(), MenuItem.deleteMany()]);

  // Admin user
  await User.create({ name: 'Admin', email: 'admin@quickbite.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
  console.log('✅ Users created (admin@quickbite.com / admin123)');

  // Restaurants
  const restaurants = await Restaurant.insertMany([
    { name: "Burger House", cuisine: "American", description: "Juicy handcrafted burgers with fresh ingredients", image: EMOJI_IMAGES.burger, rating: 4.7, deliveryTime: "20-30 min", deliveryFee: 1.99, minOrder: 8, tags: ["Burgers","Fast Food","American"] },
    { name: "Pizza Palace", cuisine: "Italian", description: "Wood-fired authentic Neapolitan pizzas", image: EMOJI_IMAGES.pizza, rating: 4.5, deliveryTime: "25-35 min", deliveryFee: 2.49, minOrder: 12, tags: ["Pizza","Italian","Pasta"] },
    { name: "Sakura Sushi", cuisine: "Japanese", description: "Fresh sushi rolls & Japanese specialties", image: EMOJI_IMAGES.sushi, rating: 4.8, deliveryTime: "30-40 min", deliveryFee: 3.99, minOrder: 15, tags: ["Sushi","Japanese","Healthy"] },
    { name: "Spice Garden", cuisine: "Indian", description: "Authentic Indian curries & tandoor delights", image: EMOJI_IMAGES.indian, rating: 4.6, deliveryTime: "35-45 min", deliveryFee: 1.99, minOrder: 10, tags: ["Indian","Curry","Spicy"] },
    { name: "Dragon Wok", cuisine: "Chinese", description: "Traditional Chinese stir-fry & dim sum", image: EMOJI_IMAGES.chinese, rating: 4.3, deliveryTime: "25-35 min", deliveryFee: 2.99, minOrder: 10, tags: ["Chinese","Noodles","Dim Sum"] },
    { name: "Taco Fiesta", cuisine: "Mexican", description: "Street-style tacos & burritos with bold flavors", image: EMOJI_IMAGES.tacos, rating: 4.4, deliveryTime: "20-30 min", deliveryFee: 1.49, minOrder: 8, tags: ["Mexican","Tacos","Burritos"] },
  ]);
  console.log('✅ Restaurants created');

  // Menu items
  const [burger, pizza, sushi, indian, chinese, tacos] = restaurants;

  await MenuItem.insertMany([
    // Burger House
    { restaurant: burger._id, name: "Classic Cheeseburger", description: "Beef patty, cheddar, lettuce, tomato", price: 9.99, category: "Burgers", isVeg: false, isBestseller: true },
    { restaurant: burger._id, name: "BBQ Bacon Burger", description: "Smoky BBQ sauce, crispy bacon, caramelized onions", price: 12.99, category: "Burgers", isVeg: false },
    { restaurant: burger._id, name: "Veggie Delight Burger", description: "Plant-based patty, avocado, sprouts", price: 10.99, category: "Burgers", isVeg: true },
    { restaurant: burger._id, name: "Loaded Fries", description: "Crispy fries with cheese sauce & jalapeños", price: 5.99, category: "Sides", isVeg: true, isBestseller: true },
    { restaurant: burger._id, name: "Onion Rings", description: "Golden battered onion rings", price: 4.99, category: "Sides", isVeg: true },
    { restaurant: burger._id, name: "Chocolate Shake", description: "Rich creamy chocolate milkshake", price: 4.49, category: "Drinks", isVeg: true },

    // Pizza Palace
    { restaurant: pizza._id, name: "Margherita", description: "Tomato sauce, fresh mozzarella, basil", price: 11.99, category: "Pizzas", isVeg: true, isBestseller: true },
    { restaurant: pizza._id, name: "Pepperoni Feast", description: "Double pepperoni, mozzarella, oregano", price: 14.99, category: "Pizzas", isVeg: false, isBestseller: true },
    { restaurant: pizza._id, name: "BBQ Chicken", description: "Grilled chicken, BBQ sauce, red onions", price: 15.99, category: "Pizzas", isVeg: false },
    { restaurant: pizza._id, name: "Garlic Bread", description: "Toasted baguette with herb butter", price: 4.49, category: "Sides", isVeg: true },
    { restaurant: pizza._id, name: "Caesar Salad", description: "Romaine, croutons, parmesan, Caesar dressing", price: 7.99, category: "Salads", isVeg: true },
    { restaurant: pizza._id, name: "Tiramisu", description: "Classic Italian coffee dessert", price: 5.99, category: "Desserts", isVeg: true },

    // Sakura Sushi
    { restaurant: sushi._id, name: "Salmon Nigiri (2pc)", description: "Fresh salmon over seasoned rice", price: 7.99, category: "Nigiri", isBestseller: true },
    { restaurant: sushi._id, name: "Spicy Tuna Roll", description: "Tuna, cucumber, spicy mayo", price: 10.99, category: "Rolls" },
    { restaurant: sushi._id, name: "Dragon Roll", description: "Shrimp tempura, avocado, eel sauce", price: 13.99, category: "Rolls", isBestseller: true },
    { restaurant: sushi._id, name: "Vegetable Roll", description: "Avocado, cucumber, carrot, sesame", price: 8.99, category: "Rolls", isVeg: true },
    { restaurant: sushi._id, name: "Miso Soup", description: "Traditional miso with tofu & seaweed", price: 2.99, category: "Soups", isVeg: true },
    { restaurant: sushi._id, name: "Edamame", description: "Steamed salted soybeans", price: 4.49, category: "Starters", isVeg: true },

    // Spice Garden
    { restaurant: indian._id, name: "Chicken Tikka Masala", description: "Creamy tomato curry with tender chicken", price: 13.99, category: "Curries", isBestseller: true },
    { restaurant: indian._id, name: "Palak Paneer", description: "Cottage cheese in spiced spinach gravy", price: 11.99, category: "Curries", isVeg: true, isBestseller: true },
    { restaurant: indian._id, name: "Lamb Biryani", description: "Fragrant basmati rice with slow-cooked lamb", price: 15.99, category: "Rice", },
    { restaurant: indian._id, name: "Garlic Naan", description: "Soft tandoor-baked flatbread with garlic", price: 2.99, category: "Bread", isVeg: true },
    { restaurant: indian._id, name: "Samosa (2pc)", description: "Crispy pastry with spiced potato filling", price: 4.99, category: "Starters", isVeg: true },
    { restaurant: indian._id, name: "Mango Lassi", description: "Chilled yogurt drink with fresh mango", price: 3.99, category: "Drinks", isVeg: true },

    // Dragon Wok
    { restaurant: chinese._id, name: "Kung Pao Chicken", description: "Wok-fried chicken, peanuts, chili", price: 12.99, category: "Mains", isBestseller: true },
    { restaurant: chinese._id, name: "Fried Rice", description: "Egg fried rice with vegetables & soy", price: 9.99, category: "Rice", isVeg: false },
    { restaurant: chinese._id, name: "Vegetable Chow Mein", description: "Stir-fried noodles with crisp vegetables", price: 10.99, category: "Noodles", isVeg: true },
    { restaurant: chinese._id, name: "Dim Sum Basket (6pc)", description: "Steamed dumplings with soy dipping sauce", price: 8.99, category: "Dim Sum", isBestseller: true },
    { restaurant: chinese._id, name: "Spring Rolls (3pc)", description: "Crispy rolls with vegetable filling", price: 5.99, category: "Starters", isVeg: true },

    // Taco Fiesta
    { restaurant: tacos._id, name: "Carne Asada Tacos (3pc)", description: "Grilled beef, cilantro, onion, salsa verde", price: 10.99, category: "Tacos", isBestseller: true },
    { restaurant: tacos._id, name: "Chicken Burrito", description: "Flour tortilla, grilled chicken, rice, beans", price: 11.99, category: "Burritos", isBestseller: true },
    { restaurant: tacos._id, name: "Veggie Tacos (3pc)", description: "Roasted peppers, black beans, guacamole", price: 9.99, category: "Tacos", isVeg: true },
    { restaurant: tacos._id, name: "Nachos Grande", description: "Tortilla chips, cheese, jalapeños, sour cream", price: 8.99, category: "Sides", isVeg: true },
    { restaurant: tacos._id, name: "Guacamole & Chips", description: "Fresh house-made guacamole", price: 5.99, category: "Sides", isVeg: true },
    { restaurant: tacos._id, name: "Horchata", description: "Sweet cinnamon rice milk drink", price: 3.49, category: "Drinks", isVeg: true },
  ]);
  console.log('✅ Menu items created');
  console.log('\n🎉 Seed complete! Login: admin@quickbite.com / admin123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
