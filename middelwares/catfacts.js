const axios = require('axios')

const catFacts = (req, res, next) => {
    axios.get('https://catfact.ninja/fact')
    .then(fact => {
        req.fact = fact.data.fact
        next();
    })
}

module.exports = catFacts