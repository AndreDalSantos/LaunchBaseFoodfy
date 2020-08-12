const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const recipes = require('../app/controllers/recipes')
const UserController = require('../app/controllers/UserController')
const SessionController = require('../app/controllers/SessionController')
const ProfileController = require('../app/controllers/ProfileController')

const UserValidator = require('../app/validators/user')
const SessionValidator = require('../app/validators/session')
const RecipeValidator = require('../app/validators/recipe')

const { onlyAdmin, checkIfAdminOrMe, checkIfAdminOrMeToUpdateRecipes, notMe } = require('../app/middlewares/session')

routes.get('/', (req, res) => {
    return res.redirect('/admin/recipes')
})

routes.get("/recipes", RecipeValidator.checkIfThereAreRecipes, SessionValidator.isReqSession, recipes.index); // Mostrar a lista de receitas
routes.get("/recipes/create", SessionValidator.isReqSession, recipes.create); // Mostrar formulário de nova receita
routes.get("/recipes/:id", SessionValidator.isReqSession, recipes.show); // Exibir detalhes de uma receita
routes.get("/recipes/:id/edit", checkIfAdminOrMeToUpdateRecipes, SessionValidator.isReqSession, recipes.edit); // Mostrar formulário de edição de receita

routes.post("/recipes", SessionValidator.isReqSession, multer.array('photos', 5), recipes.post); // Cadastrar nova receita
routes.put("/recipes", SessionValidator.isReqSession, multer.array('photos', 5), recipes.put); // Editar uma receita
routes.delete("/recipes", SessionValidator.isReqSession, recipes.delete); // Deletar uma receita

// login / logout
routes.get('/login', SessionValidator.checkIfThereAreUsers, SessionController.loginForm)
routes.post('/login', SessionValidator.login, SessionController.login)
routes.post('/logout', SessionController.logout)

// Rotas de perfil de um usuário logado
routes.get('/profile', SessionValidator.isReqSession, ProfileController.index) // Mostrar o formulário com dados do usuário logado
routes.put('/profile', SessionValidator.isReqSession, UserValidator.updateLoggedUser, ProfileController.put)// Editar o usuário logado

// // reset password / forgot
routes.get('/forgot-password', SessionController.forgotForm)
routes.get('/password-reset', SessionController.resetForm)
routes.post('/forgot-password', SessionValidator.forgot, SessionController.forgot)
routes.post('/password-reset', SessionValidator.reset, SessionController.reset)

// // Rotas que o administrador irá acessar para gerenciar usuários
routes.get('/users', SessionValidator.isReqSession, UserController.list) //Mostrar a lista de usuários cadastrados
routes.get('/users/register', onlyAdmin, UserController.registerForm)
routes.post('/users', onlyAdmin, UserValidator.post, UserController.post) //Cadastrar um usuário //ADMIN
routes.get('/users/edit/:id', checkIfAdminOrMe, UserController.show)
routes.put('/users', checkIfAdminOrMe, UserValidator.put, UserController.put) // Editar um usuário //ADMIN
routes.delete('/users', notMe, onlyAdmin, SessionValidator.isReqSession, UserController.delete) // Deletar um usuário //ADMIN

module.exports = routes