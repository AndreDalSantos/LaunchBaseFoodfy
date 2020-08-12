const Chef = require('../models/Chef')

async function checkIfThereAreChefs(req, res, next){
    const thereAreChef = await Chef.checkIfThereIsAtLeastOne()
    
    if(!thereAreChef)
        return res.redirect('/chefs/create')

    next()
}

module.exports = {
    checkIfThereAreChefs
}