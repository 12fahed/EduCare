const express = require('express');
const app = express();
const mongoose = require('mongoose');
const attendance = require('./attendance');

const port = 3000;

async function startApp() {
    try {
        await mongoose.connect('mongodb+srv://fahed:fahed12@admin.gd1pah0.mongodb.net/HTA');
        console.log("Database Is Connected");

        app.listen(port, () => console.log(`Example app listening on port ${port}!`));
        
        // Now perform your database query to fetch data from the existing "attendance" collection
        const attendData = await attendance.find({face_id: 10}, { _id: 0, attend: 1});
        console.log(attendData);

        // Sending data to the frontend
        app.get('/data', (req, res) => {
            res.send(attendData);
        });

    } catch (err) {
        console.error('Database connection error:', err);
    }
}

startApp();

