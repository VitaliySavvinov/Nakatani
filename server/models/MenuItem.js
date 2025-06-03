const mongoose = require('mongoose');

const id = '683c901fb0b34bf210a1d1c9'; // Ваш ID

// Проверка, что ID имеет правильный формат
if (!mongoose.Types.ObjectId.isValid(id)) {
  throw new Error('Некорректный формат ID');
}

const productId = new mongoose.Types.ObjectId(id);
