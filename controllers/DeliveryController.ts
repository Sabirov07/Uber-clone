import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator';
import { CreateDeliveryUserInputs, EditCustomerPrfoileInputs, OrderInputs, UserLoginInputs} from '../dto';
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword} from '../utility';
import { Customer, DeliveryUser, Food, Offer, Order, Transaction, Vandor } from '../models';
import { GetVandorProfile } from './VandorController';



export const DeliveryUserSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const DeliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);

    const inputErrors = await validate(DeliveryUserInputs, {validationError: {target: true}});

    if(inputErrors.length > 0){
        return res.status(400).json(inputErrors)
    }
    const {email, phone, password, address, firstName, lastName, pincode} = DeliveryUserInputs;

    const salt = await GenerateSalt();
    const userPassword =  await GeneratePassword(password, salt)
    


    const existingDeliveryUser = await DeliveryUser.findOne({email: email})

    if(existingDeliveryUser !== null){
        return res.status(409).json('A Delivery User with provided email exists')
    }
    const result = await DeliveryUser.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        address: address,
        verified: false,
        pincode: pincode,
        lat: 0,
        lng: 0,
        isAvailable: true,
    })

    if(result){
        const signature = await GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })
        return res.status(201).json({ signature: signature, verified: result.verified, email: result.email})
    }
    return res.status(400).json({message: 'Error with Signup'})
    
}


export const DeliveryUserLogin =async (req: Request, res: Response, next: NextFunction) => {
    const loginInputs = plainToClass(UserLoginInputs, req.body);

    const loginErrors = await validate(loginInputs, {validationError: {target: false}});

    if(loginErrors.length > 0){
        return res.status(400).json(loginErrors);
    }
    const {email, password} = loginInputs;
    const user = await DeliveryUser.findOne({email: email});
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

export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user){
        const profile = await DeliveryUser.findById(user._id);

        if(profile){
            return res.status(200).json(profile);
        }
    }
    return res.status(400).json('You are unauthorized to view the profile')

}

export const EditDeliveryUserProfile = async (req:Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    const profileInputs = plainToClass(EditCustomerPrfoileInputs, req.body);

    const profileErrors = await validate(profileInputs, {validationError: { target: false}});
    
    if(profileErrors.length > 0){
        return res.status(400).json(profileErrors);
    }
    const {firstName, lastName, address} = profileInputs;

    if(user){
        const profile = await DeliveryUser.findById(user._id);

        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const saved = await profile.save();

            return res.status(200).json(saved)

    }
    return res.status(400).json('You are unauthorized to update the profile')
}
}

export const UpdateDeliveryUserStatus = async ( req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user){

        const { lat, lng} = req.body;

        const profile = await DeliveryUser.findById(user._id);

        if(profile){
            if (lat !== undefined && lng !== undefined) {
                profile.lat = lat;
                profile.lng = lng;
            }
            
            console.log(`Before toggle: ${profile.isAvailable}`);
            profile.isAvailable = !profile.isAvailable;
            console.log(`After toggle: ${profile.isAvailable}`);

            const result = await profile.save();

            return res.status(200).json(result);
        }
    }
    return res.status(400).json('Error with Update status')
}