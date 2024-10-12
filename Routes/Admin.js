const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount, currency, receipt } = req.body;

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amount, // Amount in paisa (INR * 100)
    currency: currency,
    receipt: receipt,
  };

  try {
    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating order' });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;
