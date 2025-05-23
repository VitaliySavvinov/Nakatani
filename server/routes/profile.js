import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения профиля', error: err.message });
  }
});

router.put('/profile/:id', async (req, res) => {
  const { email, bio } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { email, bio },
        { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления профиля', error: err.message });
  }
});

export default router;
