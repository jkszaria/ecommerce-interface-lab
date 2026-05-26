// ============================================================
// SCRIPT.JS - Lab 6 (DOM Scripting) + Lab 10 (JWT Auth)
// ============================================================

// we created a Product class so we can make product objects more easily.
class Product {
    constructor(id, name, price, image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
    }
}

const products = [
    new Product(1,  "Sony Headphones",     10.00,  "pics/product1.png"),
    new Product(2,  "Controller",          20.00,  "pics/product2.webp"),
    new Product(3,  "Nintendo Switch",     120.00, "pics/product3.webp"),
    new Product(4,  "Mechanical Keyboard", 45.00,  "pics/product4.webp"),
    new Product(5,  "Gaming Mouse",        35.00,  "pics/product5.png"),
    new Product(6,  "Monitor",             200.00, "pics/product6.avif"),
    new Product(7,  "USB Hub",             15.00,  "pics/product7.webp"),
    new Product(8,  "Webcam",              55.00,  "pics/product8.png"),
    new Product(9,  "Mousepad",            12.00,  "pics/product9.webp"),
    new Product(10, "Laptop Stand",        25.00,  "pics/product10.avif")
];

const SHIPPING_FEE = 5.00;

// ============================================================
// LAB 10 - JWT AUTHENTICATION FUNCTIONS
// Uses the Fetch API to communicate with the Spring Boot backend
// ============================================================

// Base URL of the backend API
const API_BASE_URL = 'http://localhost:8080';

/**
 * Logs in a user by sending credentials to the backend.
 * If successful, stores the JWT token in localStorage.
 *
 * @param {string} username - the username to log in with
 * @param {string} password - the password to log in with
 * @returns {string} the JWT token if login succeeds
 * @throws {Error} if login fails
 */
async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    // Store the token in localStorage so we can use it for future requests
    localStorage.setItem('jwt_token', data.token);
    return data.token;
}

/**
 * Registers a new user account on the backend.
 *
 * @param {string} username - the username to register
 * @param {string} password - the password to register with
 * @returns {object} the response data from the server
 * @throws {Error} if registration fails
 */
async function register(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role: 'ROLE_USER' })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
}

/**
 * Makes an authenticated request to a protected API endpoint.
 * Automatically includes the JWT token in the Authorization header.
 *
 * @param {string} endpoint - the API endpoint to call (e.g. '/api/v1/products')
 * @param {string} method - the HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {object} body - the request body for POST/PUT/PATCH requests
 * @returns {object} the response data from the server
 * @throws {Error} if the request fails or token is invalid
 */
