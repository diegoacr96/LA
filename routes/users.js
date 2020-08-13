const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Users = require('../models/users')

const usersRouter = express.Router()

/* Creando usuarios. */
usersRouter.route('/')
.post((req, res, next) => {
  const body = req.body

  //estableciendo valores del schema
  const user = Users({
    email: body.email,
    password: bcrypt.hashSync(body.password, 16)
  }) 

  //guardando usuario en la base de datos
  user.save() 
  .then(userDB => { // usuario creado con exito

    //generando token para mantener la sesión iniciada al crear el usuario
    const token = jwt.sign({email: userDB.email}, "thisIsAPrivateKey", {expiresIn: '1h'}); 

    //creando respuesta con información no sensible del usuario creado
    res.status(201)
    res.json({
      ok: true,
      userDB,
      token
    })
  })

  //manejando el error en determinado caso que no sea posible crear el usuario
  .catch(err => {
    res.status(409)
    res.json({
      ok: false,
      err: err.errors
    })
  })
})
.get((req, res, next) => {

})

module.exports = usersRouter
