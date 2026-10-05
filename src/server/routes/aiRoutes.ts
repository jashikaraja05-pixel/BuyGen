import { Router } from 'express';
import { aiService } from '../services/aiService.ts';

export const aiRouter = Router();

aiRouter.post('/advisor', async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Please enter your electronics requirements.' });
    }

    const advice = await aiService.askTechAdvisor(prompt);
    res.json(advice);
  } catch (err) {
    next(err);
  }
});

aiRouter.post('/compare', async (req, res, next) => {
  try {
    const { productIds } = req.body;
    const comparison = await aiService.compareProducts(productIds);
    res.json(comparison);
  } catch (err) {
    next(err);
  }
});

aiRouter.post('/search', async (req, res, next) => {
  try {
    const { query } = req.body;
    const searchResult = await aiService.smartSearch(query);
    res.json(searchResult);
  } catch (err) {
    next(err);
  }
});