async function fetchWithAuth(endpoint, method = 'GET', body = null) {
    // Get the token from localStorage
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        throw new Error('No token found. Please log in.');
    }

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // Include the JWT token in the Authorization header
            'Authorization': `Bearer ${token}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // If token is expired or invalid, redirect to login
    if (response.status === 401) {
        console.error('Unauthorized: Token expired or invalid');
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
        return;
    }

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    // Return empty for 204 No Content
    if (response.status === 204) return null;

    return await response.json();
}

/**
 * Logs out the current user by removing the JWT token from localStorage.
 */
function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'landing.html';
}

/**
 * Checks if the user is currently logged in.
 *
 * @returns {boolean} true if a token exists in localStorage
 */
function isLoggedIn() {
    return localStorage.getItem('jwt_token') !== null;
}

// ============================================================
// Handle login form submission (on login.html)
// ============================================================
const loginForm = document.querySelector('#login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.querySelector('#login-username').value;
        const password = document.querySelector('#login-password').value;
        const errorMsg = document.querySelector('#login-error');

        try {
            await login(username, password);
            // Redirect to landing page after successful login
            window.location.href = 'landing.html';
        } catch (error) {
            errorMsg.textContent = error.message;
        }
    });
}

// ============================================================
// Handle register form submission (on signup.html)
// ============================================================
const registerForm = document.querySelector('#register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.querySelector('#register-username').value;
        const password = document.querySelector('#register-password').value;
        const errorMsg = document.querySelector('#register-error');

        try {
            await register(username, password);
            // Redirect to login page after successful registration
            window.location.href = 'login.html';
        } catch (error) {
            errorMsg.textContent = error.message;
        }
    });
}

// Show logout button if logged in
const logoutBtn = document.querySelector('#logout-btn');
if (logoutBtn) {
    if (isLoggedIn()) {
        logoutBtn.style.display = 'block';
        logoutBtn.addEventListener('click', logout);
    }
}

// ============================================================
// ORIGINAL LAB 6 CODE BELOW - unchanged
// ============================================================

function loadCart() {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
}

function saveCart(cart) {
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

let cartItems = loadCart();

const productContainer = document.querySelector('.product-grid');

if (productContainer) {
    productContainer.textContent = '';

    products.forEach(function(product) {
        const card = document.createElement('article');
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;

        const name = document.createElement('h3');
        name.appendChild(document.createTextNode(product.name));

        const price = document.createElement('p');
        price.appendChild(document.createTextNode('Price: $' + product.price.toFixed(2)));

        const btn = document.createElement('button');
        btn.appendChild(document.createTextNode('Add to Cart'));
        btn.setAttribute('data-id', product.id);
        btn.classList.add('add-to-cart');

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(btn);

        productContainer.appendChild(card);
    });
}

document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('add-to-cart')) {
        const productId = parseInt(event.target.getAttribute('data-id'));
        const foundProduct = products.filter(function(p) { return p.id === productId; })[0];

        if (foundProduct) {
            const existing = cartItems.filter(function(p) { return p.id === productId; })[0];

            if (existing) {
                existing.quantity += 1;
            } else {
                cartItems.push({
                    id: foundProduct.id,
                    name: foundProduct.name,
                    price: foundProduct.price,
                    image: foundProduct.image,
                    quantity: 1
                });
            }

            saveCart(cartItems);

            const card = event.target.closest('article');
            if (card) {
                card.classList.add('fade-in');
                setTimeout(function() { card.classList.remove('fade-in'); }, 600);
            }

            event.target.textContent = '✓ Added!';
            setTimeout(function() { event.target.textContent = 'Add to Cart'; }, 1000);

            renderCart();
        }
    }
});

function renderCart() {
    const cartList   = document.querySelector('.cart-container');
    const subtotalEl = document.querySelector('.cart-subtotal');

    if (!cartList) return;

    cartItems = loadCart();
    cartList.textContent = '';

    if (cartItems.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.appendChild(document.createTextNode('Your cart is currently empty.'));
        cartList.appendChild(emptyMsg);
        if (subtotalEl) subtotalEl.textContent = '';
        return;
    }

    cartItems.forEach(function(item) {
        const li   = document.createElement('li');
        const img  = document.createElement('img');
        img.src    = item.image;
        img.alt    = item.name;

        const info = document.createElement('div');
        info.classList.add('cart-info');

        const nameEl = document.createElement('h3');
        nameEl.appendChild(document.createTextNode(item.name));

        const priceEl = document.createElement('p');
        priceEl.appendChild(document.createTextNode('Price: $' + item.price.toFixed(2)));

        const qtyLabel = document.createElement('label');
        qtyLabel.appendChild(document.createTextNode('Quantity: '));

        const qtyInput = document.createElement('input');
        qtyInput.type  = 'number';
        qtyInput.value = item.quantity;
        qtyInput.min   = 0;
        qtyInput.setAttribute('data-id', item.id);

        qtyInput.addEventListener('change', function() {
            const newQty    = parseInt(this.value);
            const productId = parseInt(this.getAttribute('data-id'));

            if (newQty <= 0) {
                cartItems = cartItems.filter(function(p) { return p.id !== productId; });
            } else {
                cartItems.forEach(function(p) { if (p.id === productId) p.quantity = newQty; });
            }

            saveCart(cartItems);
            renderCart();
        });

        qtyLabel.appendChild(qtyInput);
        info.appendChild(nameEl);
        info.appendChild(priceEl);
        info.appendChild(qtyLabel);
        li.appendChild(img);
        li.appendChild(info);
        cartList.appendChild(li);
    });

    const total = cartItems.reduce(function(sum, item) {
        return sum + (item.price * item.quantity);
    }, 0);

    if (subtotalEl) {
        subtotalEl.textContent = 'Subtotal: $' + total.toFixed(2);
    }
}

renderCart();

function renderCheckoutSummary() {
    const itemsTotalEl = document.querySelector('#checkout-items-total');
    const shippingEl   = document.querySelector('#checkout-shipping');
    const totalEl      = document.querySelector('#checkout-total');

    if (!itemsTotalEl) return;

    cartItems = loadCart();

    const itemsTotal = cartItems.reduce(function(sum, item) {
        return sum + (item.price * item.quantity);
    }, 0);

    const grandTotal = itemsTotal + SHIPPING_FEE;

    itemsTotalEl.textContent = '$' + itemsTotal.toFixed(2);
    shippingEl.textContent   = '$' + SHIPPING_FEE.toFixed(2);
    totalEl.textContent      = '$' + grandTotal.toFixed(2);
}

renderCheckoutSummary();

const checkoutForm = document.querySelector('.checkout-form');

if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const nameInput   = document.querySelector('#checkout-name');
        const streetInput = document.querySelector('#checkout-street');
        const zipInput    = document.querySelector('#checkout-zip');
        const errorMsg    = document.querySelector('.form-error');

        let isValid = true;

        nameInput.classList.remove('error');
        streetInput.classList.remove('error');
        zipInput.classList.remove('error');

        if (nameInput.value === '')   { nameInput.classList.add('error');   isValid = false; }
        if (streetInput.value === '') { streetInput.classList.add('error'); isValid = false; }
        if (zipInput.value === '')    { zipInput.classList.add('error');    isValid = false; }

        if (!isValid) {
            errorMsg.textContent = 'Please fill in all required fields.';
        } else {
            localStorage.removeItem('cartItems');
            window.location.href = 'thankyou.html';
        }
    });
}

const currentUser = {
    name: 'Princess',
    email: 'princess@example.com',
    orderHistory: [
        {
            id: '#12345',
            date: 'January 15, 2024',
            status: 'Delivered',
            total: 75.00,
            items: [
                { name: 'Sony Headphones', qty: 2, price: 10.00 },
                { name: 'Controller',      qty: 1, price: 20.00 }
            ]
        },
        {
            id: '#12344',
            date: 'January 10, 2024',
            status: 'Delivered',
            total: 150.00,
            items: [
                { name: 'Nintendo Switch',     qty: 1, price: 120.00 },
                { name: 'Mechanical Keyboard', qty: 2, price: 45.00 }
            ]
        },
        {
            id: '#12343',
            date: 'December 28, 2023',
            status: 'Delivered',
            total: 45.00,
            items: [
                { name: 'Sony Headphones', qty: 3, price: 10.00 }
            ]
        }
    ]
};

const greetingEl = document.querySelector('#account-greeting');
if (greetingEl) {
    greetingEl.textContent = 'Welcome, ' + currentUser.name + '!';
}

const profileName  = document.querySelector('#profile-name');
const profileEmail = document.querySelector('#profile-email');
if (profileName)  profileName.value  = currentUser.name;
if (profileEmail) profileEmail.value = currentUser.email;

const orderList = document.querySelector('#order-list');

if (orderList) {
    currentUser.orderHistory.forEach(function(order) {
        const details = document.createElement('details');
        details.classList.add('order-details');

        const summary = document.createElement('summary');
        summary.classList.add('order-summary');
        summary.textContent = 'Order ' + order.id + '  —  ' + order.date + '  —  Total: $' + order.total.toFixed(2);

        details.appendChild(summary);

        summary.addEventListener('click', function() {
            if (details.querySelector('.order-body')) return;

            let itemsHTML = '';
            order.items.forEach(function(item) {
                itemsHTML += '<li>' + item.name + ' x' + item.qty +
                             ' — $' + (item.price * item.qty).toFixed(2) + '</li>';
            });

            details.innerHTML += (
                '<div class="order-body">' +
                    '<p><b>Status:</b> ' + order.status + '</p>' +
                    '<p><b>Items:</b></p>' +
                    '<ul>' + itemsHTML + '</ul>' +
                    '<p><b>Order Total: $' + order.total.toFixed(2) + '</b></p>' +
                '</div>'
            );
        });

        orderList.appendChild(details);
    });
}
