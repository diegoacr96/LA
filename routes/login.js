const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Users = require('../models/users')
const BlackList = require('../models/blacklist')
const isLoggedIn = require('../middelwares/authorization')

const loginRouter = express.Router()

loginRouter.route('/')
.post((req, res, next) => {
    const body = req.body

    //buscando usuario por medio del email
    Users.findOne({email: body.email})
    .then(userDB => {
        if(!userDB) throw "email o contraseña incorrectos"

        //si el usuario es encontrado realiza un comparesync entre las contraseñas para saber si son la misma
        if(bcrypt.compareSync(body.password, userDB.password)){

            //Si las credenciales son correctas se realiza la respuesta del token
            const token = jwt.sign({email: userDB.email, id: userDB.id}, "thisIsAPrivateKey", {expiresIn: '1h'})
            res.status(200)
            res.json({
                ok: true,
                catFact: req.fact,
                token
            })
        }
        else{
            throw "email o contraseña incorrectos"
        }
        
    })
    .catch(err => {

        //Manejo de credeciales incorrectas
        res.status(404)
        res.json({
            ok: false,
            err:{
                message: err
            }
        })
    })
    
})


//logout del usuario
loginRouter.use(isLoggedIn)
loginRouter.route('')
.get((req, res) => {
  const token = req.get('Authorization')

  //Añadiendo el token a la blacklist
  const blackList = BlackList({
    token:  token
  })

  blackList.save()
  .then(() => {
    res.status(200)
    .json({
      ok: true,
      catFact: req.fact,
      message: "sesion finalizada"
    })
  })
  .catch(err => {
    res.status(400)
    .json({
      ok: true,
      err
    })
  })
})


module.exports = loginRouter