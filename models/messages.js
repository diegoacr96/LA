const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messagesSchema = new Schema({
    topic:{
        type: String,
        required: true,
    },
    data:{
        type: String,
        required: true,
    },
    postedBy:{
        type:String,
        required: true
    }
})

const Message = mongoose.model("Messages", messagesSchema)

module.exports = Message