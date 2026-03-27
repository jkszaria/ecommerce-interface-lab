// we created a Product class so we can make product objects more easily. Instead of writing out the same properties every time, just call new Product() and pass in the values we need.
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

// we set the shipping fee as a constant at the top so if we ever need to change it, we only have to change it in one place.
const SHIPPING_FEE = 5.00;

// we learned that JavaScript resets every time you go to a new page, so the cart would always be empty when we navigate away. we fixed this by saving the cart to localStorage, which keeps the data even when the page changes.

function loadCart() {
    const saved = localStorage.getItem('cartItems');
    // If there's nothing saved yet, we return an empty array as a default
    return saved ? JSON.parse(saved) : [];
}

function saveCart(cart) {
    // localStorage can only store strings, so we used JSON.stringify to convert our array into a string before saving it
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

// we load the cart right away when the script runs so it's always up to date
let cartItems = loadCart();

// we used document.querySelector to select the product grid container.  we also check if it exists first because this element is only on products.html, so on other pages it would be null and cause an error.
const productContainer = document.querySelector('.product-grid');

if (productContainer) {

    // we clear the container first so there's no duplicate static HTML
    productContainer.textContent = '';

    // we used .forEach() to loop through every product in the array. For each product, we build a card and add it to the page.
    products.forEach(function(product) {

        // we used document.createElement('article') to create the card element. This is safer than using innerHTML because it won't accidentally run any scripts hidden inside the content.
        const card = document.createElement('article');

        // we created the image element and set its src and alt properties
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;

        // we used createElement('h3') for the product name and createTextNode to safely set the text inside it
        const name = document.createElement('h3');
        name.appendChild(document.createTextNode(product.name));

        // we used createElement('p') for the price and .toFixed(2) to make sure it always shows two decimal places like $10.00
        const price = document.createElement('p');
        price.appendChild(document.createTextNode('Price: $' + product.price.toFixed(2)));

        // we created the Add to Cart button and used setAttribute to store the product id in a data-id attribute. This way when the button is clicked, we can read the id to know which product was added.
        const btn = document.createElement('button');
        btn.appendChild(document.createTextNode('Add to Cart'));
        btn.setAttribute('data-id', product.id);
        btn.classList.add('add-to-cart');

        // we used appendChild to attach each element to the card in order,then attached the whole card to the grid
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(btn);

        productContainer.appendChild(card);
    });
}




// Instead of adding a separate addEventListener to every single button, we added just one listener to document.body. This works because click events "bubble up" from the button all the way to the body. we then check if the clicked element is an add-to-cart button before doing anything.



document.body.addEventListener('click', function(event) {

    if (event.target.classList.contains('add-to-cart')) {

        const productId = parseInt(event.target.getAttribute('data-id'));

        const foundProduct = products.filter(function(p) {
            return p.id === productId;
        })[0];

        if (foundProduct) {

            const existing = cartItems.filter(function(p) {
                return p.id === productId;
            })[0];

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
                setTimeout(function() {
                    card.classList.remove('fade-in');
                }, 600);
            }

            event.target.textContent = '✓ Added!';
            setTimeout(function() {
                event.target.textContent = 'Add to Cart';
            }, 1000);

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
                cartItems = cartItems.filter(function(p) {
                    return p.id !== productId;
                });
            } else {
                cartItems.forEach(function(p) {
                    if (p.id === productId) {
                        p.quantity = newQty;
                    }
                });
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