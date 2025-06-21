const Cart = {
    items: [],

    init() {
        const storedItems = localStorage.getItem('cart');
        if (storedItems) {
            this.items = JSON.parse(storedItems);
        }
    },

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },

    addItem(product, quantity) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image.mobile,
                quantity: quantity,
            };
            this.items.push(cartItem);
        }
        this.save();
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity > 0) {
                item.quantity = quantity;
            } else {
                this.removeItem(productId);
            }
        }
        this.save();
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
    },
    
    clear() {
        this.items = [];
        this.save();
    },

    getCart() {
        return this.items;
    },

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
};

Cart.init();