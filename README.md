# Clothing Store App

A modern e-commerce application built with Node.js and Express.js that allows customers to browse clothing items, add them to a shopping cart, and share their cart with friends.

## Features

### 🛍️ Shopping Experience
- Browse clothing items with product images and details
- Filter products by category (shirts, jeans, hoodies, shoes, dresses, jackets)
- View detailed product information including available sizes
- Add items to shopping cart with size and quantity selection
- Manage cart items (update quantities, remove items, clear cart)

### 🛒 Shopping Cart
- Persistent cart using session storage
- Real-time cart updates and total calculation
- Visual cart interface with product thumbnails
- Quantity controls and item removal

### 📤 Cart Sharing
- Generate shareable links for carts
- Share cart contents with friends and family
- Copy shared cart items to personal cart
- Automatic expiration of shared links (7 days)

### 🎨 User Interface
- Responsive design that works on all devices
- Modern, clean interface with smooth animations
- Modal dialogs for product details and cart management
- Toast notifications for user feedback
- Loading indicators for better user experience

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

#### Development mode (with auto-restart):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

The server will start on port 3000. Visit [http://localhost:3000](http://localhost:3000) to start shopping.

## 🚀 Deployment

Your app is production-ready! See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy Options:**
- **Render**: Connect GitHub repo at [render.com](https://render.com)
- **Railway**: `npm i -g @railway/cli && railway login && railway up`
- **Vercel**: `npm i -g vercel && vercel`

**Required Environment Variables:**
- `NODE_ENV=production`
- `SESSION_SECRET=your-random-secret-key`

## API Endpoints

### Products
- `GET /api/products` - Get all clothing items
- `GET /api/products/:id` - Get specific product details

### Shopping Cart
- `GET /api/cart` - Get current cart contents
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId/:size` - Remove item from cart

### Cart Sharing
- `POST /api/cart/share` - Create shareable cart link
- `GET /api/shared-cart/:shareId` - Get shared cart data
- `GET /shared-cart/:shareId` - View shared cart page

### System
- `GET /health` - Health check endpoint

## Project Structure

```
.
├── package.json              # Dependencies and scripts
├── index.js                  # Main server application
├── public/                   # Frontend assets
│   ├── index.html           # Main store page
│   ├── shared-cart.html     # Shared cart viewer
│   ├── styles.css           # Application styling
│   ├── script.js            # Main app functionality
│   └── shared-cart.js       # Shared cart functionality
├── .github/
│   └── copilot-instructions.md  # Copilot configuration
├── README.md                 # This file
└── .gitignore               # Git ignore rules
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Session Management**: express-session
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **UUID Generation**: uuid package
- **Development**: nodemon for auto-restart

## Sample Products

The application comes with sample clothing items including:
- Classic White T-Shirt
- Blue Denim Jeans
- Red Hoodie
- Black Sneakers
- Summer Dress
- Leather Jacket

Each product includes multiple size options and placeholder images.

## Cart Sharing Feature

Users can share their cart by:
1. Adding items to their cart
2. Clicking the "Share Cart" button
3. Copying the generated share link
4. Sending the link to friends

Recipients can:
- View the shared cart contents
- Copy all items to their own cart
- Continue shopping from there

Share links expire automatically after 7 days for security.