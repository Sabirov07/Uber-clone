import express, {Request, Response, NextFunction} from 'express';
import { Vandor, FoodDoc, Offer } from '../models';

export const GetFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const result = await Vandor.find({pincode: pincode, serviceAvailable: false})
    .sort([['rating', 'descending']])
    .populate("foods")
    if(result.length > 0) {
        return res.status(200).json(result)
    }
    return res.status(400).json({ message: "Data Not found"})
}
export const GetTopRestaurants = async (req: Request, res: Response, next: NextFunction) =>{
    const pincode = req.params.pincode;
    const result = await Vandor.find({pincode: pincode, serviceAvailable: false})
    .sort([['rating', 'descending']])
    // .limit(['10'])

    if(result.length > 0){
    return res.status(200).json(result)
    }
    return res.status(400).json({ message: "Data Not found"})
}

export const GetFoodsIn30min = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const vandors = await Vandor.find({pincode: pincode, serviceAvailable: false})
    .populate('foods')
    console.log('foods in 30 min')
    if(vandors.length > 0){
        let foodResult: any = [];

        vandors.map(vandor => {
            const foods = vandor.foods as [FoodDoc]
            foodResult.push(...foods.filter(food => food.readyTime <= 30));
        })
        if(foodResult.length > 0){
            return res.status(200).json(foodResult);
        }else{
            return res.status(400).json({ message: "No fast food in this area"})
        }
        
    }
    return res.status(400).json({ message: "Data Not found"})
}

export const SearchFoods = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const vandors = await Vandor.find({pincode: pincode, serviceAvailable: false})
    .populate('foods')

    if(vandors.length > 0){
        let foodResult: any = [];

        vandors.map(vandor => {
            const foods = vandor.foods as [FoodDoc];
            foodResult.push(...foods)
        })
        return res.status(200).json(foodResult)
    }
    return res.status(400).json({ message: "Data Not found"})
}

export const RestaurantById = async (req: Request, res: Response, next: NextFunction) =>{
    const id = req.params.id;
    const result = await Vandor.findById(id).populate('foods')
    if(result){
        return res.status(200).json(result);
    }
    return res.status(400).json({ message: "Data Not found"})
}

export const GetAvailableOffers = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;

    const offers = await Offer.find({pincode: pincode, isActive: true});
    if(offers) {
        return res.status(200).json(offers);

    }
    return res.status(400).json({message: 'Offers not found'});
}

