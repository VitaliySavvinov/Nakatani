import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  address: String,
  phone: String,
  comments: String,
  paymentMethod: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Order', OrderSchema);
