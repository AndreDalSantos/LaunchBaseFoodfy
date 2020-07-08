const Visitor = require('../models/Visitor')
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
    
            let results = await Visitor.paginate(params)
            let recipes = results.rows
    
            if(recipes[0]){
    
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }
    
                results = await Visitor.selectChefs()
                const chefs = results.rows

                const recipesPromise = recipes.map(async recipe => {
                    results = await RecipeFile.allFromOneRecipe(recipe.id)
                    let recipeFile = results.rows[0]

                    results = await File.allFilesFromRecipeFile(recipeFile)
                    let file = results.rows[0]

                    file = {
                        ...file,
                        src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                    }

                    recipe = {
                        ...recipe,
                        file
                    }
                    
                    return recipe
                })

                recipes = await Promise.all(recipesPromise)
    
                return res.render('visitors/home', { recipes, pagination, filter: params.filter, chefs })
    
            } else {
                return res.render('visitors/home') 
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
    
            let results = await Visitor.paginate(params)
            let recipes = results.rows
    
            if(recipes[0]){
    
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }
    
                results = await Visitor.selectChefs()
                const chefs = results.rows

                const recipesPromise = recipes.map(async recipe => {
                    results = await RecipeFile.allFromOneRecipe(recipe.id)
                    let recipeFile = results.rows[0]

                    results = await File.allFilesFromRecipeFile(recipeFile)
                    let file = results.rows[0]

                    file = {
                        ...file,
                        src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                    }

                    recipe = {
                        ...recipe,
                        file
                    }
                    
                    return recipe
                })

                recipes = await Promise.all(recipesPromise)
    
                return res.render('visitors/recipes', { recipes, pagination, filter: params.filter, chefs })
    
            } else {
                return res.render('visitors/recipes') 
            } 
        } catch(err){
            throw new Error(err)
        }
        
    },
    async showRecipe(req, res){
        try {
            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id))
            {
                let result = await Visitor.findRecipe(req.params.id) 
                let recipe = result.rows[0]
    
                if(!recipe) return res.render('visitors/home')
    
                result = await Visitor.getChefName(recipe.chef_id)
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
                
                return res.render('visitors/view_recipe', { recipe, chef, files })
    
            }
            else {
                return res.render('visitors/home')
            }
        } catch(err){
            throw new Error(err)
        }
    },
    aboutPage(req, res){
        return res.render('visitors/about')
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
    
                return res.render('visitors/chefs', { chefs, pagination, filter })
    
            } else {
                return res.render('visitors/chefs')
            } 
        } catch(err){
            throw new Error(err)
        }  
    }
}