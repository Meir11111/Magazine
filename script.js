// Глобальные переменные
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// DOM элементы
const header = document.querySelector('header');
const cartCount = document.querySelector('.cart-count');
const modals = document.querySelectorAll('.modal');
const closeButtons = document.querySelectorAll('.close-modal');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const quantityButtons = document.querySelectorAll('.quantity-btn');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist');
const quickViewButtons = document.querySelectorAll('.quick-view');
const newsletterForm = document.querySelector('.newsletter form');
const contactForm = document.querySelector('.contact-form form');

// Обработка прокрутки
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Модальные окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
});

// Вкладки
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.dataset.target;
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

// Корзина
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'block' : 'none';
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    showNotification('Товар добавлен в корзину');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
    showNotification('Товар удален из корзины');
}

function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Ваша корзина пуста</p>
            </div>
        `;
        cartTotal.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="price">${item.price} ₸</p>
                <div class="quantity-selector">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.innerHTML = `
        <span>Итого:</span>
        <span>${total} ₸</span>
    `;
    cartTotal.style.display = 'flex';
    
    // Обработчики для кнопок количества
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const item = cart.find(item => item.id === id);
            
            if (e.target.classList.contains('plus')) {
                item.quantity += 1;
            } else if (e.target.classList.contains('minus') && item.quantity > 1) {
                item.quantity -= 1;
            }
            
            updateCartDisplay();
            updateCartCount();
        });
    });
    
    // Обработчики для кнопок удаления
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('.remove-item').dataset.id;
            removeFromCart(id);
        });
    });
}

// Избранное
function toggleWishlist(product) {
    const index = wishlist.findIndex(item => item.id === product.id);
    
    if (index === -1) {
        wishlist.push(product);
        showNotification('Товар добавлен в избранное');
    } else {
        wishlist.splice(index, 1);
        showNotification('Товар удален из избранного');
    }
    
    updateWishlistDisplay();
}

function updateWishlistDisplay() {
    const wishlistItems = document.querySelector('.wishlist-items');
    
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = `
            <div class="wishlist-empty">
                <i class="fas fa-heart"></i>
                <p>Ваш список избранного пуст</p>
            </div>
        `;
        return;
    }
    
    wishlistItems.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="wishlist-item-info">
                <h4>${item.name}</h4>
                <p class="price">${item.price} ₸</p>
            </div>
            <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Обработчики для кнопок удаления
    document.querySelectorAll('.wishlist-item .remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('.remove-item').dataset.id;
            const index = wishlist.findIndex(item => item.id === id);
            wishlist.splice(index, 1);
            updateWishlistDisplay();
            showNotification('Товар удален из избранного');
        });
    });
}

// Быстрый просмотр
function showQuickView(product) {
    const modal = document.getElementById('quick-view-modal');
    const content = modal.querySelector('.quick-view-content');
    
    content.innerHTML = `
        <div class="quick-view-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="quick-view-info">
            <h3>${product.name}</h3>
            <div class="product-price">
                <span class="price">${product.price} ₸</span>
                ${product.oldPrice ? `<span class="old-price">${product.oldPrice} ₸</span>` : ''}
            </div>
            <div class="product-rating">
                ${generateStars(product.rating)}
            </div>
            <p>${product.description}</p>
            <div class="quantity-selector">
                <button class="quantity-btn minus">-</button>
                <input type="number" id="quantity" value="1" min="1">
                <button class="quantity-btn plus">+</button>
            </div>
            <button class="btn add-to-cart" data-id="${product.id}">
                Добавить в корзину
            </button>
        </div>
    `;
    
    // Обработчики для кнопок количества
    const quantityInput = content.querySelector('#quantity');
    const minusBtn = content.querySelector('.quantity-btn.minus');
    const plusBtn = content.querySelector('.quantity-btn.plus');
    
    minusBtn.addEventListener('click', () => {
        const value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });
    
    plusBtn.addEventListener('click', () => {
        const value = parseInt(quantityInput.value);
        quantityInput.value = value + 1;
    });
    
    // Обработчик для кнопки добавления в корзину
    const addToCartBtn = content.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        addToCart({ ...product, quantity });
        closeModal(modal);
    });
    
    openModal('quick-view-modal');
}

// Вспомогательные функции
function generateStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push('<i class="fas fa-star"></i>');
        } else if (i - 0.5 <= rating) {
            stars.push('<i class="fas fa-star-half-alt"></i>');
        } else {
            stars.push('<i class="far fa-star"></i>');
        }
    }
    return stars.join('');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Обработчики событий
addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productId = e.target.closest('.add-to-cart').dataset.id;
        const product = {
            id: productId,
            name: e.target.closest('.product-card').querySelector('h3').textContent,
            price: parseFloat(e.target.closest('.product-card').querySelector('.price').textContent),
            image: e.target.closest('.product-card').querySelector('img').src
        };
        addToCart(product);
    });
});

addToWishlistButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productId = e.target.closest('.add-to-wishlist').dataset.id;
        const product = {
            id: productId,
            name: e.target.closest('.product-card').querySelector('h3').textContent,
            price: parseFloat(e.target.closest('.product-card').querySelector('.price').textContent),
            image: e.target.closest('.product-card').querySelector('img').src
        };
        toggleWishlist(product);
    });
});

quickViewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        const product = {
            id: button.dataset.id,
            name: productCard.querySelector('h3').textContent,
            price: parseFloat(productCard.querySelector('.price').textContent),
            oldPrice: productCard.querySelector('.old-price')?.textContent,
            rating: parseFloat(productCard.querySelector('.product-rating').dataset.rating),
            image: productCard.querySelector('img').src,
            description: 'Описание товара...' // Здесь должно быть реальное описание
        };
        showQuickView(product);
    });
});

// Формы
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    // Здесь должна быть отправка данных на сервер
    showNotification('Спасибо за подписку!');
    e.target.reset();
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Здесь должна быть отправка данных на сервер
    showNotification('Сообщение отправлено!');
    e.target.reset();
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    initializeWishlist();
    initializeForms();
    initializeModals();
    initializeAnimations();
});

function initializeCart() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    const cartEmpty = document.querySelector('.cart-empty');
    
    function updateCart() {
        // Обновляем счетчик
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Обновляем содержимое корзины
        if (cartItems) {
            if (cart.length === 0) {
                cartEmpty.style.display = 'block';
                cartItems.style.display = 'none';
            } else {
                cartEmpty.style.display = 'none';
                cartItems.style.display = 'block';
                
                cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">${item.price} ₸</div>
                            <div class="cart-item-quantity">
                                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
                    </div>
                `).join('');
                
                // Обновляем общую сумму
                const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                cartTotal.textContent = `${total} ₸`;
            }
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Добавляем в корзину
    window.addToCart = function(id, name, price, image) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }
        
        updateCart();
        showNotification('Товар добавлен в корзину');
    };
    
    // Обновляем количество
    window.updateQuantity = function(id, newQuantity) {
        if (newQuantity < 1) {
            removeFromCart(id);
            return;
        }
        
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity = newQuantity;
            updateCart();
        }
    };
    
    // Удаляем из корзины
    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
        showNotification('Товар удален из корзины');
    };
    
    // Инициализация корзины
    updateCart();
}

