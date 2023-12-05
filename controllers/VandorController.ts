import { Request, Response, NextFunction } from "express";
import { CreateOfferInputs, EditVandorInput, LoginVandorInput } from "../dto";
import { Vandor, Food, Order, Offer } from "../models";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from "../utility";
import { FindVandor } from "./AdminController";
import { CreateFoodInputs } from "../dto/Food.dto";
import { RestaurantById } from "./ShoppingController";



export const VandorLogin = async (req: Request, res:Response, next:NextFunction) => {
    
    const {email, password} = <LoginVandorInput>req.body

    const existingVandor = await FindVandor('', email)

    if(existingVandor !== null){
        const validation = await ValidatePassword(password, existingVandor.password, existingVandor.salt)

        if(validation){
            const signature = await GenerateSignature({
                _id: existingVandor.id,
                email: existingVandor.email,
                name: existingVandor.name,
                foodTypes: existingVandor.foodType
            })
            console.log("Logged in giving signature")
            // console.log(signature)
            return res.json(signature)
        }else{
            return res.json("Password is not valid")
        }
    }
    return res.json({"message": "Login credential is not valid"})
}

export const GetVandorProfile = async (req:Request, res:Response, next:NextFunction) => {
    const user = req.user;
    if(user){
        const existingVandor = await FindVandor(user._id)
        return res.json(existingVandor)
    }
    console.log("user", user)
    return res.json({"message": "Vandor info not found"})
}

export const UpdateVandorProfile = async (req:Request, res:Response, next: NextFunction) => {
    const {foodType, name, address, phone} = <EditVandorInput>req.body

    const user = req.user;
    if(user){
        const existingVandor = await FindVandor(user._id)
        if(existingVandor !== null){
            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.foodType = foodType;
            existingVandor.phone = phone;
            const savedResult = await existingVandor.save()
            return res.json(savedResult)
        }
    }
    return res.json({"message": "Vandor info not found"})
}

export const UpdateVandorImage = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if(user){
        const files = req.files as [Express.Multer.File]
        const images = files.map((file: Express.Multer.File) => file.filename)
        const found_vandor = await FindVandor(user._id)
        if(found_vandor !== null){
            found_vandor.coverImages.push(...images);
            const result = await found_vandor.save();
            return res.json(result);
        }
    }
    return res.json({"message": "Vandor image issue"})
}

export const UpdateVandorService = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const {lat, lng} = req.body;

    if(user){
        const existingVandor = await FindVandor(user._id)
        if(existingVandor !== null){
            existingVandor.serviceAvailable = !existingVandor.serviceAvailable;

            if(lat && lng){
                existingVandor.lat = lat;
                existingVandor.lng = lng;
            }
            const savedResult = await existingVandor.save();
            return res.json(savedResult);
        }
    }
    return res.json({"message": "Vandor info not found"})
}

export const CreateFood =async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if(user){
        const {name, description, category, foodType, readyTime, price} = <CreateFoodInputs>req.body;
        const existingVandor = await FindVandor(user._id)
        if(existingVandor !== null){

            const files = req.files as [Express.Multer.File]
            const images = files.map((file: Express.Multer.File) => file.filename)
            const createdFood = await Food.create({
                vandorId: existingVandor.id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                readyTime: readyTime,
                price: price,
                images: images,
                rating: 0
            })
            existingVandor.foods.push(createdFood)
            const result = await existingVandor.save();
            return res.json(result)
        }
    }
    return res.json({"message": "Something went wrong with food adding"})
}

export const GetFoods =async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if(user){
        const foods = await Food.find({vandorId: user._id}) 
        if (foods !== null){
            return res.json(foods)
        }
        return res.json("No Food options")
    }
}

export const GetCurrentOrders =async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if(user){
        const orders = await  Order.find({vandorID: user._id}).populate('items.food');
        if(orders != null){
            return res.status(200).json(orders)
        }
    }
    return res.json({"message": "something wrong with GetCurrentOrders"})
}

export const GetOrderDetails =async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    if(orderId){
        const order = await Order.findById(orderId).populate('items.food');
        if(order){
            return res.status(200).json(order);
        }
    }
    return res.json({"message": "something wrong with GetOrderDetails"})
}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    if(orderId){
        const {status, remarks, time} = req.body;
        const order = await Order.findById(orderId);
        if(order){
            order.orderStatus = status;
            order.remarks =remarks;
            if(time){
                order.readyTime = time;
            }

            const result= await order.save();
            if(result !== null){
                return res.status(200).json(result)
            }

        }
    }
    return res.status(400).json({ Message: 'Error with ProcessOrder'})
}

export const Getoffers = async (req: Request, res: Response, next:  NextFunction) => {
    const user = req.user;
    if(user){
        const offers = await Offer.find().populate('vandors');

        let currentOffers = Array();
        if(offers){
            offers.map(offer => {
                if(offer.vandors){
                    offer.vandors.map(vandor => {

                        if(vandor._id.toString() === user._id){
                            currentOffers.push(offer);
                        }
                    })
                }
                if(offer.offerType === 'GENERIC'){
                    currentOffers.push(offer);
                }
            })
        }
        return res.status(200).json(currentOffers);
        
    }
    return res.status(400).json({ Message: 'Unable to get Offers, or no offers available'})
}

export const AddOffer = async ( req: Request, res: Response, next:   NextFunction) => {
    const user = req.user;
    if(user){
        const {offerType, title, description, minValue, offerAmount, startValidity,
        endValidity, promocode, promoType, bank, bins, pincode, isActive} = <CreateOfferInputs>req.body;

        const vandor = await FindVandor(user._id);
        if(vandor){
            const offer = await Offer.create({
                offerType,
                title, 
                description, 
                minValue, 
                offerAmount, 
                startValidity,
                endValidity, 
                promocode, 
                promoType, 
                bank, 
                bins, 
                pincode, 
                isActive,
                vandors: [vandor]
            })
            if(offer){
                console.log(offer);
                return res.status(200).json(offer);
            }
        }
    }
    return res.status(400).json({ Message: 'Unable to create Offer'})
}

export const EditOffer = async ( req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const offerId = req.params.id;

    if(user){
        const {offerType, title, description, minValue, offerAmount, startValidity,
            endValidity, promocode, promoType, bank, bins, pincode, isActive} = <CreateOfferInputs>req.body;
        
        const currentOffer = await Offer.findById(offerId);

        if(currentOffer){
            const vandor = await Vandor.findById(user._id);
            if(vandor) {
                currentOffer.offerType = offerType, 
                currentOffer.title = title, 
                currentOffer.description = description, 
                currentOffer.minValue = minValue, 
                currentOffer.offerAmount = offerAmount, 
                currentOffer.startValidity = startValidity,
                currentOffer.endValidity = endValidity, 
                currentOffer.promocode = promocode, 
                currentOffer.promoType = promoType, 
                currentOffer.bank = bank, 
                currentOffer.bins = bins, 
                currentOffer.pincode = pincode, 
                currentOffer.isActive = isActive

                const result = await currentOffer.save();
                return res.status(200).json(result)
            } 
        }

    }
    return res.status(400).json({message: "Error with editing Offer"})
}
