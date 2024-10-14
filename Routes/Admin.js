const express = require('express')
const router = express()
const Razorpay = require('razorpay')
const crypto = require('crypto')
require('dotenv').config()
const Payment = require('./../Models/Payment')

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
})

router.post('/order', (req, resp)=> {
    const {amount} = req.body

    try{
        const options = {
            amount: Number(amount * 100),
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex")
        }

        razorpayInstance.orders.create(options,  (error, order)=> {
            if(error){
                console.log('error', error)
                return resp.status(500).json({message: 'Something went wrong'});
            }
            resp.status(200).json({data: order})
            console.log('order', order)
        })
    }
    catch(error){
        resp.status(500).json({message: 'Internal Server Error'})
        console.log('error', error)
    }
})


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
        const payment = new Payment({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });
  
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
  

module.exports = router