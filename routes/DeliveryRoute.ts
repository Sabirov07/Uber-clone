import express, {Request, Response, NextFunction} from 'express';
import { Authenticate } from '../middlewares';
import { DeliveryUserLogin, DeliveryUserSignUp, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus} from '../controllers';

const router = express.Router();

router.post('/signup', DeliveryUserSignUp)

router.post('/login', DeliveryUserLogin)

router.use(Authenticate)

router.put('/change-status', UpdateDeliveryUserStatus);

router.get('/profile', GetDeliveryUserProfile)

router.patch('/profile', EditDeliveryUserProfile)

export {router as DeliveryRoute}