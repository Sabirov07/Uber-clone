import express, {Request, Response, NextFunction} from 'express';
import { AddToCard, CreateOrder, CreatePayment, CustomerLogin, CustomerSignUp, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderById, GetOrders, RequestOtp, VerifyOffer } from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();

router.post('/signup', CustomerSignUp)

router.post('/login', CustomerLogin)

router.use(Authenticate)
router.patch('/verify', CustomerVerify)

router.get('/otp', RequestOtp)

router.get('/profile', GetCustomerProfile)

router.patch('/profile', EditCustomerProfile)

// CART
router.post('/cart', AddToCard);
router.get('/cart', GetCart);
router.delete('/cart', DeleteCart);

// OFFER
router.get('/offer/verify/:id', VerifyOffer);

// PAYMENT
router.post('/create-payment', CreatePayment);

// ORDER
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders);
router.get('/order/:id', GetOrderById);


export {router as CustomerRoute}