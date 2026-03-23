import { Subscriber } from '../models/Subscriber.js';
import { logger } from '../utils/logger.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        await existing.save();
        return res.json({ message: 'Welcome back! You have been re-subscribed.' });
      }
      return res.status(400).json({ message: 'Email is already subscribed' });
    }

    await Subscriber.create({ email });
    logger.info('New newsletter subscriber', { email });
    
    res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    logger.error('Subscription error', { error: error.message });
    res.status(500).json({ message: 'Failed to subscribe. Please try again later.' });
  }
};
