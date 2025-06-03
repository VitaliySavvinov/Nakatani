import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Ссылка на модель User
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Ссылка на модель Product
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: [1, 'Количество товара должно быть больше или равно 1'],
      },
    },
  ],
});

// Индекс для быстрого поиска по userId и productId
cartSchema.index({ userId: 1, 'items.productId': 1 });

// Метод для добавления товара в корзину
cartSchema.methods.addItemToCart = function(productId, name, price, quantity) {
  const existingItemIndex = this.items.findIndex(item => item.productId.toString() === productId.toString());

  if (existingItemIndex >= 0) {
    // Если товар уже есть в корзине, увеличиваем его количество
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Если товара нет, добавляем новый
    this.items.push({ productId, name, price, quantity });
  }
  return this.save();
};

// Метод для обновления количества товара в корзине
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const existingItemIndex = this.items.findIndex(item => item.productId.toString() === productId.toString());

  if (existingItemIndex >= 0) {
    // Обновляем количество товара
    this.items[existingItemIndex].quantity = quantity;
    return this.save();
  }
  return Promise.reject(new Error('Товар не найден в корзине'));
};

// Метод для удаления товара из корзины
cartSchema.methods.removeItemFromCart = function(productId) {
  const updatedItems = this.items.filter(item => item.productId.toString() !== productId.toString());

  if (updatedItems.length === this.items.length) {
    return Promise.reject(new Error('Товар не найден в корзине'));
  }

  this.items = updatedItems;
  return this.save();
};

// Создание индекса для улучшения производительности поиска
cartSchema.index({ userId: 1, 'items.productId': 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
