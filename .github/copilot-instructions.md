# Clothing Store App - Copilot Instructions

This workspace contains a modern e-commerce clothing store application built with Node.js, Express.js, and vanilla JavaScript.

## Project Structure

- **Backend**: Node.js server with Express.js framework
- **Frontend**: HTML5, CSS3, and vanilla JavaScript
- **Session Management**: express-session for cart persistence
- **Main entry point**: `index.js`
- **Static files**: Served from `public/` directory

## Key Features

### Shopping Experience
- Product catalog with filtering by category
- Shopping cart with persistent sessions
- Cart sharing functionality with expirable links
- Responsive design for all devices
- Modern UI with animations and toast notifications

### API Endpoints
- Product management (`/api/products`)
- Cart operations (`/api/cart/*`)
- Cart sharing (`/api/cart/share`, `/api/shared-cart/:id`)
- Health checks (`/health`)

## Development Commands

- `npm run dev` - Start development server with auto-restart
- `npm start` - Start production server
- `npm install` - Install dependencies

## Key Files

### Backend
- `index.js` - Main server with Express routes and middleware
- `package.json` - Dependencies including express-session and uuid

### Frontend
- `public/index.html` - Main store interface
- `public/shared-cart.html` - Shared cart viewer
- `public/styles.css` - Complete responsive styling
- `public/script.js` - Main app functionality (cart, products, modals)
- `public/shared-cart.js` - Shared cart specific functionality

### Configuration
- `.github/copilot-instructions.md` - This file
- `README.md` - Complete project documentation
- `.gitignore` - Node.js and IDE ignore patterns

## Development Workflow

1. Use `npm run dev` to start the development server with auto-restart
2. Server runs on port 3000
3. Visit http://localhost:3000 to access the clothing store
4. Code changes trigger automatic server restart
5. Frontend assets are served statically from the public directory

## Technical Architecture

- **Session Management**: Cart data persists in server sessions
- **Static File Serving**: Express serves frontend files from public/
- **Mock Data**: Clothing items are stored in-memory with placeholder images
- **Cart Sharing**: Uses UUID for secure, expirable share links
- **Responsive Design**: Mobile-first CSS with flexbox and grid layouts

## Cart Functionality

- Add/remove items with size and quantity selection
- Update quantities with + / - controls
- Clear entire cart
- Share cart via generated links (7-day expiration)
- Copy shared carts to personal cart
- Real-time total calculation

Project is ready for development and can be extended with features like user authentication, payment processing, or database integration.