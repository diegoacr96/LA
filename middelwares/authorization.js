const jwt = require('jsonwebtoken')

const BlackList = require('../models/blacklist')

const isLoggedIn = (req, res, next) => {
    const token = req.get('Authorization')

    //revisando si el token se encuentra en la blacklist de tokens cuya sesion ha finalizado
    BlackList.findOne({
        token: token
    })
    .then(token => {
        if(token){
            return res.status(401)
            .json({
                ok: false,
                err:{
                    message: "La sesión no se encuentra activa"
                }
            })
        }
        else{
            throw null
        }
    })
    .catch(() => {

        //autorizando en caso que el token no haya finalizado
        jwt.verify(token, "thisIsAPrivateKey", (err, decoded) => {
            if(err){
                return res.status(401)
                .json({
                    ok: false,
                    err: {
                        message: "No estás autorizado"
                    }
                })
            }
            req.user = decoded
            next()
        })
    })

    
}


module.exports = isLoggedIn