import { Subscriber } from '../models/Subscriber.js';
import { logger } from '../utils/logger.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, whatsapp, examCategories } = req.body;
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const categoriesArray = Array.isArray(examCategories) ? examCategories : [];

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      existing.status = 'active';
      if (whatsapp) existing.whatsapp = whatsapp;
      if (categoriesArray.length > 0) existing.examCategories = categoriesArray;
      await existing.save();
      return res.json({ message: 'Exam alert preferences updated successfully! 🎉' });
    }

    await Subscriber.create({
      email,
      whatsapp: whatsapp || '',
      examCategories: categoriesArray,
    });
    logger.info('New subscriber created', { email, examCategories: categoriesArray });
    
    res.status(201).json({ message: 'Successfully subscribed to targeted exam alerts!' });
  } catch (error) {
    logger.error('Subscription error', { error: error.message });
    res.status(500).json({ message: 'Failed to subscribe. Please try again later.' });
  }
};
