import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Замените на вашу модель пользователя
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Проверка наличия JWT_SECRET
if (!process.env.JWT_SECRET) {
  throw new Error('❌ JWT_SECRET не определен в .env файле');
}

// Регистрация
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Проверка на пустые поля
  if (!username || !password) {
    return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
  }

  try {
    // Проверка существующего пользователя
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создание нового пользователя
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      userId: newUser._id.toString(), // Преобразуем _id в строку
      username: newUser.username,
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({
      message: 'Ошибка сервера при регистрации',
      error: err.message,
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Проверка на пустые поля
  if (!username || !password) {
    return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      token,
      userId: user._id.toString(),  // Используем userId для ответа
      username: user.username,
      bio: user.bio || '',
      regDate: user.regDate,
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({
      message: 'Ошибка сервера при входе',
      error: err.message,
    });
  }
});

export default router;
