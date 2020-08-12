const Recipe = require('../models/Recipe')
const Chef = require('../models/Chef')

async function checkIfThereAreRecipes(req, res, next){
    const thereAreRecipe = await Recipe.checkIfThereIsAtLeastOne()
    
    if(!thereAreRecipe)
        return res.render('visitors/home', {
            userId: req.session.userId,
            error: 'Ainda não foram criadas receitas'
        })

    next()
}

async function checkIfThereAreChefs(req, res, next){
    const thereAreChef = await Chef.checkIfThereIsAtLeastOne()
    
    if(!thereAreChef)
        return res.render('visitors/home', {
            userId: req.session.userId,
            error: 'Ainda não existem chefs cadastrados'
        })

    next()
}

module.exports = {
    checkIfThereAreRecipes,
    checkIfThereAreChefs
}