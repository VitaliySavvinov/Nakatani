import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

const router = express.Router();

router.post('/order', async (req, res) => {
  const { userId, items, total, address, phone, comments, paymentMethod } = req.body;
  try {
    const order = new Order({
      userId,
      items,
      total,
      address,
      phone,
      comments,
      paymentMethod
    });
    await order.save();

    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ message: 'Заказ оформлен', order });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка оформления заказа', error: err.message });
  }
});

router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения заказов', error: err.message });
  }
});

export default router;