// Избранное
function initializeWishlist() {
    const wishlistCount = document.querySelector('.wishlist-count');
    const wishlistItems = document.querySelector('.wishlist-items');
    
    function updateWishlist() {
        // Обновляем счетчик
        wishlistCount.textContent = wishlist.length;
        
        // Обновляем содержимое избранного
        if (wishlistItems) {
            wishlistItems.innerHTML = wishlist.map(item => `
                <div class="wishlist-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="wishlist-item-info">
                        <h4>${item.name}</h4>
                        <div class="wishlist-item-price">${item.price} ₸</div>
                    </div>
                    <button class="remove-item" onclick="removeFromWishlist(${item.id})">×</button>
                </div>
            `).join('');
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    // Добавляем в избранное
    window.addToWishlist = function(id, name, price, image) {
        if (!wishlist.find(item => item.id === id)) {
            wishlist.push({ id, name, price, image });
            updateWishlist();
            showNotification('Товар добавлен в избранное');
        }
    };
    
    // Удаляем из избранного
    window.removeFromWishlist = function(id) {
        wishlist = wishlist.filter(item => item.id !== id);
        updateWishlist();
        showNotification('Товар удален из избранного');
    };
    
    // Инициализация избранного
    updateWishlist();
}

// Формы
function initializeForms() {
    // Форма подписки
    const newsletterForm = document.querySelector('.newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Здесь нужно добавить вашу логику отправки email
            // Например, отправка на ваш email через EmailJS или другой сервис
            
            showNotification('Спасибо за подписку!');
            this.reset();
        });
    }
    
    // Форма обратной связи
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = {
                name: this.querySelector('input[type="text"]').value,
                email: this.querySelector('input[type="email"]').value,
                message: this.querySelector('textarea').value
            };
            
            // Здесь нужно добавить вашу логику отправки формы
            // Например, отправка на ваш email через EmailJS или другой сервис
            
            showNotification('Сообщение отправлено!');
            this.reset();
        });
    }
}

// Модальные окна
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Закрытие по клику на крестик
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Закрытие по клику вне модального окна
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Быстрый просмотр товара
    window.quickView = function(id, name, price, image, description) {
        const modal = document.querySelector('.quick-view-modal');
        if (modal) {
            modal.querySelector('img').src = image;
            modal.querySelector('h3').textContent = name;
            modal.querySelector('.price').textContent = `${price} ₸`;
            modal.querySelector('p').textContent = description;
            modal.classList.add('active');
        }
    };
}

// Анимации
function initializeAnimations() {
    // Анимация появления элементов при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.product-card, .category-card, .sale-card').forEach(el => {
        observer.observe(el);
    });
}
