const express = require('express')
const router = express()
const Razorpay = require('razorpay')
const crypto = require('crypto')
require('dotenv').config()
const Payment = require('./../Models/Payment')
const Order  = require('./../Models/Order')
const Auth = require('./../Middleware/Auth')

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
})

router.post('/order', Auth, async(req, resp)=> {
    const { amount, ItemsCart } = req.body; // Assuming ItemsCart is the array of PDFs
    const userId = req.user;

    try {
        const options = {
            amount: Number(amount * 100), // Amount in paise (for INR)
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex") // Unique receipt
        };

        // Create Razorpay order
        razorpayInstance.orders.create(options, async (error, order) => {
            if (error) {
                console.log('error', error);
                return resp.status(500).json({ message: 'Something went wrong' });
            }

            // Save order to the database
            const newOrder = new Order({
                user: userId, // Assuming the user is authenticated
                amount: amount, // Amount in rupees
                pdfs: ItemsCart, // ItemsCart should be an array of PDF names
                razorpay_order_id: order.id,
                status: 'pending', // Set initial status as pending
            });

            await newOrder.save(); // Save the order in MongoDB

            resp.status(200).json({ data: order });
            console.log('order', order);
        });
    } catch (error) {
        resp.status(500).json({ message: 'Internal Server Error' });
        console.log('error', error);
    }
});



router.post('/verify', async (req, resp) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    console.log('req.body', req.body);
    try {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
  
      const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(sign.toString())
        .digest("hex");
  
      const isAuthentic = expectedSign === razorpay_signature;
  
      if (isAuthentic) {
        const order = await Order.findOne({ razorpay_order_id });

        if (!order) {
          return resp.status(404).json({ message: 'Order not found' });
        }
        const payment = new Payment({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });
        await order.save();
  
        await payment.save();
  
        return resp.json({ message: 'Payment Successfully' });
      } else {
        return resp.status(400).json({ message: 'Payment verification failed' });
      }
    } catch (error) {
      resp.status(500).json({ message: "Internal Server Error" });
      console.log('error', error);
    }
  });
  
  router.get('/getAllOrders', async(req, resp)=> {
    try{
        const AllOrders = await Order.find();
        resp.status(200).json({status: true, message: 'sucessfully get it', order: AllOrders})
    }
    catch(error){
        resp.status(400).json({status: false, message: 'error in getting orders'})
    }
  })

module.exports = router