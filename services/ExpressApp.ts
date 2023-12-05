import express, { Application }from 'express';
import {AdminRoute, VandorRoute, ShoppingRoute, CustomerRoute, DeliveryRoute} from '../routes';
import bodyParser from 'body-parser';
import path from 'path';
import { logURL } from '../middlewares';


export default async (app: Application) => {
    app.use(express.json());
    app.use(bodyParser.urlencoded({extended: true}))
    app.use('/images', express.static(path.join(__dirname, 'images')))
    app.use(logURL)

    app.use('/admin', AdminRoute);
    app.use('/vandor', VandorRoute);
    app.use('/user', CustomerRoute);
    app.use('/delivery', DeliveryRoute);
    app.use(ShoppingRoute); 

}
