import express from 'express';
import Order from '../models/Order.js'; // Убедитесь, что используете правильный путь и расширение

const router = express.Router();

// Получение всех заказов пользователя
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    console.error('Ошибка при получении заказов:', err);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
});

// Создание нового заказа
router.post('/create', async (req, res) => {
  const { userId, items, totalAmount, phone, address, comments, paymentMethod } = req.body;

  // Проверяем обязательные поля
  if (!userId || !items || !items.length || !totalAmount || !phone || !address || !paymentMethod) {
    console.error('Не все обязательные поля переданы');
    return res.status(400).json({ message: 'Не все обязательные данные переданы' });
  }

  try {
    // Создаем новый заказ
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      phone,
      address,
      comments,
      paymentMethod,
      date: new Date() // добавляем дату заказа
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('Ошибка при сохранении заказа:', err);
    res.status(500).json({ message: 'Ошибка при сохранении заказа' });
  }
});

export default router;
