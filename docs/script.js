const cart = {
    items: JSON.parse(localStorage.getItem('cartItems')) || [],

    addItem(name, price) {
        const existingItem = this.items.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({ name, price, quantity: 1 });
        }
        this.updateCart();
    },

    incrementItem(name, price) {
        const item = this.items.find(item => item.name === name);
        if (item) {
            item.quantity++;
            this.updateCart();
        }
    },

    decrementItem(name) {
        const index = this.items.findIndex(item => item.name === name);
        if (index !== -1) {
            if (this.items[index].quantity > 1) {
                this.items[index].quantity--;
            } else {
                this.items.splice(index, 1);
            }
            this.updateCart();
        }
    },

    removeItem(name) {
        this.items = this.items.filter(item => item.name !== name);
        this.updateCart();
    },
    
    /* Добавление в корзину */
    updateCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));

        const count = this.items.reduce((sum, i) => sum + i.quantity, 0);
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) cartCountEl.textContent = count;

        const content = document.getElementById('cartContent');
        const totalEl = document.getElementById('cartTotal');

        if (content) {
            if (this.items.length === 0) {
                content.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
            } else {
                content.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${item.price} ₽</div>
                        </div>
                        <div class="cart-item-controls">
                            <button onclick="cart.decrementItem('${item.name}')">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="cart.incrementItem('${item.name}', ${item.price})">+</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        const total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (totalEl) totalEl.textContent = total;
    },

    openCart() {
        document.getElementById('cartModal').style.display = 'block';
    },

    closeCart() {
        document.getElementById('cartModal').style.display = 'none';
    },

    checkout() {
        if (this.items.length === 0) {
            alert('Ваша корзина пуста!');
            return;
        }

        const username = localStorage.getItem('loggedInUser');
        if (!username) {
            alert('Необходимо войти в систему, чтобы оформить заказ.');
            return;
        }

        localStorage.setItem('checkoutItems', JSON.stringify(this.items));
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        localStorage.setItem('checkoutTotal', total);

        window.location.href = 'checkout.html';
    }
};


// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    const cartBtn = document.getElementById('cart-button');
    const closeBtn = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartBtn) cartBtn.addEventListener('click', () => cart.openCart());
    if (closeBtn) closeBtn.addEventListener('click', () => cart.closeCart());

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('cartModal')) {
            cart.closeCart();
        }
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => cart.checkout());
    }

    cart.updateCart(); // при загрузке страницы
});




// Получение корзины из localStorage
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Функция генерации заказа и добавления его в историю
function placeOrder() {
  if (cartItems.length === 0) {
    alert("Корзина пуста. Добавьте товары перед оформлением заказа.");
    return;
  }

  const order = {
    id: Date.now(), // Уникальный идентификатор
    date: new Date().toLocaleString(),
    items: cartItems,
    total: calculateTotal(cartItems)
  };

  // Получаем текущую историю заказов
  const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

  // Добавляем новый заказ
  orderHistory.push(order);

  // Сохраняем обновлённую историю
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

  // Очищаем корзину
  localStorage.removeItem('cartItems');

  alert("Заказ успешно оформлен!");
  // Перенаправление или обновление страницы
  window.location.href = "Profile.html"; // например, на страницу профиля
}

// Функция для расчета общей суммы заказа
function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}


// Кнопка вверх
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.onscroll = function () {
  scrollToTopBtn.style.display = (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200)
    ? "block"
    : "none";
};

scrollToTopBtn.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

/* Бургер-меню */
document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector(".burger-menu");
    const navbar = document.querySelector(".navbar");

    burger.addEventListener("click", () => {
      navbar.classList.toggle("active");
    });
  });