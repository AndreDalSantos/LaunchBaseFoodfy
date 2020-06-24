const express = require('express')
const routes = express.Router()
const multer = require('./app/middlewares/multer')
const users = require('./app/controllers/users')
const recipes = require('./app/controllers/recipes')
const chefs = require('./app/controllers/chefs')


routes.get('/', users.index)
routes.get('/recipes', users.showAllRecipes)
routes.get('/recipes/:id', users.showRecipe)
routes.get('/about', users.aboutPage)
routes.get('/all_chefs_views', users.chefs)

routes.get("/admin/recipes", recipes.index); // Mostrar a lista de receitas
routes.get("/admin/recipes/create", recipes.create); // Mostrar formulário de nova receita
routes.get("/admin/recipes/:id", recipes.show); // Exibir detalhes de uma receita
routes.get("/admin/recipes/:id/edit", recipes.edit); // Mostrar formulário de edição de receita

routes.post("/admin/recipes", multer.array('photos', 5), recipes.post); // Cadastrar nova receita
routes.put("/admin/recipes", multer.array('photos', 5), recipes.put); // Editar uma receita
routes.delete("/admin/recipes", recipes.delete); // Deletar uma receita


routes.get("/chefs", chefs.index); 
routes.get("/chefs/create", chefs.create); 
routes.get("/chefs/:id", chefs.show); 
routes.get("/chefs/:id/edit", chefs.edit); 

routes.post("/chefs", multer.array('photos', 1), chefs.post); 
routes.put("/chefs", multer.array('photos', 1), chefs.put); 
routes.delete("/chefs", chefs.delete);
module.exports = routes