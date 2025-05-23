import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [CartItemSchema]
});

export default mongoose.model('Cart', CartSchema);
