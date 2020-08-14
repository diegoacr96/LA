const express = require('express')
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://mosquitto-prueba.u-wigo.com')


const isLoggedIn = require('../middelwares/authorization')
const Message = require('../models/messages')

const messageRouter = express.Router()

messageRouter.use(isLoggedIn)

messageRouter.route('/send')
.post((req, res) => {
  const topic = req.body.topic
  const data = req.body.message
  const user = req.user.email

  client.on('connect', () => {
    client.subscribe(topic, (err) => {
        if(!err) client.publish(topic, data)
    })
  })

/*   client.on('message', (topic, message) => {
      console.log(message.toString())
      client.end()
  }) */


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
})

module.exports = messageRouter;
