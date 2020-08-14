const express = require('express')
const mqtt = require('mqtt');

const isLoggedIn = require('../middelwares/authorization')
const Message = require('../models/messages')

const messageRouter = express.Router()

messageRouter.use(isLoggedIn)


// Petición a la base de datos de los mensajes enviados
messageRouter.route('/')
.get((req, res) => {
  // Recibir query params para paginar lista de mensajes
  const limit = req.query.limit? parseInt(req.query.limit) : 10
  const page = req.query.page? parseInt(req.query.page) : 1
  // Peticion a la base de datos
  Message.find({})
  .limit(limit)
  .skip((page-1)*limit)
  .then(messages => {
    return res.status(200)
    .json({
      ok: true,
      messages,
      catFact: req.fact
    })
  })
  .catch(err => {
    return res.status(400)
    .json({
      ok: true,
      err
    })
  })
})


messageRouter.route('/send')
.post((req, res) => {
  const topic = req.body.topic
  const data = req.body.message
  const user = req.user.email

  const client = mqtt.connect('mqtt://mosquitto-prueba.u-wigo.com') //Estableciendo comunicación con el servidor mqtt

  client.on('connect', () => {
    client.subscribe(topic, (err) => {  //suscribiendo a topic
      if(!err) {
        client.publish(topic, data) //envio de mensaje

        // guardado de mensaje en la base de datos
        const message = Message({
          topic: topic,
          data: data,
          postedBy: user
        })
        message.save()
        .then(data => {
          return res.status(201)
          .json({
            ok: true,
            catFact: req.fact,
            data: data
          })
        })
        .catch(err => {
          return res.status(400)
          .json({
            ok: false,
            err: err
          })
        })
      }else{
        return res.status(400)
          .json({
            ok: false,
            err
          })
      }
    })
  })
})

module.exports = messageRouter;
