import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Получаем токен из заголовка

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Проверка токена
    req.user = decoded;  // Добавляем декодированные данные пользователя в запрос
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

export default authMiddleware;
