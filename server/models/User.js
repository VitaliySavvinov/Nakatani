import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Используем ObjectId как идентификатор
    required: true,  // Это поле теперь обязательно
    unique: true,    // Уникальность userId для каждого пользователя
    auto: true,      // MongoDB будет автоматически генерировать уникальные значения для этого поля
  },
  username: {
    type: String,
    required: true,
    unique: true,  // Уникальность для каждого пользователя
    trim: true,
    lowercase: true,
  },
  password: { 
    type: String, 
    required: true 
  },
  bio: { 
    type: String 
  },
  regDate: { 
    type: Date, 
    default: Date.now 
  },
});

// Индекс для ускоренного поиска по полю username
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

export default User;
