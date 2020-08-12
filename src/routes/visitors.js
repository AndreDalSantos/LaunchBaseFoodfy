const express = require('express')
const routes = express.Router()

const visitors = require('../app/controllers/visitors')

const VisitorValidator = require('../app/validators/visitors')

routes.get('/', VisitorValidator.checkIfThereAreRecipes, visitors.index)
routes.get('/recipes', VisitorValidator.checkIfThereAreRecipes, visitors.showAllRecipes)
routes.get('/recipes/:id', visitors.showRecipe)
routes.get('/about', visitors.aboutPage)
routes.get('/all_chefs_views', VisitorValidator.checkIfThereAreChefs, visitors.chefs)

module.exports = routes
