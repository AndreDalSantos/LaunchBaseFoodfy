const express = require('express')
const routes = express.Router()

const visitors = require('../app/controllers/visitors')

routes.get('/', visitors.index)
routes.get('/recipes', visitors.showAllRecipes)
routes.get('/recipes/:id', visitors.showRecipe)
routes.get('/about', visitors.aboutPage)
routes.get('/all_chefs_views', visitors.chefs)

module.exports = routes
