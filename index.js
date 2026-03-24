const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Mock clothing data
const clothingItems = [
  { id: 1, name: 'Classic White T-Shirt', price: 19.99, category: 'shirts', image: 'https://via.placeholder.com/300x300?text=White+T-Shirt', size: ['S', 'M', 'L', 'XL'] },
  { id: 2, name: 'Blue Denim Jeans', price: 59.99, category: 'jeans', image: 'https://via.placeholder.com/300x300?text=Blue+Jeans', size: ['28', '30', '32', '34', '36'] },
  { id: 3, name: 'Red Hoodie', price: 45.99, category: 'hoodies', image: 'https://via.placeholder.com/300x300?text=Red+Hoodie', size: ['S', 'M', 'L', 'XL'] },
  { id: 4, name: 'Black Sneakers', price: 89.99, category: 'shoes', image: 'https://via.placeholder.com/300x300?text=Black+Sneakers', size: ['7', '8', '9', '10', '11', '12'] },
  { id: 5, name: 'Summer Dress', price: 39.99, category: 'dresses', image: 'https://via.placeholder.com/300x300?text=Summer+Dress', size: ['XS', 'S', 'M', 'L'] },
  { id: 6, name: 'Leather Jacket', price: 129.99, category: 'jackets', image: 'https://via.placeholder.com/300x300?text=Leather+Jacket', size: ['S', 'M', 'L', 'XL'] },
];

// Store shared carts
const sharedCarts = new Map();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'clothingstore2024',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

// Initialize cart in session
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/products', (req, res) => {
  res.json(clothingItems);
});

app.get('/api/products/:id', (req, res) => {
  const product = clothingItems.find(item => item.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.get('/api/cart', (req, res) => {
  res.json(req.session.cart);
});

app.post('/api/cart/add', (req, res) => {
  const { productId, size, quantity = 1 } = req.body;
  const product = clothingItems.find(item => item.id === parseInt(productId));
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!product.size.includes(size)) {
    return res.status(400).json({ error: 'Invalid size' });
  }

  const existingItem = req.session.cart.find(item => 
    item.productId === parseInt(productId) && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    req.session.cart.push({
      productId: parseInt(productId),
      name: product.name,
      price: product.price,
      size: size,
      quantity: quantity,
      image: product.image
    });
  }

  res.json({ message: 'Item added to cart', cart: req.session.cart });
});

app.delete('/api/cart/remove/:productId/:size', (req, res) => {
  const productId = parseInt(req.params.productId);
  const size = req.params.size;
  
  req.session.cart = req.session.cart.filter(item => 
    !(item.productId === productId && item.size === size)
  );
  
  res.json({ message: 'Item removed from cart', cart: req.session.cart });
});

app.put('/api/cart/update', (req, res) => {
  const { productId, size, quantity } = req.body;
  
  const item = req.session.cart.find(item => 
    item.productId === parseInt(productId) && item.size === size
  );
  
  if (item) {
    if (quantity <= 0) {
      req.session.cart = req.session.cart.filter(cartItem => 
        !(cartItem.productId === parseInt(productId) && cartItem.size === size)
      );
    } else {
      item.quantity = quantity;
    }
  }
  
  res.json({ message: 'Cart updated', cart: req.session.cart });
});

app.post('/api/cart/share', (req, res) => {
  const shareId = uuidv4();
  const cartCopy = JSON.parse(JSON.stringify(req.session.cart));
  
  sharedCarts.set(shareId, {
    cart: cartCopy,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  res.json({ 
    shareId,
    shareUrl: `${req.protocol}://${req.get('host')}/shared-cart/${shareId}`
  });
});

app.get('/shared-cart/:shareId', (req, res) => {
  const sharedCart = sharedCarts.get(req.params.shareId);
  
  if (!sharedCart || sharedCart.expiresAt < new Date()) {
    return res.status(404).send('Shared cart not found or expired');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'shared-cart.html'));
});

app.get('/api/shared-cart/:shareId', (req, res) => {
  const sharedCart = sharedCarts.get(req.params.shareId);
  
  if (!sharedCart || sharedCart.expiresAt < new Date()) {
    return res.status(404).json({ error: 'Shared cart not found or expired' });
  }
  
  res.json(sharedCart.cart);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Clothing Store API is running',
    timestamp: new Date().toISOString()
  });
});

// Clean up expired shared carts every hour
setInterval(() => {
  const now = new Date();
  for (const [id, cart] of sharedCarts.entries()) {
    if (cart.expiresAt < now) {
      sharedCarts.delete(id);
    }
  }
}, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Clothing Store server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to shop for clothes`);
});