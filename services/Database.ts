import mongoose from 'mongoose';
import { LOCAL_DB_URI } from '../config';
import { Vandor } from '../models'; 

export default async () => {
  try {
    console.log('Connecting...');
    await mongoose.connect(LOCAL_DB_URI);
    console.log('DB Connected!');
    // console.log('DB Connection established. Fetching data to confirm...');

    // const data = await Vandor.find().limit(1);
    
    // if (data.length > 0) {
    //   console.log('Fetched some data. DB connected and accessible!');
    // } else {
    //   console.log('No data found, but DB connected. Data or query should be checked!');
    // }
  } catch (error) {
    console.log('Error connecting to DB:', error);
  }
}




