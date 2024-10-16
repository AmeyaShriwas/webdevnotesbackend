const AdminServices = require('../Services/AdminServices');
const Order = require('../Models/Order');
const Payment = require('../Models/Payment');

const createOrder = async (req, resp) => {
    const { amount, ItemsCart } = req.body; // Assuming ItemsCart is an array of PDFs
    const userId = req.user;

    try {
        const order = await AdminServices.createRazorpayOrder(amount);
        
        const newOrder = new Order({
            user: userId,
            amount: amount, // Amount in rupees
            pdfs: ItemsCart,
            razorpay_order_id: order.id,
            status: 'pending',
        });

        await newOrder.save(); // Save order in database
        resp.status(200).json({ data: order });
    } catch (error) {
        console.log('error', error);
        resp.status(500).json({ message: 'Internal Server Error' });
    }
};

const verifyPayment = async (req, resp) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const isAuthentic = AdminServices.verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

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

            order.razorpay_payment_id = razorpay_payment_id;
            order.razorpay_signature = razorpay_signature;
            order.status = 'success';

            await order.save();
            await payment.save();

            return resp.json({ message: 'Payment Successfully' });
        } else {
            return resp.status(400).json({ message: 'Payment verification failed' });
        }
    } catch (error) {
        console.log('error', error);
        resp.status(500).json({ message: 'Internal Server Error' });
    }
};

const getAllOrders = async (req, resp) => {
    try {
        const AllOrders = await Order.find();
        resp.status(200).json({ status: true, message: 'Successfully retrieved orders', orders: AllOrders });
    } catch (error) {
        resp.status(400).json({ status: false, message: 'Error retrieving orders' });
    }
};

const AdminAccessController = async (req, resp) => {
    const userId = req.user; // Use the user ID extracted from the token
    console.log('id', userId)
    try {
        const accessGranted = await AdminServices.AdminGrantAccessService(userId);
        if (accessGranted.status) {
            resp.status(200).json({ status: true, message: 'Admin access granted to user', id: accessGranted.id });
        } else {
            resp.status(400).json({ status: false, message: accessGranted.message || 'Error in granting access' });
        }
    } catch (error) {
        resp.status(500).json({ status: false, message: 'Internal server error' });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getAllOrders,
    AdminAccessController
};
