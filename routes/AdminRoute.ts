import express, {Request, Response, NextFunction} from 'express';
import { CreateVandor, GetDeliveryUsers, GetTransactionByID, GetTransactions, GetVandorByID, GetVandors, VerifyDeliveryUser } from '../controllers';

const router = express.Router();

router.post('/vandor', CreateVandor);

router.get('/vandors', GetVandors);

router.get('/vandor/:id', GetVandorByID);

router.get('/transactions', GetTransactions);

router.get('/transaction/:id', GetTransactionByID);

router.get('/delivery/users', GetDeliveryUsers);

router.put('/delivery/verify', VerifyDeliveryUser);

export {router as AdminRoute}