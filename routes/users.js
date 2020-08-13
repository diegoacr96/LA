const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const _ = require('underscore')

const Users = require('../models/users')
const isLoggedIn = require('../middelwares/authorization')

const usersRouter = express.Router()
const app = express()
/* Creando usuarios. */
usersRouter.route('/')
.post((req, res) => {
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


//Middleware de autorización para solo realizar operaciones si el usuario lo tiene permitido
usersRouter.use(isLoggedIn)

// manejando la actualización del usuario
usersRouter.route('/:id')
.put((req, res) => {
  const id= req.params.id
  const body= _.pick(req.body, "email")

  //Buscando usuario en la base de datos mediante el id
  Users.findById(id)
  .then(userDB => {

    //revisando el el usuario se encuentra activo
    if(userDB.active){

      //Realizando la actualización de los datos
      return Users.findByIdAndUpdate(id, body, {new: true})
    }

    //Manejando evento en el cual el usuario no se encuentra activo
    throw "usuario no activo"
  }) 
  .then(user =>{

    //retornando usuario actualizado
    return res.status(200).json({
      ok: true,
      user
    })
  })
  .catch(err => {
    return res.status(401).json({
      ok: true,
      err:{
        message: err
      }
    })
  })
})

//cambiando el estado del usuario
.delete((req, res) => {

})

module.exports = usersRouter
