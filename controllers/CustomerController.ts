import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator';
import { CartItem, CreateCustomerInputs, EditCustomerPrfoileInputs, OrderInputs, UserLoginInputs} from '../dto';
import {GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword} from '../utility';
import { Customer, DeliveryUser, Food, Offer, Order, Transaction, Vandor } from '../models';
import { GetVandorProfile } from './VandorController';



export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const customerInputs = plainToClass(CreateCustomerInputs, req.body);

    const inputErrors = await validate(customerInputs, {validationError: {target: true}});

    if(inputErrors.length > 0){
        return res.status(400).json(inputErrors)
    }
    const {email, phone, password} = customerInputs;

    const salt = await GenerateSalt();
    const userPassword =  await GeneratePassword(password, salt)
    
    const {otp, expiry} = GenerateOtp();

    const existingCustomer = await Customer.findOne({email: email})

    if(existingCustomer !== null){
        return res.status(409).json('An user with provided email exists')
    }
    const result = await Customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: '',
        lastName: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0,
        orders: []
    })

    if(result){
        const signature = await GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })
        return res.status(201).json({ signature: signature, verified: result.verified, email: result.email, otp: otp})
    }
    return res.status(400).json({message: 'Error with Signup'})
    
}


export const CustomerLogin =async (req: Request, res: Response, next: NextFunction) => {
    const loginInputs = plainToClass(UserLoginInputs, req.body);

    const loginErrors = await validate(loginInputs, {validationError: {target: false}});

    if(loginErrors.length > 0){
        return res.status(400).json(loginErrors);
    }
    const {email, password} = loginInputs;
    const user = await Customer.findOne({email: email});
    if(user){
        const validation = await ValidatePassword(password, user.password, user.salt);
        if(validation){
            const signature = await GenerateSignature({
                _id: user._id,
                email: user.email,
                verified: user.verified,
            })

            return res.status(201).json({
                signature: signature,
                verified: user.verified,
                email: user.email
            })
        }
    }
    return res.status(400).json('Login Error');

}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    const {otp} = req.body;
    const user = req.user;
    if(user){
        const profile = await Customer.findById(user._id);
        if(profile){
            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;
                const updatedcustomer = await profile.save();

                const signature = await GenerateSignature({
                    _id: updatedcustomer._id,
                    email: updatedcustomer.email,
                    verified: updatedcustomer.verified
                });
                return res.status(201).json({
                    signature: signature,
                    verified: updatedcustomer.verified,
                    email: updatedcustomer.email
                });
            }
        }
    }
    return res.status(400).json('Error with OTP validation')

}

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user){
        const profile = await Customer.findById(user._id);

        if(profile){
            const { otp, expiry} = GenerateOtp();

            profile.otp = otp;
            profile.otp_expiry = expiry;

            const saved = await profile.save();

            return res.status(200).json(otp);
        }
    }
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user){
        const profile = await Customer.findById(user._id);

        if(profile){
            return res.status(200).json(profile);
        }
    }
    return res.status(400).json('You are unauthorized to view the profile')

}

export const EditCustomerProfile = async (req:Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    const profileInputs = plainToClass(EditCustomerPrfoileInputs, req.body);

    const profileErrors = await validate(profileInputs, {validationError: { target: false}});
    
    if(profileErrors.length > 0){
        return res.status(400).json(profileErrors);
    }
    const {firstName, lastName, address} = profileInputs;

    if(user){
        const profile = await Customer.findById(user._id);

        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const saved = await profile.save();

            return res.status(200).json(saved)

    }
    return res.status(400).json('You are unauthorized to update the profile')
}}

export const AddToCard = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if(user){
        const profile = await Customer.findById(user._id).populate('cart.food');
        if(profile != null){
            let cartItems = Array();

            const {_id, unit} = <CartItem>req.body;
            const  food = await Food.findById(_id);
            if(food){
                cartItems = profile.cart;
                if(cartItems.length > 0){
                    
                    let existingFoodItem = cartItems.filter((item)=> item.food._id.toString() === _id);

                    if(existingFoodItem.length > 0){
                        const index = cartItems.indexOf( existingFoodItem[0]);

                        if(unit > 0) {
                            cartItems[index] = {food : food, unit: unit};
                        }else{
                            cartItems.splice(index, 1);
                        }
                    }else{
                        cartItems.push({food: food, unit: unit})
                    }
                }else{
                    cartItems.push({food: food, unit: unit})
                }
                if(cartItems){
                    
                    const cartresult = await profile.save();
                    return res.status(200).json(cartresult.cart)
                }
            }
        }

    }
    return res.status(400).json({ Message: 'Error with Cart'})
}

export const GetCart = async (req: Request, res: Response, next: NextFunction) =>  {
    const user = req.user;
    if(user){
        const profile = await Customer.findById(user._id).populate('cart.food');
        if(profile){
            return res.status(200).json(profile.cart)
        }
    }
    return res.status(400).json({ Message: 'Cart is empty'})
}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) =>  {
    const user = req.user;
    if(user){
        const profile = await Customer.findById(user._id);
        if(profile){
            profile.cart = [] as any;
            const result = await profile.save();
            if(result){
                return res.status(200).json(result);
            }
        }
    }
    return res.status(400).json({ Message: 'Cart is aleady empty'})
}

