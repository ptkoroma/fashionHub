// Global variables
let products = [];
let cart = [];
let filteredProducts = [];
let currentProduct = null;

// DOM Elements
const productsContainer = document.getElementById('products-container');
const cartModal = document.getElementById('cart-modal');
const productModal = document.getElementById('product-modal');
const shareModal = document.getElementById('share-modal');
const loading = document.getElementById('loading');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const toastContainer = document.getElementById('toast-container');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Cart button
    cartBtn.addEventListener('click', showCart);

    // Share cart button
    document.getElementById('share-cart-btn').addEventListener('click', shareCart);

    // Modal close buttons
    document.getElementById('close-cart').addEventListener('click', () => closeModal(cartModal));
    document.getElementById('close-product').addEventListener('click', () => closeModal(productModal));
    document.getElementById('close-share').addEventListener('click', () => closeModal(shareModal));

    // Clear cart button
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);

    // Checkout button
    document.getElementById('checkout-btn').addEventListener('click', checkout);

    // Add to cart button
    document.getElementById('add-to-cart-btn').addEventListener('click', addToCart);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterProducts(e.target.dataset.category));
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) closeModal(cartModal);
        if (e.target === productModal) closeModal(productModal);
        if (e.target === shareModal) closeModal(shareModal);
    });
}

// Load products from API
async function loadProducts() {
    showLoading(true);
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        filteredProducts = [...products];
        renderProducts();
    } catch (error) {
        showToast('Failed to load products', 'error');
        console.error('Error loading products:', error);
    } finally {
        showLoading(false);
    }
}

// Load cart from API
async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        cart = await response.json();
        updateCartUI();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Render products in the grid
function renderProducts() {
    productsContainer.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<p style="text-align: center; color: #666;">No products found.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-category">${product.category}</p>
        </div>
    `;
    
    card.addEventListener('click', () => showProductDetails(product));
    return card;
}

// Show product details modal
function showProductDetails(product) {
    currentProduct = product;
    
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-image').src = product.image;
    document.getElementById('product-image').alt = product.name;
    document.getElementById('product-price').textContent = product.price.toFixed(2);
    
    // Populate size options
    const sizeSelect = document.getElementById('size-select');
    sizeSelect.innerHTML = '';
    product.size.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });
    
    // Reset quantity
    document.getElementById('quantity-select').value = 1;
    
    showModal(productModal);
}

// Add product to cart
async function addToCart() {
    if (!currentProduct) return;
    
    const size = document.getElementById('size-select').value;
    const quantity = parseInt(document.getElementById('quantity-select').value);
    
    if (!size || quantity < 1) {
        showToast('Please select a size and valid quantity', 'error');
        return;
    }
    
    showLoading(true);
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: currentProduct.id,
                size: size,
                quantity: quantity
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            cart = result.cart;
            updateCartUI();
            closeModal(productModal);
            showToast(`${currentProduct.name} added to cart!`);
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to add item to cart', 'error');
        }
    } catch (error) {
        showToast('Failed to add item to cart', 'error');
        console.error('Error adding to cart:', error);
    } finally {
        showLoading(false);
    }
}

// Show cart modal
function showCart() {
    renderCartItems();
    showModal(cartModal);
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
            </div>
        `;
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItem = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartTotal();
}

// Create cart item element
function createCartItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-details">Size: ${item.size}</div>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
            <div class="quantity-control">
                <button class="quantity-btn" onclick="updateQuantity(${item.productId}, '${item.size}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.productId}, '${item.size}', ${item.quantity + 1})">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${item.productId}, '${item.size}')">Remove</button>
        </div>
    `;
    return itemDiv;
}

// Update item quantity
async function updateQuantity(productId, size, newQuantity) {
    showLoading(true);
    try {
        const response = await fetch('/api/cart/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                size: size,
                quantity: newQuantity
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            cart = result.cart;
            updateCartUI();
            renderCartItems();
        } else {
            showToast('Failed to update quantity', 'error');
        }
    } catch (error) {
        showToast('Failed to update quantity', 'error');
        console.error('Error updating quantity:', error);
    } finally {
        showLoading(false);
    }
}

// Remove item from cart
async function removeFromCart(productId, size) {
    showLoading(true);
    try {
        const response = await fetch(`/api/cart/remove/${productId}/${size}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            cart = result.cart;
            updateCartUI();
            renderCartItems();
            showToast('Item removed from cart');
        } else {
            showToast('Failed to remove item', 'error');
        }
    } catch (error) {
        showToast('Failed to remove item', 'error');
        console.error('Error removing from cart:', error);
    } finally {
        showLoading(false);
    }
}

// Clear entire cart
async function clearCart() {
    if (cart.length === 0) return;
    
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    showLoading(true);
    try {
        // Remove each item individually
        for (const item of cart) {
            await fetch(`/api/cart/remove/${item.productId}/${item.size}`, {
                method: 'DELETE'
            });
        }
        
        cart = [];
        updateCartUI();
        renderCartItems();
        showToast('Cart cleared');
    } catch (error) {
        showToast('Failed to clear cart', 'error');
        console.error('Error clearing cart:', error);
    } finally {
        showLoading(false);
    }
}

// Update cart UI elements
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Filter products by category
function filterProducts(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Filter products
    if (category === 'all') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }
    
    renderProducts();
}

// Share cart
async function shareCart() {
    if (cart.length === 0) {
        showToast('Your cart is empty. Add some items first!', 'warning');
        return;
    }
    
    showLoading(true);
    try {
        const response = await fetch('/api/cart/share', {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.json();
            showShareModal(result.shareUrl);
        } else {
            showToast('Failed to create share link', 'error');
        }
    } catch (error) {
        showToast('Failed to create share link', 'error');
        console.error('Error sharing cart:', error);
    } finally {
        showLoading(false);
    }
}

// Show share modal with link
function showShareModal(shareUrl) {
    const shareContent = document.getElementById('share-content');
    shareContent.innerHTML = `
        <p>Share this link with your friends:</p>
        <div class="share-link">
            <input type="text" value="${shareUrl}" readonly id="share-url-input" style="width: 100%; padding: 0.5rem; border: none; background: transparent;">
        </div>
        <button class="copy-link-btn" onclick="copyShareLink()">Copy Link</button>
        <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">This link will expire in 7 days.</p>
    `;
    showModal(shareModal);
}

// Copy share link to clipboard
function copyShareLink() {
    const input = document.getElementById('share-url-input');
    input.select();
    document.execCommand('copy');
    showToast('Link copied to clipboard!');
}

// Checkout (placeholder)
function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showToast(`Checkout functionality not implemented. Total: $${total.toFixed(2)}`, 'warning');
}

// Modal functions
function showModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Loading functions
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Make functions globally available for onclick handlers
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.copyShareLink = copyShareLink;