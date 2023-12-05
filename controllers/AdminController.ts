import { Request, Response, NextFunction } from 'express'
import { CreateVandorInput } from '../dto';
import { GeneratePassword, GenerateSalt } from '../utility';
import {DeliveryUser, Transaction, Vandor} from '../models'
 
export const FindVandor = async (id: String | undefined, email?: string) => {

    if(email){
        return await Vandor.findOne({ email: email})
    }else{
        return await Vandor.findById(id);
    }

}


export const CreateVandor = async (req: Request, res: Response, next: NextFunction) => {

    const { name, address, pincode, foodType, email, password, ownerName, phone }  = <CreateVandorInput>req.body;
    

    const existingVandor = await FindVandor('', email);

    if(existingVandor !== null){
        return res.json({ "message": "A vandor is exist with this email ID"})
    }


    //generate a salt

    const salt =  await GenerateSalt()
    console.log("Password", password)
    console.log("Phone", phone)
    const userPassword = await GeneratePassword(password, salt);

    // encrypt the password using the salt
    

    const createdVandor =  await Vandor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        salt: salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        lat: 0,
        lng: 0
    })

    return res.json(createdVandor)

}



export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {

    const Vandors = await Vandor.find()

    if(Vandors !== null){
        return res.json(Vandors)
    }

    return res.json({"message": "Vandors data not available"})
    

}




export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) => {

    const VandorId = req.params.id;

    const Vandor = await FindVandor(VandorId);

    if(Vandor !== null){
        return res.json(Vandor)
    }

    return res.json({"message": "Vandors data not available"})

}


export const GetTransactions = async (req: Request, res: Response, next: NextFunction) => {

    const transactions = await Transaction.find()

    if(transactions !== null){
        return res.json(transactions)
    }

    return res.json({"message": "Transaction data not available"})
    

}




export const GetTransactionByID = async (req: Request, res: Response, next: NextFunction) => {

    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if(transaction !== null){
        return res.json(transaction)
    }

    return res.json({"message": "Transaction-s data not available"})

}

export const VerifyDeliveryUser = async (req: Request, res: Response, next: NextFunction) => {

    const {_id, status} = req.body;

    if(_id){
        const deliveryUser = await DeliveryUser.findById(_id);

        if(deliveryUser){
            deliveryUser.verified = status;

            const result = await deliveryUser.save()

            return res.status(200).json(result)
        }
    }
    return res.json({"message": "User data not available"})
    
}

export const GetDeliveryUsers = async ( req: Request, res: Response, next: NextFunction) => {
    const deliveryUsers = await DeliveryUser.find();
    if(deliveryUsers){
        return res.status(200).json(deliveryUsers);
    }
    return res.json({"message": "Users data not available"}) 
}