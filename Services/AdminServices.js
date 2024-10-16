const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../Models/ContactUsModel');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

const createRazorpayOrder = async (amount) => {
    const options = {
        amount: Number(amount * 100), // Convert to paise
        currency: "INR",
        receipt: crypto.randomBytes(10).toString("hex"),
    };

    return new Promise((resolve, reject) => {
        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log('Razorpay order creation error:', error);
                return reject(error);
            }
            resolve(order);
        });
    });
};

const verifyRazorpaySignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(sign.toString())
        .digest("hex");

    return expectedSign === razorpay_signature;
};

const AdminGrantAccessService = async (userId) => {
    console.log('id', userId)
    try {
        const findUser = await User.findById(userId);  // Directly passing the userId
        if (findUser) {
            findUser.role = 'admin';
            await findUser.save();
            return { status: true, message: 'User role updated to admin' };
        } else {
            return { status: false, message: 'Failed to find user' };
        }
    } catch (error) {
        return { status: false, message: 'Internal server error' };
    }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpaySignature,
    AdminGrantAccessService
};
