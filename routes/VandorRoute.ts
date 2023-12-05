import express, {Request, Response, NextFunction} from 'express';
import {GetVandorByID, GetVandorProfile, UpdateVandorProfile, UpdateVandorService, VandorLogin, CreateFood, GetFoods, UpdateVandorImage, ProcessOrder, GetOrderDetails, GetCurrentOrders, Getoffers, AddOffer, EditOffer} from  '../controllers'
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images')
    },
    filename: function(req, file, cb) {
        const date = new Date().toISOString().replace(/:/g, '-');
        cb(null, date + '_' + file.originalname);
    }
    
})
const images = multer({storage: imageStorage}).array('images', 10)

router.post('/login', VandorLogin)

router.use(Authenticate)
router.get('/profile', GetVandorProfile)
router.patch('/profile', UpdateVandorProfile)
router.patch('/service', UpdateVandorService)
router.patch('/coverimage', images, UpdateVandorImage)

router.post('/food', images, CreateFood)
router.get('/foods', GetFoods)

router.get('/orders', GetCurrentOrders);
router.put('/order/:id/process', ProcessOrder);
router.get('/order/:id', GetOrderDetails);

router.get('/offers', Getoffers);
router.post('/offer', AddOffer);
router.put('/offer/:id', EditOffer);


router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json('Hello from Vandor')
})

export { router as VandorRoute}