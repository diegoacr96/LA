const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const _ = require('underscore')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const Users = require('../models/users')
const BlackList = require('../models/blacklist')
const isLoggedIn = require('../middelwares/authorization')


//multer configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
      const now = new Date().toISOString(); 
      const date = now.replace(/:/g, '-');

      // Guardando el nombre de la imagen para almacenarla en la base de datos
      file.nameId= date + file.originalname
      cb(null, file.nameId);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") cb(null, true)
  else cb(null, false)
}

const upload = multer({
  storage: storage, 
  limits: {
    fileSize: 1024 * 1024
  },
  fileFilter: fileFilter
})



/****************************************************************************
  Endpoints
*****************************************************************************/


const usersRouter = express.Router()
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
      user: userDB,
      catFact: req.fact,
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

usersRouter.route('/:id')
// Solicitando información sobre un usuario
.get((req, res) => {

  //Verificar si el usuario es diferente al que se encuentra autenticado
  let id = req.params.id === "me"? req.user.id: req.params.id
  Users.findById(id)
  .then((userDB) => {
    return res.status(200)
    .json({
      ok: true,
      catFact: req.fact,
      user: userDB
    })
  })
  .catch(err => {
    return res.status(400)
    .json({
      ok: false,
      err
    })
  })
})

// manejando la actualización del usuario
.put((req, res) => {
  const id= req.params.id
  const body= _.pick(req.body, "email", "active", "visible")

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
  .then(userDB =>{

    //retornando usuario actualizado
    return res.status(200).json({
      ok: true,
      catFact: req.fact,
      user: userDB
    })
  })
  .catch(err => {
    return res.status(304).json({
      ok: false,
      err:{
        message: err
      }
    })
  })
})

//cambiando el estado del usuario
.delete((req, res) => {

  //obteniendo id del usuario a eliminar
  const id = req.params.id

  //Pasando ele stado del usuario a inactivo
  Users.findByIdAndUpdate(id, {
    active: false,
    visible: false
  }, {new: true})
  .then(userDB => {

    //retornando usuario actualizado
    return res.status(200)
    .json({
      ok: true,
      catFact: req.fact,
      user: userDB
    })
  })
  .catch( err => {

    //manejando errores
    return res.status(304)
    .json({
      ok: false,
      err:{
        message: err
      }
    })
  })
})


//Cambio de active del usuario
usersRouter.route('/:id/set/status/active/:active')
.patch((req, res) => {
  const id= req.params.id
  const active= req.params.active

  //validación de información recibida
  if(active != "true" && active != "false"){
    return res.status(400)
    .json({
      ok: false,
      err:{
        message: "active debe ser true o false"
      }
    })
  }
  //actualizando usuario
  Users.findByIdAndUpdate(id, {
    active: active,
  }, {new: true})
  .then(userDB => {

    //manejo de actualización exitosa
    return res.status(200)
    .json({
      ok: true,
      catFact: req.fact,
      user: userDB
    })
  })
  .catch(err => {

    //manejo de error
    return res.status(400)
    .json({
      ok: true,
      err:{
        message: err
      }
    })
  })
})

//cambio del visible del usuario
usersRouter.route('/:id/set/status/visible/:visible')
.patch((req, res) => {
  const id = req.params.id
  const visible = req.params.visible

  //validación de información recibida
  if(visible != "true" && visible != "false"){
    return res.status(400)
    .json({
      ok: false,
      err:{
        message: "visible debe ser true o false"
      }
    })
  }

  //Actualizando estado visible
  Users.findByIdAndUpdate(id, {
    visible: visible
  },
  {new: true})
  .then(userDB => {
    return res.status(200)
    .json({
      ok: true,
      catFact: req.fact,
      user: userDB
    })
    .catch(err => {
      return res.status(400)
      .json({
        ok: false,
        err:{
          message: err
        }
      })
    })
  })
})

usersRouter.use(upload.single('profilePic'))
usersRouter.route('/:id/set/image/')
.patch((req, res) => {
  const id=req.params.id
  const file = req.file
  Users.findByIdAndUpdate(id, {
    img: file.nameId
  }, {new: true})
  .then(uploaded => {
    return res.status(200)
    .json({
      ok: true,
      catFact: req.fact,
      user: uploaded
    })
  })
  .catch(err => {
    return res.json({
      ok: false,
      err: {
        message: err
      }
    })
  })
})

module.exports = usersRouter
