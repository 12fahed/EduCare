const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    date: String,
    time: String,
    face_id: Number,
    attend: Object
})

const collection = new mongoose.model("attendance", attendanceSchema)
module.exports = collection