const assignOrderForDelivery = async ( orderId: string, vandorId: string) => {

    const vandor = await Vandor.findById(vandorId);

    if(vandor){
        const areaCode = vandor.pincode;
        const vandorLat = vandor.lat;
        const vandorLng = vandor.lng;

        const deliverPerson = await DeliveryUser.find({pincode: areaCode, verified: true, isAvailable: true})
        // console.log()
        // console.log("areaCode", areaCode)
        console.log("deliverPerson", deliverPerson)

        if(deliverPerson.length > 0){

            const order = await Order.findById(orderId)

            if(order){

                order.deliveryId = deliverPerson[0]._id;
                
                const result = await order.save()

                console.log(result)
            }
        }
    }
}

export const CreatePayment =async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const {amount, paymentMode, offerId} = req.body;

    let payableAmount = Number(amount);

    if(offerId){
        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer){
            if(appliedOffer.isActive){
                payableAmount = (payableAmount - appliedOffer.offerAmount);
            }
        }
    }
    if(user){
        const transaction = await Transaction.create({
            customer: user._id,
            vandorId: '',
            orderId: '',
            orderValue: payableAmount,
            offerUsed: offerId || 'NA',
            status: 'OPEN',
            paymentMode: paymentMode,
            paymentResponse: 'Payment is on Delivery'
        })
        return res.status(200).json(transaction);
    }
    
}

const ValidateTransaction = async (txnId: string) => {
    const currentTransaction  = await Transaction.findById(txnId);

    if(currentTransaction){
        if(currentTransaction.status.toLowerCase() !== "failed"){
            return {status: true, currentTransaction};
        }

    }
    return {status: false, currentTransaction};
}


export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const { txnId, amount, items} = <OrderInputs>req.body

    if(user){

        const { status, currentTransaction} = await ValidateTransaction(txnId);

        
        const profile = await Customer.findById(user._id);
        if(profile){

            if(!status){
                return res.status(404).json({message: 'Error with Create order'})
            }

            const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;


            let cartItems = Array();

            let netAmount = 0.0;

            let vandorId = '';

            const foodIds = items.map(item => item._id);
            const foods = await Food.find({ '_id': { '$in': foodIds } });
            foods.map(food => {

                items.map(({ _id, unit}) => {
                    if(food._id == _id) {
                        vandorId = food.vandorId;
                        netAmount += (food.price * unit);
                        cartItems.push({food, unit});
                    }
                })
            })

            
            if(cartItems){

                // console.log("CART ITEMS ", cartItems)
                const currentOrder = await Order.create({
                    orderID: orderId,
                    vandorID: vandorId,
                    items: cartItems,
                    totalAmount: netAmount,
                    paidAmount: amount,
                    orderDate: new Date(),
                    orderStatus: 'Waiting',
                    remarks: '',
                    delivereyId: '',
                    readyTime: 45,
                })
                if(currentOrder){
                    // console.log("VENDOR ID  ", vandorId)
                    // console.log("currentOrder._id ", currentOrder._id)
                    profile.cart = [] as any;
                    profile.orders.push(currentOrder);

                    if(currentTransaction){
                        currentTransaction.vandorId = vandorId;
                        currentTransaction.orderId = orderId;
                        currentTransaction.status ='CONFIRMED';
    
                        await currentTransaction.save();

                        assignOrderForDelivery(currentOrder._id, vandorId)
                
                    }

                    const result = await profile.save()

                    return res.status(200).json(currentOrder);
                }}
        }
        
    }
    return res.status(400).json({ Message: 'Error with Create Order'})
}


export const GetOrders =async (req: Request, res: Response, next: NextFunction) => {
    const user =  req.user;
    if(user){
        const profile = await Customer.findById(user._id).populate('orders');
        if (profile){
            return res.status(200).json(profile.orders)
        }
    }
    return res.status(400).json({ Message: 'Error with Getting Orders'})
}

export const GetOrderById = async (req:Request, res: Response, next: NextFunction) => {
    const order_id =  req.params.id;
    if(order_id){
        const order = await Order.findById(order_id).populate('items.food');
        if(order){
            return res.status(200).json(order);
        }
    }
    return res.status(400).json({ Message: 'Error with Getting Order'})
}

export const VerifyOffer =async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const offerId = req.params.id;

    if(user){
        const appliedOffer = await Offer.findById(offerId);
        if(appliedOffer){
            if(appliedOffer.promoType === 'USER'){

            }else{
                if(appliedOffer.isActive){
                    return res.status(200).json({message: 'Offer is valid', offer: appliedOffer})
                }
            }
        }
    }
    return res.status(400).json({ Message: 'Offer is invalid'});
}

