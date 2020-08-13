const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true

    },
    password:{
        type: String,
        required: [true, "Password is required"]
    },
    state:{
        type: Boolean,
        default: true
    }
})

userSchema.methods.toJSON = function(){
    let userObject = this.toObject();
    delete userObject.password;
    return userObject
}

userSchema.plugin(uniqueValidator, {message: 'Error, {PATH} debe ser único.'})

const Users = mongoose.model("Users", userSchema)

module.exports = Users