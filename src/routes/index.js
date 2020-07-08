const express = require('express')
const routes = express.Router()

const visitors = require('./visitors')
const admin = require('./admin')
const chefs = require('./chefs')

routes.use('/', visitors)
routes.use('/admin', admin)
routes.use('/chefs', chefs)

module.exports = routes