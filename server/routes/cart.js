import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Получить корзину для текущего пользователя
router.get('/:userId', authMiddleware, async (req, res) => {
  const userId = req.params.userId;
  console.log('Получен запрос корзины для userId:', userId);

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log('Корзина не найдена, создаем новую');
      cart = new Cart({
        userId,
        items: []
      });
      await cart.save();
    }

    console.log('Корзина загружена:', cart);
    res.json({ items: cart.items });  // Возвращаем элементы корзины
  } catch (err) {
    console.error('Ошибка при получении корзины:', err);
    res.status(500).json({ message: 'Ошибка при получении корзины' });
  }
});

// Добавить товар в корзину
router.post('/add-item', authMiddleware, async (req, res) => {
  const { id, name, price, quantity } = req.body;
  const userId = req.user.userId;

  if (!id || !name || !price || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Не все обязательные данные переданы' });
  }

  const productId = new mongoose.Types.ObjectId(id);

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, name, price, quantity }]
      });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId.toString());

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, name, price, quantity });
      }
    }

    await cart.save();
    console.log(`Товар ${name} добавлен в корзину для пользователя ${userId}`);

    res.status(200).json(cart);
  } catch (error) {
    console.error('Ошибка при добавлении товара в корзину:', error);
    res.status(500).json({ message: 'Ошибка при добавлении товара в корзину' });
  }
});

// Обновить количество товара в корзине
router.put('/update-item', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Некорректные данные' });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена' });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId.toString());

    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      return res.status(404).json({ message: 'Товар не найден в корзине' });
    }

    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    console.error('Ошибка при обновлении количества товара:', error);
    return res.status(500).json({ message: 'Ошибка при обновлении количества товара' });
  }
});

// Удалить товар из корзины
router.delete('/remove-item', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.body;

  if (!productId) return res.status(400).json({ message: 'Не передан productId товара' });

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена', items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
    if (itemIndex !== -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      res.json({ items: cart.items });
    } else {
      res.status(404).json({ message: 'Товар не найден в корзине' });
    }
  } catch (err) {
    console.error('Ошибка при удалении товара:', err);
    res.status(500).json({ message: 'Ошибка при удалении товара' });
  }
});

// Очистить всю корзину
router.delete('/clear', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена' });
    }

    cart.items = []; // очищаем все товары
    await cart.save();

    res.status(200).json({ message: 'Корзина успешно очищена' });
  } catch (err) {
    console.error('Ошибка при очистке корзины:', err);
    res.status(500).json({ message: 'Ошибка при очистке корзины' });
  }
});

export default router;
