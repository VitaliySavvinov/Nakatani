// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ name: String, price: Number, quantity: Number }],
  totalAmount: { type: Number, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  comments: { type: String },
  paymentMethod: { type: String, required: true },
  date: { type: Date, default: Date.now } // ✅ добавляем дату
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;  // Экспортируем модель по умолчанию
