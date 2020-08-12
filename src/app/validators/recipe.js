const Recipe = require('../models/Recipe')

async function checkIfThereAreRecipes(req, res, next){
    const thereAreRecipe = await Recipe.checkIfThereIsAtLeastOne()
    
    if(!thereAreRecipe)
        return res.redirect('/admin/recipes/create')

    next()
}

module.exports = {
    checkIfThereAreRecipes
}