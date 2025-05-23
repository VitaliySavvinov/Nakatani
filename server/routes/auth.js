import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Пользователь уже существует' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email });
    await user.save();

    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка регистрации', error: err.message });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Неверный пароль' });

    res.json({ message: 'Вход выполнен', userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка входа', error: err.message });
  }
});

export default router;
