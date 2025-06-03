// Проверка валидности productId
function isValidProductId(id) {
  return typeof id === 'string' && id.length === 24 && /^[a-f0-9]{24}$/.test(id);
}

// Маска для поля телефона
document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
      e.target.value = !x[2]
        ? '+' + x[1]
        : '+' + x[1] + ' (' + x[2] + ')' + (x[3] ? ' ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
  }
});

// Основная корзина
const cart = {
  items: [],

  async getCart() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    try {
      const res = await fetch(`/api/v1/cart/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка загрузки корзины');
      const data = await res.json();
      this.items = data.items || [];
      this.updateCartUI();
    } catch (err) {
      console.error(err);
    }
  },

  updateCartUI() {
    const cartContent = document.getElementById('cartContent');
    const cartTotal = document.getElementById('cartTotal');
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');

    if (cartContent) {
      cartContent.innerHTML = this.items.length
        ? this.items.map(item => `
            <div class="cart-item">
              <div class="cart-item-line">
                <span>${item.name}</span>
                <span>${item.price * item.quantity} ₽</span>
              </div>
              <div class="cart-controls">
                <button class="decrement" data-id="${item.productId}">-</button>
                <span>${item.quantity}</span>
                <button class="increment" data-id="${item.productId}">+</button>
              </div>
            </div>
          `).join('')
        : '<div class="empty-cart">Корзина пуста</div>';
    }

    const total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (cartTotal) cartTotal.textContent = `Итого: ${total} ₽`;
    if (orderTotal) orderTotal.textContent = `Итого: ${total} ₽`;

    if (orderItems) {
      orderItems.innerHTML = this.items.map(item => `
        <div class="order-item">
          <div>${item.name} × ${item.quantity}</div>
          <div>${item.price * item.quantity} ₽</div>
        </div>
      `).join('');
    }

    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);

    this.addCartModalListeners();
  },

  addCartModalListeners() {
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;

    cartContent.addEventListener('click', async (e) => {
      if (e.target.classList.contains('decrement')) {
        const id = e.target.dataset.id;
        const item = this.items.find(i => i.productId === id);
        if (!item) return;
        if (item.quantity === 1) {
          await this.removeItem(id);
        } else {
          await this.updateQuantity(id, item.quantity - 1);
        }
      }

      if (e.target.classList.contains('increment')) {
        const id = e.target.dataset.id;
        const item = this.items.find(i => i.productId === id);
        if (!item) return;
        await this.updateQuantity(id, item.quantity + 1);
      }
    });
  },

  async updateQuantity(id, quantity) {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return;

  try {
    await fetch('/api/v1/cart/update-item', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: id, quantity, userId })  // исправил
    });
    await this.getCart();
  } catch (err) {
    console.error('Ошибка при обновлении количества:', err);
  }
},

async removeItem(id) {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return;

  try {
    await fetch('/api/v1/cart/remove-item', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: id, userId })  // исправил
    });
    await this.getCart();
  } catch (err) {
    console.error('Ошибка при удалении товара:', err);
  }
},

  openCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.style.display = 'block';
      this.getCart();
    }
  },

  closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) cartModal.style.display = 'none';
  }
};

// Обработка модальной корзины
document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.getElementById('cart-button');
  const closeBtn = document.getElementById('closeCart');
  if (cartBtn) cartBtn.addEventListener('click', () => cart.openCart());
  if (closeBtn) closeBtn.addEventListener('click', () => cart.closeCart());
  document.addEventListener('click', e => {
    const cartModal = document.getElementById('cartModal');
    if (cartModal && !cartModal.contains(e.target) && e.target !== cartBtn) {
      cart.closeCart();
    }
  });

  cart.getCart();
});

// Добавление товара в корзину с правильным ключом productId
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.add-button-size');
  buttons.forEach(button => {
    button.addEventListener('click', async function () {
      const id = this.getAttribute('data-id');
      const name = this.getAttribute('data-name');
      const price = parseInt(this.getAttribute('data-price'));
      const quantity = 1;
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId || !id) return;

      try {
        await fetch('/api/v1/cart/add-item', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id, name, price, quantity, userId })
        });
        cart.getCart();
      } catch (err) {
        console.error(err);
      }
    });
  });
});

// Подтверждение заказа
document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('confirmButton');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
      const comments = document.getElementById('comments').value;
      const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!phone || !address || !paymentMethod) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      // Вычисляем totalAmount
      const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      try {
        const res = await fetch('/api/v1/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId,
            phone,
            address,
            comments,
            paymentMethod,
            totalAmount,
            items: cart.items
          })
        });
        if (!res.ok) throw new Error('Ошибка при оформлении заказа');

        // Показать сообщение
        alert('Спасибо за ваш заказ! Он был успешно оформлен.');

        // Очистить корзину на сервере
        await clearCart();

        // Очистить форму и обновить корзину
        document.getElementById('orderForm').reset();
        cart.getCart();

        // Перенаправить на Profile.html
        window.location.href = 'Profile.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }
});

// Функция для очистки корзины
async function clearCart() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return;

  try {
    await fetch('/api/v1/cart/clear', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });
  } catch (err) {
    console.error('Ошибка при очистке корзины:', err);
  }
}

// login_register.js

// toggleForms: переключение между формами входа и регистрации
function toggleForms(showLogin) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showLoginBtn = document.getElementById('showLogin');
  const showRegisterBtn = document.getElementById('showRegister');

  if (!loginForm || !registerForm || !showLoginBtn || !showRegisterBtn) {
    console.warn('toggleForms: Один или несколько элементов не найдены');
    return;
  }

  if (showLogin) {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    showLoginBtn.classList.remove('active');
    showRegisterBtn.classList.add('active');
  }
}

// Регистрация
// Регистрация
async function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value;
  const errorDiv = document.getElementById('registerError');

  if (!username || !password) {
    errorDiv.textContent = 'Имя пользователя и пароль обязательны';
    errorDiv.className = 'error';
    return;
  }

  try {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем токен и userId в localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);

      // Перенаправление на страницу входа (не на профиль)
      window.location.href = 'login_register.html'; // Перенаправляем на страницу входа после регистрации
    } else {
      errorDiv.className = 'error';
      errorDiv.textContent = data.message || 'Ошибка регистрации';
    }
  } catch (error) {
    errorDiv.className = 'error';
    errorDiv.textContent = 'Ошибка соединения с сервером';
  }
}

// Вход
async function login(event) {
  event.preventDefault(); // Отменяет стандартное поведение формы (перезагрузка)

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const loginBtn = event.target;
  const errorDiv = document.getElementById('loginError');

  if (!username || !password) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Входим...';

  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.className = 'error';
      errorDiv.textContent = data.message || 'Неверные учетные данные';
      return;
    }

    // Если вход успешен
    localStorage.setItem('token', data.token);  // Сохраняем токен
    localStorage.setItem('userId', data.userId);  // Сохраняем userId
    localStorage.setItem('username', data.username);  // Сохраняем username
    window.location.href = 'profile.html';  // Перенаправляем на профиль

  } catch (err) {
    console.error('Ошибка при входе:', err);
    alert('Ошибка сервера при входе');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Войти';
  }
}

// Проверка данных в localStorage перед загрузкой страницы
document.addEventListener('DOMContentLoaded', () => {
  const showLoginBtn = document.getElementById('showLogin');
  const showRegisterBtn = document.getElementById('showRegister');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (showLoginBtn && showRegisterBtn) {
    showLoginBtn.addEventListener('click', () => toggleForms(true));
    showRegisterBtn.addEventListener('click', () => toggleForms(false));
  }

  if (loginBtn) loginBtn.addEventListener('click', login);
  if (registerBtn) registerBtn.addEventListener('click', register);

  toggleForms(true); // По умолчанию показываем форму входа

  // Проверка данных в localStorage перед загрузкой страницы
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    console.error('Токен или userId отсутствуют');
    if (window.location.pathname !== '/login_register.html') {
      window.location.href = '/login_register.html';  // Перенаправляем на страницу входа
    }
    return;  // Останавливаем дальнейшее выполнение скрипта
  }
});

// Profile
// Загрузка профиля
async function loadProfile() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    console.error('Токен или userId отсутствуют');
    window.location.href = 'login_register.html'; // Перенаправление на страницу входа
    return;
  }

  try {
    const response = await fetch('/api/v1/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка при получении профиля:', errorText);
      if (errorText.includes("<!DOCTYPE html>")) {
        console.error('Сервер возвращает HTML, возможно, ошибка на сервере');
      }
      return;
    }

    const data = await response.json(); // Преобразуем ответ в JSON
    document.getElementById('profile-username').textContent = data.username || '';
    document.getElementById('profile-bio').value = data.bio || '';
    document.getElementById('profile-reg-date').textContent = data.regDate ? new Date(data.regDate).toLocaleDateString() : 'Не указана';
  } catch (err) {
    console.error('Ошибка при получении профиля:', err);
    alert(`Ошибка: ${err.message}`);
  }
}

// Сохранение профиля
async function saveProfile(event) {
  const token = localStorage.getItem('token');
  const bio = document.getElementById('profile-bio').value.trim();
  const button = event.target;

  if (!bio) {
    alert('О поле "О себе" не может быть пустым');
    return;
  }

  button.disabled = true;
  button.textContent = 'Сохраняется...';

  try {
    const res = await fetch('/api/v1/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ bio })
    });

    if (!res.ok) throw new Error('Ошибка при сохранении профиля');
    alert('Профиль обновлён');
    loadProfile();  // Перезагрузим профиль с новыми данными
  } catch (err) {
    alert(err.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Сохранить';
  }
}

// Логика выхода
function logout() {
  // Очищаем данные из localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  
  // Перенаправляем на страницу входа
  window.location.href = 'login_register.html';
}

// Обработчик кнопки "Выйти"
document.getElementById('logout-btn').addEventListener('click', logout);

// Переключение между секциями
function showSection(id) {
  // Скрываем все секции
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  // Показываем выбранную секцию
  document.getElementById(id).classList.add('active');
}

// Загрузка истории заказов
async function loadOrderHistory() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    console.error('Токен или userId отсутствуют');
    return;
  }

  try {
    const res = await fetch(`/api/v1/orders/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Ошибка загрузки заказов:', res.status, text);
      throw new Error('Не удалось загрузить историю заказов');
    }

    const orders = await res.json();

    const container = document.getElementById('orderHistory');
    if (!orders.length) {
      container.innerHTML = '<p>История заказов пуста</p>';
      return;
    }

    container.innerHTML = orders.map(order => `
  <div class="order-item">
    <p><strong>📦 Заказ №${order._id}</strong></p>
    <p><strong>📅 Дата:</strong> ${
      order.date
        ? new Date(order.date).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      : 'Не указана'
    }</p>
    <p><strong>💰 Сумма:</strong> ${order.totalAmount} ₽</p>
    <p><strong>📍 Адрес:</strong> ${order.address}</p>
    <p><strong>📞 Телефон:</strong> ${order.phone}</p>
    <p><strong>💳 Оплата:</strong> ${order.paymentMethod === 'cash' ? 'Наличными' : 'Картой курьеру'}</p>
    <p><strong>💬 Комментарий:</strong> ${order.comments || '—'}</p>
    <ul>
      ${order.items.map(item => `<li>${item.name} — ${item.price} ₽ × ${item.quantity}</li>`).join('')}
    </ul>
  </div>
`).join('');
  } catch (err) {
    console.error('Ошибка загрузки истории заказов:', err);
  }
}

// Инициализация страницы профиля и истории заказов
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    window.location.href = 'login_register.html'; // Перенаправляем на страницу входа
    return;
  }

  loadProfile(); // Загружаем профиль
  loadOrderHistory(); // Загружаем историю заказов

  // Добавляем обработчики на кнопки
  document.getElementById('account-btn').addEventListener('click', () => showSection('account'));
  document.getElementById('orders-btn').addEventListener('click', () => showSection('orders'));
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);

  // Изначально отображаем секцию профиля
  showSection('account');
});
