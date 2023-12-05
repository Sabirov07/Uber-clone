
import express, {Request, Response, NextFunction} from 'express';
import { GetAvailableOffers, GetFoodAvailability, GetFoodsIn30min, GetTopRestaurants, RestaurantById, SearchFoods } from '../controllers';

const router = express.Router();

router.get('/:pincode', GetFoodAvailability)

router.get('/top-restaurants/:pincode', GetTopRestaurants)

router.get('/foods-in-30min/:pincode', GetFoodsIn30min)

router.get('/search/:pincode', SearchFoods)

router.get('/offers/:pincode', GetAvailableOffers)

router.get('/restaurant/:id', RestaurantById)



router.get('/')

export {router as ShoppingRoute}