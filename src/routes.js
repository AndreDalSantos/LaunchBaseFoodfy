const express = require('express')
const routes = express.Router()
const users = require('./app/controllers/users')
const admin = require('./app/controllers/admin')
const chefs = require('./app/controllers/chefs')


routes.get('/', users.init)
routes.get('/receitas', users.allRecipes)
routes.get('/receitas/:id', users.showRecipes)
routes.get('/sobre', users.about)

// Admin recipes:
routes.get('/admin/recipes', admin.index)
routes.get('/admin/recipes/create', admin.create)
routes.get('/admin/recipes/:id', admin.show)
routes.get('/admin/recipes/:id/edit', admin.edit)

routes.post('/admin/recipes', admin.post)
routes.put('/admin/recipes', admin.put)
routes.delete('/admin/recipes', admin.delete)

// Admin chefs:
routes.get('/chefs/index', chefs.index)
routes.get('/chefs/create', chefs.create)
routes.get('/chefs/:id', chefs.show)
routes.get('/chefs/:id/edit', chefs.edit)

routes.post('/chefs', chefs.post)
routes.put('/chefs', chefs.put)
routes.delete('/chefs', chefs.delete)


module.exports = routes