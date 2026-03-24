// Global variables
let sharedCart = [];
let shareId = null;

// DOM Elements
const sharedCartItems = document.getElementById('shared-cart-items');
const sharedCartTotal = document.getElementById('shared-cart-total');
const loading = document.getElementById('loading');
const toastContainer = document.getElementById('toast-container');

// Initialize the shared cart page
document.addEventListener('DOMContentLoaded', () => {
    shareId = getShareIdFromUrl();
    if (shareId) {
        loadSharedCart();
        setupEventListeners();
    } else {
        showError('Invalid share link');
    }
});

// Get share ID from URL
function getShareIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
}

// Setup event listeners
function setupEventListeners() {
    const copyBtn = document.getElementById('copy-to-my-cart-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToMyCart);
    }
}

// Load shared cart from API
async function loadSharedCart() {
    showLoading(true);
    try {
        const response = await fetch(`/api/shared-cart/${shareId}`);
        
        if (response.ok) {
            sharedCart = await response.json();
            renderSharedCart();
        } else if (response.status === 404) {
            showError('This shared cart has expired or does not exist.');
        } else {
            showError('Failed to load shared cart.');
        }
    } catch (error) {
        console.error('Error loading shared cart:', error);
        showError('Failed to load shared cart.');
    } finally {
        showLoading(false);
    }
}

// Render shared cart items
function renderSharedCart() {
    if (sharedCart.length === 0) {
        sharedCartItems.innerHTML = `
            <div class="empty-cart">
                <h3>This cart is empty</h3>
                <p>No items were shared in this cart.</p>
            </div>
        `;
        sharedCartTotal.textContent = '0.00';
        return;
    }

    sharedCartItems.innerHTML = '';
    sharedCart.forEach(item => {
        const cartItem = createSharedCartItemElement(item);
        sharedCartItems.appendChild(cartItem);
    });

    updateSharedCartTotal();
}

// Create shared cart item element
function createSharedCartItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-details">Size: ${item.size} | Quantity: ${item.quantity}</div>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `;
    return itemDiv;
}

// Update shared cart total
function updateSharedCartTotal() {
    const total = sharedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    sharedCartTotal.textContent = total.toFixed(2);
}

// Copy shared cart items to user's cart
async function copyToMyCart() {
    if (sharedCart.length === 0) {
        showToast('This cart is empty', 'warning');
        return;
    }

    showLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
        // Add each item to the user's cart
        for (const item of sharedCart) {
            try {
                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId: item.productId,
                        size: item.size,
                        quantity: item.quantity
                    })
                });

                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
                console.error('Error adding item to cart:', error);
            }
        }

        // Show result message
        if (successCount > 0 && errorCount === 0) {
            showToast(`Successfully added ${successCount} item(s) to your cart!`);
        } else if (successCount > 0 && errorCount > 0) {
            showToast(`Added ${successCount} item(s) to your cart. ${errorCount} item(s) failed.`, 'warning');
        } else {
            showToast('Failed to add items to your cart', 'error');
        }

        // Redirect to main store after a delay
        if (successCount > 0) {
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }

    } catch (error) {
        showToast('Failed to copy items to your cart', 'error');
        console.error('Error copying to cart:', error);
    } finally {
        showLoading(false);
    }
}

// Show error message
function showError(message) {
    sharedCartItems.innerHTML = `
        <div class="empty-cart">
            <h3>Error</h3>
            <p>${message}</p>
            <a href="/" class="continue-shopping-btn" style="margin-top: 1rem;">Go to Store</a>
        </div>
    `;
    
    // Hide the copy button if there's an error
    const copyBtn = document.getElementById('copy-to-my-cart-btn');
    if (copyBtn) {
        copyBtn.style.display = 'none';
    }
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