const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://fahed:fahed12@admin.gd1pah0.mongodb.net/HTA")
.then(()=>{
    console.log("Mongo DB Connected");
})
.catch(()=>{
    console.log("Failed To Connect");
})


const LogInScheama = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
})

const collection = new mongoose.model("userInfo", LogInScheama)

module.exports = collection

