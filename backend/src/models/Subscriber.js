import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  whatsapp: {
    type: String,
    trim: true,
    default: ''
  },
  examCategories: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

export const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
