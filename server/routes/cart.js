import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

router.get('/cart/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        res.json(cart || { items: [] });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка получения корзины', error: err.message });
    }
});

router.post('/cart/:userId', async (req, res) => {
    const { items } = req.body;
    try {
        let cart = await Cart.findOne({ userId: req.params.userId });
        if (cart) {
            cart.items = items;
        } else {
            cart = new Cart({ userId: req.params.userId, items });
        }
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка обновления корзины', error: err.message });
    }
});

export default router;
