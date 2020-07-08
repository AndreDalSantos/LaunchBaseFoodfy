const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const chefs = require('../app/controllers/chefs')

const SessionValidator = require('../app/validators/session')
const { checkIfAdminOrMeToUpdateChefs } = require('../app/middlewares/session')


routes.get("/", SessionValidator.isReqSession, chefs.index); 
routes.get("/create", SessionValidator.isReqSession, chefs.create); 
routes.get("/:id", SessionValidator.isReqSession, chefs.show); 
routes.get("/:id/edit", checkIfAdminOrMeToUpdateChefs, SessionValidator.isReqSession, chefs.edit); 

routes.post("/", SessionValidator.isReqSession, multer.array('photos', 1), chefs.post); 
routes.put("/", SessionValidator.isReqSession, multer.array('photos', 1), chefs.put); 
routes.delete("/", checkIfAdminOrMeToUpdateChefs, SessionValidator.isReqSession, chefs.delete);

module.exports = routes