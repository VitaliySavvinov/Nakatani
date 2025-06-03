import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Получение профиля
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    res.json({
      username: user.username,
      bio: user.bio || '',
      regDate: user.regDate
    });
  } catch (err) {
    console.error('Ошибка загрузки профиля:', err);
    res.status(500).json({ message: 'Ошибка сервера при загрузке профиля' });
  }
});

// Обновление профиля
router.put('/', async (req, res) => {
  try {
    const { bio } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { bio });
    res.json({ message: 'Профиль обновлён' });
  } catch (err) {
    console.error('Ошибка обновления профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
