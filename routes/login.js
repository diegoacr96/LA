const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Users = require('../models/users')

const loginRouter = express.Router()

loginRouter.route('/')
.post((req, res, next) => {
    const body = req.body

    //buscando usuario por medio del email
    Users.findOne({email: body.email})
    .then(userDB => {

        //si el usuario es encontrado realiza un comparesync entre las contraseñas para saber si son la misma
        if(bcrypt.compareSync(body.password, userDB.password)){

            //Si las credenciales son correctas se realiza la respuesta del token
            const token = jwt.sign({email: userDB.email, id: userDB.id}, "thisIsAPrivateKey", {expiresIn: '1h'})
            res.status(200)
            res.json({
                ok: true,
                token
            })
        }
        else{

            //Manejo de credeciales incorrectas
            res.status(404)
            res.json({
                ok: false,
                err: {
                    message: "email o contraseña incorrectos"
                }
            })
        }
        
    })
    .catch(err => {

        //Manejo de credeciales incorrectas
        res.status(404)
        res.json({
            ok: false,
            err: {
                message: "email o contraseña incorrectos"
            }
        })
    })
    
})


module.exports = loginRouter