import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Database';

const startServer = async () => {
    console.clear();
    const app = express();
    
    await dbConnection();

    await App(app);

    app.listen(9000, () => {
        console.log("Listening to 9000...");
    });
};

startServer();
