const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema

const blackListSchema = new Schema({
    token:{
        type: String,
        required: true,
        unique: true
    }
})

blackListSchema.plugin(uniqueValidator)

const BlackList = mongoose.model("BlackList", blackListSchema)

module.exports = BlackList