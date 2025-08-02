import express from 'express';
import Stripe from 'stripe';
import Fee from '../models/fee.model.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook',express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      try {
        const fee = await Fee.findOne({ stripeSessionId: session.id });
        if (fee) {
          fee.status = 'paid';
          fee.paymentDate = new Date();
          await fee.save();
        } else {
          console.warn('Fee not found for session:', session.id);
        }
      } catch (error) {
        console.error('Error updating fee:', error);
      }
    }

    res.json({ received: true });
  }
);

export default router;