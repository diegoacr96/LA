const jwt = require('jsonwebtoken')

const isLoggedIn = (req, res, next) => {
    const token = req.get('Authorization')
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
}


module.exports = isLoggedIn