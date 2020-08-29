const User = require('../models/User')
const Chef = require('../models/Chef')
const Recipe = require('../models/Recipe')
const RecipeFile = require('../models/RecipeFile')
const File = require('../models/File')
const { indexPaginate } = require('../services/services')

async function onlyAdmin(req, res, next){
    let results = await User.checkIfYouAreTheFirstUser()
    if(results){
        const userLogged = await User.findOne({
            where: { id: req.session.userId }
        })
        
        if( !userLogged.is_admin ){
            let { filter, page, limit } = req.query

            if(!filter || !page || !limit) {
                filter = ''
                page = 1
                limit = 12
            }
            
            const { users } = await indexPaginate({ filter, page, limit })
            
            if(users[0]){

                const pagination = {
                    total: Math.ceil(users[0].total / limit),
                    page
                }      

                return res.render('admin/list', { 
                    users, 
                    pagination, 
                    filter, 
                    userId: req.session.userId, 
                    error: 'Você não é um administrador'
                })

            } else {
                return res.render('admin/list')
            }
        }
    }
    next()
}

async function checkIfAdminOrMe(req, res, next){

    let id = ''
    if( req.params.id ) 
        id = req.params.id
    else
        id = req.body.id

    const userLogged = await User.findOne({
            where: { id: req.session.userId }
        })

    if( req.session.userId == id )
        return res.render('admin/profile', { user: userLogged })

    if( !userLogged.is_admin && id != req.session.userId ){
        try {
            let { filter, page, limit } = req.query

                page = page || 1
                limit = limit || 12
                let offset = limit * (page - 1)
        
                const params = {
                    filter,
                    page,
                    limit,
                    offset
                }
        
                let results = await User.paginate(params)
                const users = results.rows
        
                if(users[0]){
        
                    const pagination = {
                        total: Math.ceil(users[0].total / limit),
                        page
                    }                
        
                    return res.render('admin/list', { 
                        users, 
                        pagination, 
                        filter, 
                        userId: req.session.userId,
                        error: 'Somente administradores podem alterar dados de outros usuários'
                    })
        
                } else {
                    return res.render('admin/list')
                } 

        } catch(err){
            console.error(err)
            return res.render('admin/list', {
                error: 'Algum erro inseperado aconteceu.'
            })
        }
        // return res.render('admin/list', {
        //     error: 'Somente administradores podem alterar dados de outros usuários.'
        // })
    }

    next()
}

async function checkIfAdminOrMeToUpdateChefs(req, res, next){

    let id = ''
    if( req.params.id ) 
        id = req.params.id
    else
        id = req.body.id

    const userLogged = await User.findOne({
            where: { id: req.session.userId }
        })

    let checkIfChefExists = ''
    if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id))
        checkIfChefExists = await Chef.find(id)
    else 
        checkIfChefExists = false
    
    if(checkIfChefExists){

        const checkMyId = (await Chef.getUserId(id)).rows[0].user_id
    
        if(userLogged.id !== checkMyId && userLogged.is_admin === false){
    
            let { filter, page, limit } = req.query
    
                page = page || 1
                limit = limit || 12
                let offset = limit * (page - 1)
        
                const params = {
                    filter,
                    page,
                    limit,
                    offset
                }
        
                let results = await Chef.paginate(params)
                const chefs = results.rows
        
                if(chefs[0]){
        
                    const pagination = {
                        total: Math.ceil(chefs[0].total / limit),
                        page
                    }
    
                    let fileChef = []
    
                    for( i = 0; i < chefs.length; i++ ) {
                        fileChef[i] = (await File.fileFromChef(chefs[i].file_id)).rows[0]
    
                        chefs[i] = {
                            ...chefs[i],
                            avatar_url: `${req.protocol}://${req.headers.host}${fileChef[i].path.replace("public", "")}`
                        }
                    }
        
                    return res.render('chefs/index', { 
                        chefs, 
                        pagination, 
                        filter,
                        error: 'Somente Administradores podem modificar informações de outros usuários' 
                    })
        
                } else {
                    return res.render('chefs/index')
                } 
        }
        next()

    } else {
        return res.render('admin/error', { userId: req.session.userId })
    }
    
}

async function checkIfAdminOrMeToUpdateRecipes(req, res, next){

    let id = ''
    if( req.params.id ) 
        id = req.params.id
    else
        id = req.body.id

    const userLogged = await User.findOne({
            where: { id: req.session.userId }
        })

    let checkIfRecipeExists = ''

    if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id))
        checkIfRecipeExists = await Recipe.find(id)
    else 
        checkIfRecipeExists = false
    
    if(checkIfRecipeExists){
        const checkMyId = (await Recipe.getUserId(id)).rows[0].user_id

        if(userLogged.id !== checkMyId && userLogged.is_admin === false){
            
            let { filter, page, limit } = req.query

                page = page || 1
                limit = limit || 12
                let offset = limit * (page - 1)
        
                const params = {
                    filter,
                    page,
                    limit,
                    offset
                }
        
                let results = await Recipe.paginate(params)
                const recipes = results.rows
        
                if(recipes[0]){
        
                    const pagination = {
                        total: Math.ceil(recipes[0].total / limit),
                        page
                    }
        
                    results = await Recipe.selectChefs()
                    const chefs = results.rows
        
                    let changedRecipe = []
        
                    for(i = 0; i < recipes.length; i++){
        
                        results = await RecipeFile.allFromOneRecipe(recipes[i].id)
                        let recipeFile = results.rows[0]
        
                        results = await File.allFilesFromRecipeFile(recipeFile)
                        let file = results.rows[0]
        
                        file = {
                            ...file,
                            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                        }
        
                        changedRecipe[i] = {
                            ...recipes[i],
                            file
                        }
                    }
        
                    return res.render('admin/index', { 
                        recipes:changedRecipe, 
                        pagination, filter: 
                        params.filter, 
                        chefs,
                        error: 'Somente Administradores podem modificar informações de outros usuários'
                    })
        
                } else {
                    return res.render('admin/index') 
                } 
        }
        
        next()
    } else {
        return res.render('admin/error', { userId: req.session.userId })
    }
}

async function notMe(req, res, next){

    if(req.session.userId == req.body.id) {


        let { filter, page, limit } = req.query

            page = page || 1
            limit = limit || 12
            let offset = limit * (page - 1)
    
            const params = {
                filter,
                page,
                limit,
                offset
            }
    
            let results = await User.paginate(params)
            const users = results.rows
    
            if(users[0]){
    
                const pagination = {
                    total: Math.ceil(users[0].total / limit),
                    page
                }                
    
                return res.render('admin/list', { 
                    users, 
                    pagination, 
                    filter, 
                    userId: req.session.userId, 
                    error: 'Você não pode excluir sua própria conta.' 
                })
    
            } else {
                return res.render('admin/list')
            } 

        return res.render('admin/list', {
            error: 'Você não pode excluir sua própria conta.'
        })
    }
    next()
}

module.exports = {
    onlyAdmin,
    checkIfAdminOrMe,
    checkIfAdminOrMeToUpdateChefs,
    checkIfAdminOrMeToUpdateRecipes,
    notMe
}