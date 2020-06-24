const User = require('../models/User')
const File = require('../models/File')
const RecipeFile = require('../models/RecipeFile')
const Chef = require('../models/Chef')
const { date } = require('../../lib/utils')


module.exports = {
    async index(req, res){
        try {
            let { filter, page, limit } = req.query

            page = page || 1
            limit = limit || 6
            let offset = limit * (page - 1)
    
            const params = {
                filter,
                page,
                limit,
                offset
            }
    
            let results = await User.paginate(params)
            const recipes = results.rows
    
            if(recipes[0]){
    
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }
    
                results = await User.chefSelectOptions()
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

    
                return res.render('users/home', { recipes:changedRecipe, pagination, filter: params.filter, chefs })
    
            } else {
                return res.render('users/not-found') // OBS: mudar para not-found
            } 
        } catch(err){
            throw new Error(err)
        }
    },
    async showAllRecipes(req, res){
        try {
            let { filter, page, limit } = req.query

            page = page || 1
            limit = limit || 6
            let offset = limit * (page - 1)
    
            const params = {
                filter,
                page,
                limit,
                offset
            }
    
            let results = await User.paginate(params)
            const recipes = results.rows
    
            if(recipes[0]){
    
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }
    
                results = await User.chefSelectOptions()
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
    
                return res.render('users/recipes', { recipes:changedRecipe, pagination, filter: params.filter, chefs })
    
            } else {
                return res.render('users/not-found') // OBS: mudar para not-found
            } 
        } catch(err){
            throw new Error(err)
        }
        
    },
    async showRecipe(req, res){
        try {
            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id))
            {
                let result = await User.findRecipe(req.params.id) 
                let recipe = result.rows[0]
    
                if(!recipe) return res.render('users/not-found')
    
                result = await User.getChefName(recipe.chef_id)
                let chef = result.rows[0]
    
                result = await RecipeFile.allFromOneRecipe(recipe.id)
                const recipeFiles = result.rows
    
                let files = []
    
                for (let i = 0; i < recipeFiles.length; i++) {
                    result = await File.allFilesFromRecipeFile(recipeFiles[i])
                    files[i] = result.rows[0]
                }
    
                files = files.map(file => ({
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }))
                
                return res.render('users/view_recipe', { recipe, chef, files })
    
            }
            else {
                return res.render('users/not-found')
            }
        } catch(err){
            throw new Error(err)
        }
    },
    aboutPage(req, res){
        return res.render('users/about')
    },
    async chefs(req, res){
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

                let totalRecipes = []

                for ( i = 0; i < chefs.length; i++ ) {
                    results = await Chef.find(chefs[i].id)
                    totalRecipes[i] = results.rows[0].total_recipes
                    
                    chefs[i] = {
                        ...chefs[i],
                        total_recipes: totalRecipes[i]
                    }
                }
    
                return res.render('users/chefs', { chefs, pagination, filter })
    
            } else {
                return res.render('users/chefs')
            } 
        } catch(err){
            throw new Error(err)
        }  
    }
}