document.addEventListener('DOMContentLoaded', () => {

    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const cartModalOverlay = document.getElementById('cart-modal-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemCount = document.getElementById('cart-item-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const removeAllBtn = document.getElementById('remove-all-btn');
    
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    const renderCart = () => {
        const items = Cart.getCart();
        cartItemsContainer.innerHTML = ''; 

        if (items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
            if (cartCheckoutBtn) {
                cartCheckoutBtn.classList.add('disabled');
            }
        } else {
            if (cartCheckoutBtn) {
                cartCheckoutBtn.classList.remove('disabled');
            }
            items.forEach(item => {
                const cartItemEl = document.createElement('div');
                cartItemEl.classList.add('cart-item');
                cartItemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <strong>${item.name.replace(/(headphones|earphones|speaker)/i, '').trim()}</strong>
                        <p>$ ${item.price.toLocaleString()}</p>
                    </div>
                    <div class="quantity-selector">
                        <button class="cart-quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="cart-quantity-btn" data-id="${item.id}" data-change="1">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemEl);
            });
        }
        
        cartItemCount.textContent = Cart.getTotalItems();
        cartTotalPrice.textContent = `$ ${Cart.getSubtotal().toLocaleString()}`;
    };

    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn && cartModalOverlay) {
        cartBtn.addEventListener('click', () => {
            renderCart(); 
            cartModalOverlay.classList.add('is-open');
        });

        cartModalOverlay.addEventListener('click', (e) => {
            if (e.target === cartModalOverlay) {
                cartModalOverlay.classList.remove('is-open');
            }
        });
    }

    if(removeAllBtn) {
        removeAllBtn.addEventListener('click', () => {
            Cart.clear();
            renderCart();
        });
    }

    if(cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.matches('.cart-quantity-btn')) {
                const productId = e.target.dataset.id;
                const change = parseInt(e.target.dataset.change);
                
                const item = Cart.getCart().find(i => i.id == productId);
                if(item) {
                    const newQuantity = item.quantity + change;
                    Cart.updateQuantity(productId, newQuantity);
                    renderCart();
                }
            }
        });
    }


    if (document.body.classList.contains('page-product')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productSlug = urlParams.get('slug');

        if (!productSlug) {
            document.body.innerHTML = '<h1>Product not found!</h1>';
            return;
        }

        const productDetailContainer = document.getElementById('product-detail-container');
        const featuresText = document.getElementById('features-text');
        const includesList = document.getElementById('includes-list');
        const galleryContainer = document.getElementById('product-gallery-container');
        const relatedContainer = document.getElementById('related-products-container');

        const loadProductData = async () => {
            try {
                const response = await fetch('data.json');
                const products = await response.json();
                const product = products.find(p => p.slug === productSlug);

                if (!product) {
                    throw new Error('Product not found');
                }

                renderProductShowcase(product);
                renderFeatures(product);
                renderIncludes(product);
                renderGallery(product);
                renderRelatedProducts(product, products);

            } catch (error) {
                console.error('Error loading product page:', error);
                document.body.innerHTML = `<h1>Error: ${error.message}</h1>`;
            }
        };
        
        const renderProductShowcase = (product) => {
            productDetailContainer.innerHTML = `
                <div class="product-showcase-img">
                    <picture>
                        <source media="(min-width: 1110px)" srcset="${product.image.desktop}">
                        <source media="(min-width: 768px)" srcset="${product.image.tablet}">
                        <img src="${product.image.mobile}" alt="${product.name}">
                    </picture>
                </div>
                <div class="product-showcase-content">
                    ${product.new ? '<p class="overline">New Product</p>' : ''}
                    <h2>${product.name}</h2>
                    <p>${product.description}</p>
                    <p class="product-price">$ ${product.price.toLocaleString()}</p>
                    <div class="add-to-cart-controls">
                        <div class="quantity-selector">
                            <button id="quantity-minus">-</button>
                            <span id="quantity-display" class="quantity-display">1</span>
                            <button id="quantity-plus">+</button>
                        </div>
                        <button class="btn btn-primary" id="add-to-cart-btn">Add to Cart</button>
                    </div>
                </div>
            `;

            const minusBtn = document.getElementById('quantity-minus');
            const plusBtn = document.getElementById('quantity-plus');
            const quantityDisplay = document.getElementById('quantity-display');
            const addToCartBtn = document.getElementById('add-to-cart-btn');

            let quantity = 1;

            minusBtn.addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                }
            });

            plusBtn.addEventListener('click', () => {
                quantity++;
                quantityDisplay.textContent = quantity;
            });
            
            addToCartBtn.addEventListener('click', () => {
                console.log(`Adding ${quantity} of product ID ${product.id} to cart.`);
            });


            addToCartBtn.addEventListener('click', () => {
                
                Cart.addItem(product, quantity);
                alert(`${quantity} x ${product.name} has been added to your cart!`);
                console.log('Cart state:', Cart.getCart());
            });
        };

        const renderFeatures = (product) => {
            const featuresContent = document.createElement('p');
            featuresContent.innerText = product.features;
            featuresText.appendChild(featuresContent);
        };

        const renderIncludes = (product) => {
            includesList.innerHTML = '';
            product.includes.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="quantity">${item.quantity}x</span> ${item.item}`;
                includesList.appendChild(li);
            });
        };
        
        const renderGallery = (product) => {
            galleryContainer.innerHTML = `
                <div class="gallery-img-1">
                    <picture>
                        <source media="(min-width: 1110px)" srcset="${product.gallery.first.desktop}">
                        <source media="(min-width: 768px)" srcset="${product.gallery.first.tablet}">
                        <img src="${product.gallery.first.mobile}" alt="Product gallery image 1">
                    </picture>
                </div>
                <div class="gallery-img-2">
                     <picture>
                        <source media="(min-width: 1110px)" srcset="${product.gallery.second.desktop}">
                        <source media="(min-width: 768px)" srcset="${product.gallery.second.tablet}">
                        <img src="${product.gallery.second.mobile}" alt="Product gallery image 2">
                    </picture>
                </div>
                <div class="gallery-img-3">
                     <picture>
                        <source media="(min-width: 1110px)" srcset="${product.gallery.third.desktop}">
                        <source media="(min-width: 768px)" srcset="${product.gallery.third.tablet}">
                        <img src="${product.gallery.third.mobile}" alt="Product gallery image 3">
                    </picture>
                </div>
            `;
        };
        
        const renderRelatedProducts = (product) => {
            relatedContainer.innerHTML = '';
            product.others.forEach(related => {
                relatedContainer.innerHTML += `
                    <div class="related-product-card">
                        <picture>
                            <source media="(min-width: 1110px)" srcset="${related.image.desktop}">
                            <source media="(min-width: 768px)" srcset="${related.image.tablet}">
                            <img src="${related.image.mobile}" alt="${related.name}">
                        </picture>
                        <h4>${related.name}</h4>
                        <a href="/product.html?slug=${related.slug}" class="btn btn-primary">See Product</a>
                    </div>
                `;
            });
        };

        loadProductData();
    }
    
    if (document.body.classList.contains('page-category')) {
        
        const loadCategoryPage = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');

            const categoryTitleElement = document.getElementById('category-name-title');
            const productListContainer = document.getElementById('product-list-container');

            if (!category || !categoryTitleElement || !productListContainer) {
                console.error('Category page elements not found or category not specified.');
                return;
            }

            categoryTitleElement.textContent = category;

            try {
                const response = await fetch('data.json');
                const products = await response.json();

                const categoryProducts = products.filter(product => product.category === category);

                productListContainer.innerHTML = '';
                
                categoryProducts.forEach(product => {
                    const productCard = document.createElement('article');
                    productCard.classList.add('product-card');

                    productCard.innerHTML = `
                        <div class="product-card-img">
                            <picture>
                                <source media="(min-width: 1110px)" srcset="${product.categoryImage.desktop}">
                                <source media="(min-width: 768px)" srcset="${product.categoryImage.tablet}">
                                <img src="${product.categoryImage.mobile}" alt="${product.name}">
                            </picture>
                        </div>
                        <div class="product-card-content">
                            ${product.new ? '<p class="overline">New Product</p>' : ''}
                            <h2>${product.name}</h2>
                            <p>${product.description}</p>
                            <a href="/product.html?slug=${product.slug}" class="btn btn-primary">See Product</a>
                        </div>
                    `;
                    productListContainer.appendChild(productCard);
                });

            } catch (error) {
                console.error('Failed to load product data:', error);
                productListContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
            }
        };

        loadCategoryPage();
    }

    if (document.body.classList.contains('page-checkout')) {
        const form = document.getElementById('checkout-form');

        const summaryItemsContainer = document.getElementById('summary-items-container');
        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryShipping = document.getElementById('summary-shipping');
        const summaryVat = document.getElementById('summary-vat');
        const summaryGrandTotal = document.getElementById('summary-grand-total');

        const renderCheckoutSummary = () => {
            const items = Cart.getCart();
            if (!summaryItemsContainer || items.length === 0) {
                summaryItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
                if(form) form.querySelector('button[type="submit"]').disabled = true;
                return;
            }
            summaryItemsContainer.innerHTML = '';
            items.forEach(item => { /* ... (summary item rendering code from previous step) ... */ });
            const subtotal = Cart.getSubtotal();
            const shipping = 50;
            const vat = subtotal * 0.20;
            const grandTotal = subtotal + shipping + vat;
            summarySubtotal.textContent = `$ ${subtotal.toLocaleString()}`;
            summaryShipping.textContent = `$ ${shipping.toLocaleString()}`;
            summaryVat.textContent = `$ ${vat.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
            summaryGrandTotal.textContent = `$ ${grandTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        };
        renderCheckoutSummary();

        const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
        const eMoneyFields = document.getElementById('e-money-fields');
        const cashInfo = document.getElementById('cash-on-delivery-info');
        
        paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'e-money') {
                    eMoneyFields.style.display = 'grid';
                    cashInfo.style.display = 'none';
                } else {
                    eMoneyFields.style.display = 'none';
                    cashInfo.style.display = 'flex';
                }
            });
        });

        const confirmationModalOverlay = document.getElementById('confirmation-modal-overlay');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                let isFormValid = true;

                const requiredFields = form.querySelectorAll('[required]');
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isFormValid = false;
                        field.nextElementSibling.textContent = 'Field cannot be empty';
                        field.style.borderColor = 'red';
                    } else {
                        field.nextElementSibling.textContent = '';
                        field.style.borderColor = '';
                    }
                });

                if (isFormValid) {
                    const cartItems = Cart.getCart();
                    const grandTotal = document.getElementById('summary-grand-total').textContent;
                    
                    document.getElementById('confirmation-grand-total').textContent = grandTotal;
                    
                    const confirmationItemsBox = document.getElementById('confirmation-items-box');
                    confirmationItemsBox.innerHTML = '';
                    
                    if (cartItems.length > 0) {
                        const firstItem = cartItems[0];
                        const firstItemEl = document.createElement('div');
                        firstItemEl.classList.add('summary-item');
                        firstItemEl.innerHTML = `
                            <img src="${firstItem.image}" alt="${firstItem.name}" />
                            <div class="summary-item-info">
                                <strong>${firstItem.name.replace(/(headphones|earphones|speaker)/i, '').trim()}</strong>
                                <p>$ ${firstItem.price.toLocaleString()}</p>
                            </div>
                            <span>x${firstItem.quantity}</span>
                        `;
                        confirmationItemsBox.appendChild(firstItemEl);

                        if (cartItems.length > 1) {
                            const otherItemsEl = document.createElement('p');
                            otherItemsEl.classList.add('other-items-text');
                            otherItemsEl.textContent = `and ${cartItems.length - 1} other item(s)`;
                            confirmationItemsBox.appendChild(otherItemsEl);
                        }
                    }

                    confirmationModalOverlay.classList.add('is-open');
                    Cart.clear();
                }
            });
        }
    }
    renderCart(); 
});